"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateEnd, PRICE_TABLE } from "../lib/pricing";
import MyBookings from "./MyBookings";

const roomTypes = [
  {
    id: "private",
    eyebrow: "SOLO · 10 ROOMS",
    name: "1인실",
    description: "방해 없이 몰입하는 독립형 워크 부스",
    meta: ["1인", "일 · 주 · 월"],
    price: "25,000원",
    suffix: "/ 일",
    icon: "01",
  },
  {
    id: "multi_a",
    eyebrow: "MEETING · ROOM A",
    name: "멀티룸 A",
    description: "짧은 회의와 협업에 맞춘 시간제 공간",
    meta: ["최대 4인", "시간 단위"],
    price: "13,400원",
    suffix: "/ 시간",
    icon: "A",
  },
  {
    id: "multi_b",
    eyebrow: "TEAM · ROOM B",
    name: "멀티룸 B",
    description: "팀 단위 프로젝트에 여유로운 독립 공간",
    meta: ["최대 6인", "일 · 주"],
    price: "80,000원",
    suffix: "/ 일",
    icon: "B",
  },
];

const unitLabels = { hour: "시간", day: "일", week: "주", month: "월" };

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function phoneFormat(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
}

function maskPhone(value) {
  return phoneFormat(value).replace(/-(\d{3,4})-/, "-****-");
}

function formatMoney(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function formatDateTime(iso) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}.${value("month")}.${value("day")} ${value("hour")}:${value("minute")}`;
}

export default function BookingApp() {
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("private");
  const [roomId, setRoomId] = useState(1);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("10:00");
  const [unit, setUnit] = useState("day");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    fetch("/api/rooms")
      .then((response) => response.json())
      .then((data) => setRooms(data.rooms || []))
      .catch(() => setError("공간 정보를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleRooms = rooms.filter((room) => room.category === category);
  const selectedRoom = rooms.find((room) => Number(room.id) === Number(roomId));
  const units = category === "multi_a" ? ["hour"] : category === "multi_b" ? ["day", "week"] : ["day", "week", "month"];
  const amount = useMemo(() => {
    const price = PRICE_TABLE[category]?.[unit];
    return Number.isInteger(price) ? price * quantity : 0;
  }, [category, unit, quantity]);
  const reservationStartAt = useMemo(() => {
    if (!date) return null;
    const localTime = category === "multi_a" ? time : "09:00";
    const start = new Date(`${date}T${localTime}:00+09:00`);
    return Number.isNaN(start.getTime()) ? null : start.toISOString();
  }, [category, date, time]);
  const estimatedEndAt = useMemo(() => {
    if (!reservationStartAt) return null;
    try {
      return calculateEnd(reservationStartAt, unit, quantity);
    } catch {
      return null;
    }
  }, [reservationStartAt, unit, quantity]);

  function selectCategory(nextCategory) {
    setCategory(nextCategory);
    const firstRoom = rooms.find((room) => room.category === nextCategory);
    if (firstRoom) setRoomId(firstRoom.id);
    const firstUnit = nextCategory === "multi_a" ? "hour" : "day";
    setUnit(firstUnit);
    setQuantity(1);
  }

  function goTo(next) {
    setError("");
    setStep(next);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function payAndBook(event) {
    event.preventDefault();
    setError("");
    if (customerName.trim().length < 2) return setError("예약자 이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대폰 번호를 정확히 입력해 주세요.");
    if (!consent) return setError("개인정보 수집·이용과 이용약관에 동의해 주세요.");
    setLoading(true);
    const startAt = reservationStartAt;
    if (!startAt) { setLoading(false); return setError("이용 시작일을 입력해 주세요."); }
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, category, unit, quantity, startAt, customerName, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "예약에 실패했습니다.");
      setBooking(data.booking);
      if (data.sms?.mode === "mock") {
        setToast(`[모의] ${phoneFormat(phone)}로 공용·개인실 출입코드 전송됨`);
      } else if (data.sms?.success) {
        setToast(`${phoneFormat(phone)}로 예약 안내 문자를 보냈습니다.`);
      } else {
        setToast("예약은 완료됐지만 문자를 보내지 못했습니다.");
      }
      goTo(4);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Project SOS 홈">
          <span className="brand-mark">S</span>
          <span>PROJECT <b>SOS</b></span>
        </a>
        <nav aria-label="주요 메뉴">
          <a href="#space">공간 소개</a>
          <a href="#booking">예약하기</a>
          <a href="#my-bookings">내 예약</a>
        </nav>
        <a className="header-cta" href="#booking">지금 예약</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">PANGYO · 24H SMART WORKSPACE</p>
          <h1>일할 공간이 필요할 때,<br /><em>바로 집중하세요.</em></h1>
          <p className="hero-description">계약도, 보증금도 없이 필요한 만큼만.<br />판교의 무인·1인 업무공간 Project SOS입니다.</p>
          <div className="hero-actions">
            <a className="button primary" href="#booking">공간 예약하기 <span>→</span></a>
            <a className="text-link" href="#space">공간 먼저 보기</a>
          </div>
          <div className="hero-stats" aria-label="공간 요약">
            <div><strong>24H</strong><span>무인 운영</span></div>
            <div><strong>12</strong><span>독립 공간</span></div>
            <div><strong>24평</strong><span>판교점</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="Project SOS 공간 이미지 영역">
          <div className="grid-art">
            <span className="vertical-word">SPACE ON SCHEDULE</span>
            <div className="art-card art-main"><span>FOCUS</span><b>01</b></div>
            <div className="art-card art-accent"><span>OPEN</span><b>24/7</b></div>
            <div className="art-lines" />
          </div>
        </div>
      </section>

      <section className="space-section" id="space">
        <div className="section-heading">
          <div><p className="kicker">OUR SPACE</p><h2>혼자도, 함께도<br />일에 맞는 공간</h2></div>
          <p>1인 집중 업무부터 팀 회의까지.<br />판교점 24평 안에 꼭 필요한 공간만 담았습니다.</p>
        </div>
        <div className="feature-strip">
          <span>✓ 별도 계약 없음</span><span>✓ 24시간 비대면 출입</span><span>✓ 초고속 Wi-Fi</span><span>✓ 주차 1일 2시간</span>
        </div>
        <div className="room-grid">
          {roomTypes.map((room) => (
            <article className={`room-card ${room.id === "multi_a" ? "featured" : ""}`} key={room.id}>
              <div className="room-card-top"><span className="room-number">{room.icon}</span><span className="availability">예약 가능</span></div>
              <p className="room-eyebrow">{room.eyebrow}</p>
              <h3>{room.name}</h3>
              <p className="room-description">{room.description}</p>
              <div className="room-meta">{room.meta.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="room-price"><strong>{room.price}</strong><span>{room.suffix}</span></div>
              <button onClick={() => { selectCategory(room.id); goTo(2); }}>이 공간 예약하기 <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section" id="guide">
        <div className="section-heading"><div><p className="kicker">BEFORE YOU BOOK</p><h2>예약 전에 알아둘<br />이용 안내</h2></div><p>입실부터 퇴실까지 직원 호출 없이 이용할 수 있습니다.<br />필요한 안내는 예약 직후 문자로 보내드립니다.</p></div>
        <div className="guide-grid"><article><span>01</span><h3>24시간 비대면 출입</h3><p>예약 시작 시간부터 6자리 출입코드를 사용할 수 있습니다. 코드는 예약자 본인만 사용합니다.</p></article><article><span>02</span><h3>주차 1일 2시간</h3><p>라운지에 있는 태블릿에서 차량번호를 등록하면 됩니다.</p></article><article><span>03</span><h3>업무에 필요한 기본 설비</h3><p>SOS_guest Wi-Fi, 정수기와 커피머신을 이용할 수 있습니다.</p></article><article><span>04</span><h3>조용한 업무 환경</h3><p>스피커폰 대신 이어폰을 사용하고 음료 외 음식물은 반입하지 않습니다.</p></article></div>
        <div className="guide-links"><a href="/terms">전체 이용약관 →</a><a href="/refund">취소·환불 기준 →</a><a href="/privacy">개인정보처리방침 →</a></div>
      </section>

      <section className="booking-section" id="booking">
        <div className="booking-shell">
          <div className="booking-intro">
            <p className="kicker">BOOK YOUR SPACE</p>
            <h2>3분이면<br />예약이 끝납니다.</h2>
            <p>결제 직후 출입코드를 문자로 보내드립니다.</p>
            <ol className="steps">
              {["룸 선택", "날짜 / 시간", "결제", "출입코드"].map((label, index) => (
                <li className={step === index + 1 ? "active" : step > index + 1 ? "done" : ""} key={label}>
                  <span>{step > index + 1 ? "✓" : String(index + 1).padStart(2, "0")}</span><b>{label}</b>
                </li>
              ))}
            </ol>
          </div>

          <div className="booking-panel">
            {step === 1 && (
              <div className="panel-content" data-testid="step-room">
                <p className="step-label">STEP 01</p>
                <h3>어떤 공간이 필요한가요?</h3>
                <div className="choice-list">
                  {roomTypes.map((room) => (
                    <button className={`choice ${category === room.id ? "selected" : ""}`} key={room.id} onClick={() => selectCategory(room.id)}>
                      <span className="choice-icon">{room.icon}</span>
                      <span><b>{room.name}</b><small>{room.description}</small></span>
                      <strong>{room.price}<small>{room.suffix}</small></strong>
                    </button>
                  ))}
                </div>
                <button className="button primary full" data-testid="room-next" onClick={() => goTo(2)}>날짜 선택하기 <span>→</span></button>
              </div>
            )}

            {step === 2 && (
              <div className="panel-content" data-testid="step-schedule">
                <p className="step-label">STEP 02</p>
                <h3>언제 이용하시나요?</h3>
                <div className="form-grid">
                  {category === "private" && (
                    <label className="field full-width"><span>부스 선택</span>
                      <select value={roomId} onChange={(event) => setRoomId(Number(event.target.value))} data-testid="room-select">
                        {visibleRooms.map((room) => <option value={room.id} key={room.id}>{room.name}</option>)}
                      </select>
                    </label>
                  )}
                  <label className="field"><span>이용 시작일</span><input type="date" min={tomorrow()} value={date} onChange={(event) => setDate(event.target.value)} data-testid="date-input" /></label>
                  {category === "multi_a" && <label className="field"><span>시작 시간</span><input type="time" min="06:00" max="23:00" value={time} onChange={(event) => setTime(event.target.value)} data-testid="time-input" /></label>}
                  <div className="field full-width"><span>예약 단위</span><div className="segment">
                    {units.map((option) => <button className={unit === option ? "selected" : ""} onClick={() => { setUnit(option); setQuantity(1); }} key={option} data-testid={`unit-${option}`}>{unitLabels[option]}</button>)}
                  </div></div>
                  <label className="field"><span>{unit === "hour" ? "이용 시간" : "이용 기간"}</span>
                    <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} data-testid="quantity-select">
                      {(unit === "hour" ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4]).map((number) => <option value={number} key={number}>{number}{unitLabels[unit]}</option>)}
                    </select>
                  </label>
                </div>
                <div className="end-summary"><span>예상 종료일시</span><strong data-testid="estimated-end">{estimatedEndAt ? formatDateTime(estimatedEndAt) : "-"}</strong></div>
                <div className="price-summary"><span>예상 결제금액<small>부가세 포함</small></span><strong data-testid="calculated-price">{formatMoney(amount)}</strong></div>
                <div className="panel-actions"><button className="button ghost" onClick={() => goTo(1)}>이전</button><button className="button primary" data-testid="schedule-next" onClick={() => goTo(3)}>결제 정보 입력 <span>→</span></button></div>
              </div>
            )}

            {step === 3 && (
              <form className="panel-content" onSubmit={payAndBook} data-testid="step-payment">
                <p className="step-label">STEP 03</p>
                <h3>예약자 정보를 입력해 주세요.</h3>
                <div className="selected-summary">
                  <span>{selectedRoom?.name || roomTypes.find((item) => item.id === category)?.name}</span><b>{date} · {quantity}{unitLabels[unit]}</b><strong>{formatMoney(amount)}</strong>
                </div>
                <label className="field full-width"><span>예약자 이름</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="홍길동" autoComplete="name" data-testid="name-input" /></label>
                <label className="field full-width"><span>휴대폰 번호</span><input value={phone} onChange={(event) => setPhone(phoneFormat(event.target.value))} placeholder="010-0000-0000" inputMode="numeric" autoComplete="tel" data-testid="phone-input" /><small>출입코드를 받을 번호를 입력해 주세요.</small></label>
                <div className="mock-payment"><span>PAYMENT</span><div><b>간편결제</b><small>데모용 모의 결제로 진행됩니다.</small></div><i>✓</i></div>
                <label className="consent-box"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} data-testid="consent-checkbox" /><span><b>필수 약관에 동의합니다.</b><small><a href="/terms" target="_blank">이용약관</a> · <a href="/privacy" target="_blank">개인정보처리방침</a> · <a href="/refund" target="_blank">취소·환불 기준</a></small></span></label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="panel-actions"><button type="button" className="button ghost" onClick={() => goTo(2)}>이전</button><button className="button primary" disabled={loading || !consent} data-testid="pay-button">{loading ? "예약 처리 중…" : `${formatMoney(amount)} 결제하기`} <span>→</span></button></div>
              </form>
            )}

            {step === 4 && booking && (
              <div className="panel-content completion" data-testid="step-complete">
                <div className="complete-mark">✓</div>
                <p className="step-label">BOOKING COMPLETE</p>
                <h3>{customerName}님,<br />예약이 확정됐습니다.</h3>
                <p><b>{maskPhone(phone)}</b>로 이용 안내와 출입코드를 보냈습니다.</p>
                <div className="access-code-grid"><div className="access-code"><span>공용 출입구 PW</span><strong data-testid="entrance-code">{booking.entrance_code}</strong></div><div className="access-code"><span>개인실 PW</span><strong data-testid="access-code">{booking.access_code}</strong></div></div>
                <div className="completion-details"><div><span>공간</span><b>{booking.room_name}</b></div><div><span>이용 시작</span><b>{new Date(booking.start_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</b></div><div><span>결제금액</span><b>{formatMoney(booking.amount)}</b></div></div>
                <button className="button ghost full" onClick={() => window.location.reload()}>새 예약하기</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <MyBookings />
      <footer><div className="brand light"><span className="brand-mark">S</span><span>PROJECT <b>SOS</b></span></div><div className="footer-links"><a href="/terms">이용약관</a><a href="/privacy">개인정보처리방침</a><a href="/refund">취소·환불</a></div><span>© 2026 PROJECT SOS · 판교점</span></footer>
      {toast && <div className="toast" role="status" data-testid="sms-toast"><span>✓</span>{toast}</div>}
    </main>
  );
}




