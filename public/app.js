const state = {
  token: localStorage.getItem('sos_token') || '',
  user: null,
  rooms: [],
  myBookings: [],
  users: [],
  bookings: [],
  paidBookings: [],
  error: ''
};

const roleText = {
  admin: '운영 관리자',
  user: '일반 사용자',
  member: '공유오피스 이용자'
};

const paymentText = {
  pending: '결제 대기',
  paid: '결제 완료'
};

const serviceText = {
  reserved: '예약 접수',
  active: '이용 중',
  completed: '이용 완료',
  cancelled: '취소'
};

const app = document.getElementById('app');

function won(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

function fmtDate(value) {
  if (!value) return '-';
  return value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '요청 처리 실패');
  return data;
}

async function login(email, password) {
  const data = await api('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('sos_token', data.token);
  await loadBootstrap();
}

async function logout() {
  try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
  localStorage.removeItem('sos_token');
  Object.assign(state, { token: '', user: null, rooms: [], myBookings: [], users: [], bookings: [], paidBookings: [], error: '' });
  render();
}

async function register() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  try {
    await api('/api/users', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    await login(email, password);
  } catch (err) {
    state.error = err.message;
    renderLogin();
  }
}

async function loadBootstrap() {
  const data = await api('/api/bootstrap');
  state.user = data.user;
  state.rooms = data.rooms || [];
  state.myBookings = data.myBookings || [];
  state.users = data.users || [];
  state.bookings = data.bookings || [];
  state.paidBookings = data.paidBookings || [];
  state.error = '';
  render();
}

async function createBooking(roomId) {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const memo = document.getElementById('memo').value;
  try {
    await api('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ roomId, startDate, endDate, memo })
    });
    await loadBootstrap();
  } catch (err) {
    alert(err.message);
  }
}

async function bookingAction(id, action) {
  try {
    await api(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
    await loadBootstrap();
  } catch (err) {
    alert(err.message);
  }
}

async function userAction(id, action) {
  try {
    await api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
    await loadBootstrap();
  } catch (err) {
    alert(err.message);
  }
}

function setDemo(email, password) {
  document.getElementById('email').value = email;
  document.getElementById('password').value = password;
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <h1>Project SOS</h1>
        <div class="sub">무인 예약 · 결제 상태 관리 · 권한 운영 시스템</div>
        <form class="form-grid" onsubmit="event.preventDefault(); login(email.value, password.value).catch(err => { state.error = err.message; renderLogin(); })">
          <div>
            <label for="email">이메일</label>
            <input id="email" type="email" autocomplete="username" value="admin@soslab.co">
          </div>
          <div>
            <label for="password">비밀번호</label>
            <input id="password" type="password" autocomplete="current-password" value="admin1234">
          </div>
          <button type="submit">로그인</button>
          <div class="error">${escapeHtml(state.error)}</div>
        </form>
        <div class="demo-grid">
          <button class="demo-account" onclick="setDemo('admin@soslab.co','admin1234')">운영 관리자 데모</button>
          <button class="demo-account" onclick="setDemo('user@soslab.co','user1234')">일반 사용자 데모</button>
          <button class="demo-account" onclick="setDemo('member@soslab.co','member1234')">공유오피스 이용자 데모</button>
        </div>
        <div class="panel">
          <h3>신규 일반 사용자 등록</h3>
          <div class="form-grid">
            <div><label>이름</label><input id="registerName" placeholder="예: 홍길동"></div>
            <div><label>이메일</label><input id="registerEmail" type="email" placeholder="name@example.com"></div>
            <div><label>비밀번호</label><input id="registerPassword" type="password" placeholder="6자 이상"></div>
            <button class="secondary" onclick="register()">일반 사용자로 가입</button>
          </div>
        </div>
      </section>
      <section class="login-visual">
        <div class="copy">
          <h2>작은 면적으로 운영하는 소형 프로젝트룸 예약 시스템</h2>
          <p>PG 연동 전 단계의 MVP임. 예약, 결제 완료 상태, 이용자 권한 전환, 공유오피스 이용자 전용 회의실 예약 흐름을 먼저 검증함.</p>
        </div>
      </section>
    </main>`;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="logo">SOS</div>
        <div>
          <div class="brand-title">Project SOS 운영 시스템</div>
          <div class="brand-sub">무인예약 · 권한관리 · 결제완료 관리</div>
        </div>
      </div>
      <div class="userbox">
        <span class="role-pill">${roleText[state.user.role]}</span>
        <strong>${escapeHtml(state.user.name)}</strong>
        <button class="secondary" onclick="logout()">로그아웃</button>
      </div>
    </header>`;
}

function renderKpis() {
  const projectRooms = state.rooms.filter(room => room.type === 'project-room').length;
  const meetingRooms = state.rooms.filter(room => room.type === 'meeting-room').length;
  const paidCount = state.myBookings.filter(item => item.paymentStatus === 'paid').length;
  const totalPaid = (state.user.role === 'admin' ? state.paidBookings : state.myBookings.filter(item => item.paymentStatus === 'paid'))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return `
    <section class="kpis">
      <div class="kpi"><div class="label">예약 가능 프로젝트룸</div><div class="value">${projectRooms}</div></div>
      <div class="kpi"><div class="label">회의실</div><div class="value">${meetingRooms}</div></div>
      <div class="kpi good"><div class="label">결제 완료 예약</div><div class="value">${paidCount}</div></div>
      <div class="kpi warn"><div class="label">결제 완료 금액</div><div class="value">${won(totalPaid)}</div></div>
    </section>`;
}

function renderHero() {
  const adminCopy = state.user.role === 'admin'
    ? '운영 관리자는 결제 완료 예약을 확인하고, 일반 사용자를 공유오피스 이용자로 전환할 수 있음.'
    : state.user.role === 'member'
      ? '공유오피스 이용자는 프로젝트룸 예약과 함께 내부 회의실 예약 권한이 있음.'
      : '일반 사용자는 프로젝트룸 예약과 결제 완료 처리까지 가능함. 관리자가 공유오피스 이용자로 전환하면 회의실 예약 권한이 추가됨.';
  return `
    <section class="hero">
      <div class="panel">
        <h2>운영 기준</h2>
        <div class="notice">${adminCopy}</div>
      </div>
      <div class="panel">
        <h2>권한 구조</h2>
        <div class="grid-3">
          <div><strong>운영 관리자</strong><br><span class="tag">결제 완료 관리</span><span class="tag">권한 전환</span></div>
          <div><strong>일반 사용자</strong><br><span class="tag">프로젝트룸 예약</span><span class="tag">결제 처리</span></div>
          <div><strong>공유오피스 이용자</strong><br><span class="tag">프로젝트룸</span><span class="tag green">회의실 예약</span></div>
        </div>
      </div>
    </section>`;
}

function renderBookingForm() {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return `
    <div class="panel">
      <h2>예약 조건</h2>
      <div class="form-grid">
        <div><label>시작일</label><input id="startDate" type="date" value="${today}"></div>
        <div><label>종료일</label><input id="endDate" type="date" value="${nextMonth}"></div>
        <div><label>요청사항</label><textarea id="memo" placeholder="입실 안내, 주소지 등록 여부, 세금계산서 요청 등"></textarea></div>
      </div>
    </div>`;
}

function renderRooms() {
  const canMeeting = ['admin', 'member'].includes(state.user.role);
  const rooms = state.rooms.filter(room => room.type === 'project-room' || canMeeting);
  if (!rooms.length) return '<div class="empty">예약 가능한 공간이 없음</div>';
  return `
    <div class="room-list">
      ${rooms.map(room => `
        <article class="room-card">
          <strong>${escapeHtml(room.name)}</strong>
          <div class="room-meta">
            <span class="tag ${room.type === 'meeting-room' ? 'green' : ''}">${room.type === 'meeting-room' ? '회의실' : '프로젝트룸'}</span>
            <span class="tag">${room.capacity}인</span>
            <span class="tag">${escapeHtml(room.branch)}</span>
          </div>
          <div><b>${won(room.price)}</b> ${room.type === 'meeting-room' ? '/ 회차' : '/ 월 기준'}</div>
          <button onclick="createBooking('${room.id}')">예약 생성</button>
        </article>`).join('')}
    </div>`;
}

function renderBookingTable(items, admin = false) {
  if (!items.length) return '<div class="empty">예약 내역이 없음</div>';
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${admin ? '<th>예약자</th>' : ''}
            <th>공간</th><th>기간</th><th>금액</th><th>결제</th><th>이용</th><th>처리</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              ${admin ? `<td>${escapeHtml(item.userName)}<br><span class="brand-sub">${escapeHtml(item.userEmail)}</span></td>` : ''}
              <td>${escapeHtml(item.roomName)}<br><span class="brand-sub">${escapeHtml(item.branch)}</span></td>
              <td>${fmtDate(item.startDate)} ~ ${fmtDate(item.endDate)}</td>
              <td>${won(item.amount)}</td>
              <td><span class="status ${item.paymentStatus}">${paymentText[item.paymentStatus] || item.paymentStatus}</span></td>
              <td><span class="status ${item.serviceStatus}">${serviceText[item.serviceStatus] || item.serviceStatus}</span></td>
              <td>
                <div class="inline-actions">
                  ${item.paymentStatus !== 'paid' ? `<button class="green" onclick="bookingAction('${item.id}','mark-paid')">결제 완료</button>` : ''}
                  ${admin && item.serviceStatus !== 'completed' ? `<button class="secondary" onclick="bookingAction('${item.id}','complete-service')">이용 완료</button>` : ''}
                  ${item.serviceStatus !== 'cancelled' ? `<button class="secondary" onclick="bookingAction('${item.id}','cancel')">취소</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderUserTable() {
  if (state.user.role !== 'admin') return '';
  return `
    <section class="panel">
      <h2>사용자 권한 관리</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>이름</th><th>이메일</th><th>권한</th><th>처리</th></tr></thead>
          <tbody>
            ${state.users.map(user => `
              <tr>
                <td>${escapeHtml(user.name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td><span class="role-pill">${roleText[user.role]}</span></td>
                <td>
                  ${user.role === 'user' ? `<button class="green" onclick="userAction('${user.id}','promote-member')">공유오피스 이용자로 전환</button>` : ''}
                  ${user.role === 'member' ? `<button class="secondary" onclick="userAction('${user.id}','demote-user')">일반 사용자로 변경</button>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

function renderAdmin() {
  if (state.user.role !== 'admin') return '';
  return `
    <section class="admin-tools">
      <div class="panel">
        <h2>결제 완료 예약 관리</h2>
        ${renderBookingTable(state.paidBookings, true)}
      </div>
      ${renderUserTable()}
    </section>
    <section class="panel" style="margin-top:16px;">
      <h2>전체 예약</h2>
      ${renderBookingTable(state.bookings, true)}
    </section>`;
}

function renderMemberOnly() {
  if (state.user.role !== 'member') return '';
  const meetingBookings = state.myBookings.filter(item => item.type === 'meeting-room');
  return `
    <section class="panel" style="margin-top:16px;">
      <h2>공유오피스 이용자 전용 회의실 예약</h2>
      <div class="notice" style="margin-bottom:12px;">회의실은 공유오피스 이용자 권한부터 예약 가능함. 일반 사용자는 운영 관리자가 권한을 전환해야 접근 가능함.</div>
      ${renderBookingTable(meetingBookings)}
    </section>`;
}

function renderApp() {
  app.innerHTML = `
    <div class="app">
      ${renderTopbar()}
      <main class="main">
        ${renderHero()}
        ${renderKpis()}
        <section class="booking-layout">
          ${renderBookingForm()}
          <div class="panel">
            <h2>공간 예약</h2>
            ${state.user.role === 'user' ? '<div class="notice" style="margin-bottom:12px;">일반 사용자는 프로젝트룸만 예약 가능함. 회의실 예약은 공유오피스 이용자 권한 전환 후 가능함.</div>' : ''}
            ${renderRooms()}
          </div>
        </section>
        <section class="panel" style="margin-top:16px;">
          <h2>내 예약</h2>
          ${renderBookingTable(state.myBookings)}
        </section>
        ${renderMemberOnly()}
        ${renderAdmin()}
      </main>
    </div>`;
}

function render() {
  if (!state.token || !state.user) renderLogin();
  else renderApp();
}

async function init() {
  if (!state.token) return renderLogin();
  try {
    await loadBootstrap();
  } catch (err) {
    localStorage.removeItem('sos_token');
    state.token = '';
    state.error = '세션이 만료되어 다시 로그인해야 함';
    renderLogin();
  }
}

init();

