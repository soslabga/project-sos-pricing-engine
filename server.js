const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const ROLE_LABELS = {
  admin: '운영 관리자',
  user: '일반 사용자',
  member: '공유오피스 이용자'
};

const sessions = new Map();

const seed = {
  users: [
    { id: 'u_admin', name: '운영 관리자', email: 'admin@soslab.co', password: 'admin1234', role: 'admin', createdAt: now() },
    { id: 'u_user', name: '일반 사용자', email: 'user@soslab.co', password: 'user1234', role: 'user', createdAt: now() },
    { id: 'u_member', name: '공유오피스 이용자', email: 'member@soslab.co', password: 'member1234', role: 'member', createdAt: now() }
  ],
  rooms: [
    { id: 'office-1', type: 'project-room', name: 'P-101 1인 프로젝트룸', capacity: 1, branch: '분당 표준점', price: 410000, status: 'active' },
    { id: 'office-2', type: 'project-room', name: 'P-202 2인 프로젝트룸', capacity: 2, branch: '분당 표준점', price: 620000, status: 'active' },
    { id: 'office-4a', type: 'project-room', name: 'P-401 4인 프로젝트룸', capacity: 4, branch: '분당 표준점', price: 1230000, status: 'active' },
    { id: 'office-4b', type: 'project-room', name: 'P-402 4인 프로젝트룸', capacity: 4, branch: '판교 참고점', price: 2000000, status: 'active' },
    { id: 'meeting-4', type: 'meeting-room', name: 'M-4 4인 회의실', capacity: 4, branch: '분당 표준점', price: 30000, status: 'active' },
    { id: 'meeting-6', type: 'meeting-room', name: 'M-6 6인 회의실', capacity: 6, branch: '분당 표준점', price: 45000, status: 'active' }
  ],
  bookings: [
    {
      id: 'b_seed_1',
      userId: 'u_member',
      roomId: 'office-4a',
      type: 'project-room',
      startDate: today(),
      endDate: addDays(30),
      amount: 1230000,
      paymentStatus: 'paid',
      serviceStatus: 'active',
      createdAt: now(),
      memo: '데모 결제 완료 예약'
    }
  ]
};

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function migrateDemoEmails(store) {
  const replacements = {
    'admin@sos.co.kr': 'admin@soslab.co',
    'user@sos.co.kr': 'user@soslab.co',
    'member@sos.co.kr': 'member@soslab.co'
  };
  let changed = false;
  for (const user of store.users || []) {
    const next = replacements[String(user.email || '').toLowerCase()];
    if (next) {
      user.email = next;
      changed = true;
    }
  }
  return changed;
}

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return;
  }
  const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  if (migrateDemoEmails(store)) saveStore(store);
}

function loadStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function saveStore(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(payload);
}

function sendJson(res, status, body) {
  send(res, status, body, { 'Content-Type': 'application/json; charset=utf-8' });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) reject(new Error('요청 본문이 너무 큼'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('JSON 형식이 아님'));
      }
    });
    req.on('error', reject);
  });
}

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return '';
}

function getAuth(req, store) {
  const token = getToken(req);
  const userId = sessions.get(token);
  if (!userId) return null;
  return store.users.find(user => user.id === userId) || null;
}

function requireAuth(req, res, store) {
  const user = getAuth(req, store);
  if (!user) {
    sendJson(res, 401, { error: '로그인이 필요함' });
    return null;
  }
  return user;
}

function requireAdmin(req, res, store) {
  const user = requireAuth(req, res, store);
  if (!user) return null;
  if (user.role !== 'admin') {
    sendJson(res, 403, { error: '운영 관리자 권한이 필요함' });
    return null;
  }
  return user;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || user.role,
    createdAt: user.createdAt
  };
}

function enrichBooking(booking, store) {
  const user = store.users.find(item => item.id === booking.userId);
  const room = store.rooms.find(item => item.id === booking.roomId);
  return {
    ...booking,
    userName: user ? user.name : '알 수 없음',
    userEmail: user ? user.email : '',
    roomName: room ? room.name : '삭제된 공간',
    branch: room ? room.branch : '',
    capacity: room ? room.capacity : 0
  };
}

function amountForRoom(room, startDate, endDate) {
  if (room.type === 'meeting-room') return room.price;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.max(1, Math.ceil((end - start) / 86400000));
  if (days <= 7) return Math.round(room.price * 0.35);
  if (days <= 31) return room.price;
  return Math.round(room.price * days / 30);
}

function isBookingAllowed(user, room) {
  if (room.type === 'project-room') return ['admin', 'user', 'member'].includes(user.role);
  if (room.type === 'meeting-room') return ['admin', 'member'].includes(user.role);
  return false;
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackErr, fallback) => {
        if (fallbackErr) return send(res, 404, 'Not found');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallback);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.svg': 'image/svg+xml; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleApi(req, res) {
  const store = loadStore();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  try {
    if (method === 'POST' && url.pathname === '/api/login') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = store.users.find(item => item.email.toLowerCase() === email && item.password === password);
      if (!user) return sendJson(res, 401, { error: '이메일 또는 비밀번호가 맞지 않음' });
      const token = crypto.randomBytes(24).toString('hex');
      sessions.set(token, user.id);
      return sendJson(res, 200, { token, user: publicUser(user) });
    }

    if (method === 'POST' && url.pathname === '/api/logout') {
      sessions.delete(getToken(req));
      return sendJson(res, 200, { ok: true });
    }

    if (method === 'GET' && url.pathname === '/api/me') {
      const user = requireAuth(req, res, store);
      if (!user) return;
      return sendJson(res, 200, { user: publicUser(user) });
    }

    if (method === 'GET' && url.pathname === '/api/bootstrap') {
      const user = requireAuth(req, res, store);
      if (!user) return;
      const visibleRooms = store.rooms.filter(room => room.status === 'active' && (room.type === 'project-room' || user.role !== 'user'));
      const ownBookings = store.bookings.filter(item => item.userId === user.id).map(item => enrichBooking(item, store));
      const payload = { user: publicUser(user), rooms: visibleRooms, myBookings: ownBookings };
      if (user.role === 'admin') {
        payload.users = store.users.map(publicUser);
        payload.bookings = store.bookings.map(item => enrichBooking(item, store));
        payload.paidBookings = payload.bookings.filter(item => item.paymentStatus === 'paid');
      }
      return sendJson(res, 200, payload);
    }

    if (method === 'POST' && url.pathname === '/api/users') {
      const body = await parseBody(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '').trim();
      if (!name || !email || password.length < 6) return sendJson(res, 400, { error: '이름, 이메일, 6자 이상 비밀번호가 필요함' });
      if (store.users.some(user => user.email.toLowerCase() === email)) return sendJson(res, 409, { error: '이미 등록된 이메일임' });
      const user = { id: `u_${Date.now()}`, name, email, password, role: 'user', createdAt: now() };
      store.users.push(user);
      saveStore(store);
      return sendJson(res, 201, { user: publicUser(user) });
    }

    if (method === 'POST' && url.pathname === '/api/bookings') {
      const user = requireAuth(req, res, store);
      if (!user) return;
      const body = await parseBody(req);
      const room = store.rooms.find(item => item.id === body.roomId && item.status === 'active');
      if (!room) return sendJson(res, 404, { error: '공간을 찾을 수 없음' });
      if (!isBookingAllowed(user, room)) return sendJson(res, 403, { error: '해당 공간 예약 권한이 없음' });
      const startDate = String(body.startDate || today());
      const endDate = room.type === 'meeting-room' ? startDate : String(body.endDate || addDays(30));
      const booking = {
        id: `b_${Date.now()}`,
        userId: user.id,
        roomId: room.id,
        type: room.type,
        startDate,
        endDate,
        amount: amountForRoom(room, startDate, endDate),
        paymentStatus: 'pending',
        serviceStatus: 'reserved',
        createdAt: now(),
        memo: String(body.memo || '').trim()
      };
      store.bookings.unshift(booking);
      saveStore(store);
      return sendJson(res, 201, { booking: enrichBooking(booking, store) });
    }

    if (method === 'PATCH' && url.pathname.startsWith('/api/bookings/')) {
      const user = requireAuth(req, res, store);
      if (!user) return;
      const id = url.pathname.split('/').pop();
      const booking = store.bookings.find(item => item.id === id);
      if (!booking) return sendJson(res, 404, { error: '예약을 찾을 수 없음' });
      const body = await parseBody(req);

      if (body.action === 'mark-paid') {
        if (booking.userId !== user.id && user.role !== 'admin') return sendJson(res, 403, { error: '본인 예약만 결제 처리 가능함' });
        booking.paymentStatus = 'paid';
        booking.serviceStatus = 'active';
        booking.paidAt = now();
      } else if (body.action === 'cancel') {
        if (booking.userId !== user.id && user.role !== 'admin') return sendJson(res, 403, { error: '본인 예약만 취소 가능함' });
        booking.serviceStatus = 'cancelled';
      } else if (body.action === 'complete-service') {
        if (user.role !== 'admin') return sendJson(res, 403, { error: '운영 관리자만 처리 가능함' });
        booking.serviceStatus = 'completed';
      } else {
        return sendJson(res, 400, { error: '지원하지 않는 예약 작업임' });
      }
      saveStore(store);
      return sendJson(res, 200, { booking: enrichBooking(booking, store) });
    }

    if (method === 'PATCH' && url.pathname.startsWith('/api/users/')) {
      const admin = requireAdmin(req, res, store);
      if (!admin) return;
      const id = url.pathname.split('/').pop();
      const target = store.users.find(item => item.id === id);
      if (!target) return sendJson(res, 404, { error: '사용자를 찾을 수 없음' });
      const body = await parseBody(req);
      if (body.action === 'promote-member') target.role = 'member';
      else if (body.action === 'demote-user') target.role = 'user';
      else return sendJson(res, 400, { error: '지원하지 않는 사용자 작업임' });
      target.updatedAt = now();
      saveStore(store);
      return sendJson(res, 200, { user: publicUser(target) });
    }

    return sendJson(res, 404, { error: 'API를 찾을 수 없음' });
  } catch (err) {
    return sendJson(res, 500, { error: err.message || '서버 오류' });
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return handleApi(req, res);
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  ensureStore();
  console.log(`Project SOS operations server running on http://localhost:${PORT}`);
});


