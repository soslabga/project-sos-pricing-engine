const state = {
  token: localStorage.getItem('sos_token') || '',
  user: null,
  offices: [],
  rooms: [],
  myBookings: [],
  users: [],
  bookings: [],
  paidBookings: [],
  error: ''
};

const roleText = { admin: '운영 관리자', user: '일반 사용자', member: '공유오피스 이용자' };
const paymentText = { pending: '결제 대기', paid: '결제 완료' };
const serviceText = { reserved: '예약 접수', active: '이용 중', completed: '이용 완료', cancelled: '취소' };
const app = document.getElementById('app');

function won(value) { return `${Number(value || 0).toLocaleString('ko-KR')}원`; }
function fmtDate(value) { return value || '-'; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function daysBetween(start, end) { return Math.max(0, Math.ceil((new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000)); }
function remainingDays(end) { return Math.max(0, Math.ceil((new Date(`${end}T23:59:59`) - new Date()) / 86400000)); }
function contractText(booking) {
  if (!booking) return '예약 없음';
  const total = daysBetween(booking.startDate, booking.endDate);
  const remain = remainingDays(booking.endDate);
  return `${fmtDate(booking.startDate)} ~ ${fmtDate(booking.endDate)} · 계약 ${total}일 · 잔여 ${remain}일`;
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '요청 처리 실패');
  return data;
}
async function login(email, password) { const data = await api('/api/login', { method:'POST', body:JSON.stringify({ email, password }) }); state.token=data.token; state.user=data.user; localStorage.setItem('sos_token', data.token); await loadBootstrap(); }
async function logout() { try { await api('/api/logout', { method:'POST' }); } catch (_) {} localStorage.removeItem('sos_token'); Object.assign(state, { token:'', user:null, offices:[], rooms:[], myBookings:[], users:[], bookings:[], paidBookings:[], error:'' }); render(); }
async function register() { const name=registerName.value.trim(); const email=registerEmail.value.trim(); const password=registerPassword.value.trim(); try { await api('/api/users', { method:'POST', body:JSON.stringify({ name, email, password }) }); await login(email, password); } catch(err) { state.error=err.message; renderLogin(); } }
async function loadBootstrap() { const data = await api('/api/bootstrap'); state.user=data.user; state.offices=data.offices||[]; state.rooms=data.rooms||[]; state.myBookings=data.myBookings||[]; state.users=data.users||[]; state.bookings=data.bookings||[]; state.paidBookings=data.paidBookings||[]; state.error=''; render(); }
async function createBooking(roomId) { try { await api('/api/bookings', { method:'POST', body:JSON.stringify({ roomId, startDate:startDate.value, endDate:endDate.value, memo:memo.value }) }); await loadBootstrap(); } catch(err) { alert(err.message); } }
async function bookingAction(id, action) { try { await api(`/api/bookings/${id}`, { method:'PATCH', body:JSON.stringify({ action }) }); await loadBootstrap(); } catch(err) { alert(err.message); } }
async function userAction(id, action) { try { await api(`/api/users/${id}`, { method:'PATCH', body:JSON.stringify({ action }) }); await loadBootstrap(); } catch(err) { alert(err.message); } }
function setDemo(email, password) { document.getElementById('email').value=email; document.getElementById('password').value=password; }

function renderLogin() {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel">
        <h1>Project SOS</h1>
        <div class="sub">무인 예약 · 결제 상태 관리 · 권한 운영 시스템</div>
        <form class="form-grid" onsubmit="event.preventDefault(); login(email.value, password.value).catch(err => { state.error = err.message; renderLogin(); })">
          <div><label for="email">이메일</label><input id="email" type="email" autocomplete="username" value="admin@soslab.co"></div>
          <div><label for="password">비밀번호</label><input id="password" type="password" autocomplete="current-password" value="admin1234"></div>
          <button type="submit">로그인</button><div class="error">${escapeHtml(state.error)}</div>
        </form>
        <div class="demo-grid">
          <button class="demo-account" onclick="setDemo('admin@soslab.co','admin1234')">운영 관리자 데모</button>
          <button class="demo-account" onclick="setDemo('user@soslab.co','user1234')">일반 사용자 데모</button>
          <button class="demo-account" onclick="setDemo('member@soslab.co','member1234')">공유오피스 이용자 데모</button>
        </div>
        <div class="panel"><h3>신규 일반 사용자 등록</h3><div class="form-grid"><div><label>이름</label><input id="registerName" placeholder="예: 홍길동"></div><div><label>이메일</label><input id="registerEmail" type="email" placeholder="name@example.com"></div><div><label>비밀번호</label><input id="registerPassword" type="password" placeholder="6자 이상"></div><button class="secondary" onclick="register()">일반 사용자로 가입</button></div></div>
      </section>
      <section class="login-visual"><div class="copy"><h2>오피스별 룸 재고를 관리하는 예약 시스템</h2><p>100평·120평·150평 샘플 오피스별로 예약된 룸과 공실 룸을 확인하고, 룸별 계약기간과 잔여기간을 관리함.</p></div></section>
    </main>`;
}
function renderTopbar() { return `<header class="topbar"><div class="brand"><div class="logo">SOS</div><div><div class="brand-title">Project SOS 운영 시스템</div><div class="brand-sub">오피스별 예약재고 · 권한관리 · 결제완료 관리</div></div></div><div class="userbox"><span class="role-pill">${roleText[state.user.role]}</span><strong>${escapeHtml(state.user.name)}</strong><button class="secondary" onclick="logout()">로그아웃</button></div></header>`; }
function renderKpis() {
  const totalRooms = state.offices.reduce((s,o)=>s+o.totalRooms,0);
  const booked = state.offices.reduce((s,o)=>s+o.bookedRooms,0);
  const available = state.offices.reduce((s,o)=>s+o.availableRooms,0);
  const totalPaid = (state.user.role==='admin' ? state.paidBookings : state.myBookings.filter(b=>b.paymentStatus==='paid')).reduce((s,b)=>s+Number(b.amount||0),0);
  return `<section class="kpis"><div class="kpi"><div class="label">샘플 오피스</div><div class="value">${state.offices.length}</div></div><div class="kpi"><div class="label">전체 룸</div><div class="value">${totalRooms}</div></div><div class="kpi good"><div class="label">예약 룸</div><div class="value">${booked}</div></div><div class="kpi warn"><div class="label">공실 룸 / 결제금액</div><div class="value">${available} / ${won(totalPaid)}</div></div></section>`;
}
function renderHero() {
  const adminCopy = state.user.role === 'admin' ? '운영 관리자는 100평·120평·150평 오피스별 예약 현황을 보고, 결제 완료 고객과 이용자 권한을 관리함.' : state.user.role === 'member' ? '공유오피스 이용자는 프로젝트룸 예약과 회의실 예약이 모두 가능함.' : '일반 사용자는 프로젝트룸 예약이 가능함. 관리자가 공유오피스 이용자로 전환하면 회의실 예약 권한이 추가됨.';
  return `<section class="hero"><div class="panel"><h2>운영 기준</h2><div class="notice">${adminCopy}</div></div><div class="panel"><h2>오피스 샘플</h2><div class="grid-3">${state.offices.map(o=>`<div><strong>${escapeHtml(o.name)}</strong><br><span class="tag">${o.size}평</span><span class="tag">예약 ${o.bookedRooms}/${o.totalRooms}</span><span class="tag green">공실 ${o.availableRooms}</span></div>`).join('')}</div></div></section>`;
}
function renderBookingForm() { const t=new Date().toISOString().slice(0,10); const n=new Date(Date.now()+30*86400000).toISOString().slice(0,10); return `<div class="panel"><h2>예약 조건</h2><div class="form-grid"><div><label>시작일</label><input id="startDate" type="date" value="${t}"></div><div><label>종료일</label><input id="endDate" type="date" value="${n}"></div><div><label>요청사항</label><textarea id="memo" placeholder="입실 안내, 주소지 등록 여부, 세금계산서 요청 등"></textarea></div></div></div>`; }

function renderOfficeInventory(office, showMeeting = true) {
  const rooms = [...office.rooms, ...(showMeeting ? office.meetingRoomList : [])];
  return `<article class="office-card"><div class="office-head"><div><h3>${escapeHtml(office.name)}</h3><div class="brand-sub">${escapeHtml(office.model)} · ${office.size}평 · 프로젝트룸 ${office.totalRooms}실 · 회의실 ${office.meetingRooms}실</div></div><div class="office-rate"><b>${office.occupancyRate}%</b><span>예약률</span></div></div><div class="office-stats"><span class="tag">전체 ${office.totalRooms}</span><span class="tag amber">예약 ${office.bookedRooms}</span><span class="tag green">공실 ${office.availableRooms}</span></div><div class="room-grid">${rooms.map(renderRoomCard).join('')}</div></article>`;
}
function renderRoomCard(room) {
  const booked = room.isBooked;
  const b = room.currentBooking;
  return `<div class="room-cell ${booked ? 'booked' : 'open'}"><div class="room-cell-top"><strong>${escapeHtml(room.name)}</strong><span class="status ${booked ? 'active' : 'reserved'}">${booked ? '예약됨' : '예약가능'}</span></div><div class="room-meta"><span class="tag ${room.type==='meeting-room'?'green':''}">${room.type==='meeting-room'?'회의실':'프로젝트룸'}</span><span class="tag">${room.capacity}인</span><span class="tag">${won(room.price)}</span></div>${booked ? `<div class="contract-box"><b>${escapeHtml(b.userName)}</b><br>${contractText(b)}<br><span class="brand-sub">${paymentText[b.paymentStatus]} · ${serviceText[b.serviceStatus]}</span></div>` : `<div class="contract-box empty-mini">계약기간 없음 · 잔여기간 없음</div>`}<button ${booked ? 'disabled' : ''} onclick="createBooking('${room.id}')">${booked ? '예약 불가' : '이 룸 예약'}</button></div>`;
}
function renderRooms() {
  const canMeeting = ['admin','member'].includes(state.user.role);
  if (!state.offices.length) return '<div class="empty">오피스가 없음</div>';
  return `<div class="office-list">${state.offices.map(o=>renderOfficeInventory(o, canMeeting)).join('')}</div>`;
}
function renderBookingTable(items, admin=false) {
  if (!items.length) return '<div class="empty">예약 내역이 없음</div>';
  return `<div class="table-wrap"><table><thead><tr>${admin?'<th>예약자</th>':''}<th>오피스</th><th>룸</th><th>계약기간</th><th>잔여</th><th>금액</th><th>결제</th><th>이용</th><th>처리</th></tr></thead><tbody>${items.map(item=>`<tr>${admin?`<td>${escapeHtml(item.userName)}<br><span class="brand-sub">${escapeHtml(item.userEmail)}</span></td>`:''}<td>${escapeHtml(item.officeName)}</td><td>${escapeHtml(item.roomName)}</td><td>${fmtDate(item.startDate)} ~ ${fmtDate(item.endDate)}<br><span class="brand-sub">계약 ${daysBetween(item.startDate,item.endDate)}일</span></td><td><b>${remainingDays(item.endDate)}일</b></td><td>${won(item.amount)}</td><td><span class="status ${item.paymentStatus}">${paymentText[item.paymentStatus]||item.paymentStatus}</span></td><td><span class="status ${item.serviceStatus}">${serviceText[item.serviceStatus]||item.serviceStatus}</span></td><td><div class="inline-actions">${item.paymentStatus!=='paid'?`<button class="green" onclick="bookingAction('${item.id}','mark-paid')">결제 완료</button>`:''}${admin&&item.serviceStatus!=='completed'?`<button class="secondary" onclick="bookingAction('${item.id}','complete-service')">이용 완료</button>`:''}${item.serviceStatus!=='cancelled'?`<button class="secondary" onclick="bookingAction('${item.id}','cancel')">취소</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`;
}
function renderUserTable() { if (state.user.role!=='admin') return ''; return `<section class="panel"><h2>사용자 권한 관리</h2><div class="table-wrap"><table><thead><tr><th>이름</th><th>이메일</th><th>권한</th><th>처리</th></tr></thead><tbody>${state.users.map(u=>`<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td><span class="role-pill">${roleText[u.role]}</span></td><td>${u.role==='user'?`<button class="green" onclick="userAction('${u.id}','promote-member')">공유오피스 이용자로 전환</button>`:''}${u.role==='member'?`<button class="secondary" onclick="userAction('${u.id}','demote-user')">일반 사용자로 변경</button>`:''}</td></tr>`).join('')}</tbody></table></div></section>`; }
function renderAdminOfficeSummary() { if (state.user.role!=='admin') return ''; return `<section class="panel" style="margin-bottom:16px;"><h2>오피스별 예약 현황</h2><div class="table-wrap"><table><thead><tr><th>오피스</th><th>평형</th><th>전체 룸</th><th>예약 룸</th><th>공실 룸</th><th>예약률</th><th>회의실</th></tr></thead><tbody>${state.offices.map(o=>`<tr><td>${escapeHtml(o.name)}</td><td>${o.size}평</td><td>${o.totalRooms}</td><td><b>${o.bookedRooms}</b></td><td class="ok-text"><b>${o.availableRooms}</b></td><td>${o.occupancyRate}%</td><td>${o.meetingRooms}</td></tr>`).join('')}</tbody></table></div></section>`; }
function renderAdmin() { if (state.user.role!=='admin') return ''; return `${renderAdminOfficeSummary()}<section class="admin-tools"><div class="panel"><h2>결제 완료 예약 관리</h2>${renderBookingTable(state.paidBookings,true)}</div>${renderUserTable()}</section><section class="panel" style="margin-top:16px;"><h2>전체 예약</h2>${renderBookingTable(state.bookings,true)}</section>`; }
function renderMemberOnly() { if (state.user.role!=='member') return ''; const list=state.myBookings.filter(i=>i.type==='meeting-room'); return `<section class="panel" style="margin-top:16px;"><h2>공유오피스 이용자 전용 회의실 예약</h2><div class="notice" style="margin-bottom:12px;">회의실은 공유오피스 이용자 권한부터 예약 가능함.</div>${renderBookingTable(list)}</section>`; }
function renderApp() { app.innerHTML = `<div class="app">${renderTopbar()}<main class="main">${renderHero()}${renderKpis()}${renderAdmin()}<section class="booking-layout"><div>${renderBookingForm()}</div><div class="panel"><h2>오피스별 룸 예약</h2>${state.user.role==='user'?'<div class="notice" style="margin-bottom:12px;">일반 사용자는 프로젝트룸만 예약 가능함. 회의실 예약은 공유오피스 이용자 권한 전환 후 가능함.</div>':''}${renderRooms()}</div></section><section class="panel" style="margin-top:16px;"><h2>내 예약</h2>${renderBookingTable(state.myBookings)}</section>${renderMemberOnly()}</main></div>`; }
function render() { if (!state.token || !state.user) renderLogin(); else renderApp(); }
async function init() { if (!state.token) return renderLogin(); try { await loadBootstrap(); } catch(err) { localStorage.removeItem('sos_token'); state.token=''; state.error='세션이 만료되어 다시 로그인해야 함'; renderLogin(); } }
init();
