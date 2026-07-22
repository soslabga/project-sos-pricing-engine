"use client";

import { useState } from "react";

function phoneFormat(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, digits.length - 4)}-${digits.slice(-4)}`;
}

function dateTime(iso) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

function money(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

const unitName = { hour: "시간", day: "일", week: "주", month: "월" };

export default function MyBookings() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  function changeIdentity(setter, value) {
    setter(value);
    setCodeSent(false);
    setCode("");
    setBookings(null);
    setNotice("");
  }

  async function requestCode(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const response = await fetch("/api/my-bookings/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCodeSent(true);
      if (data.mode === "mock") setCode(String(data.mockCode || ""));
      setNotice(data.mode === "mock" ? `[모의 인증] 인증번호 ${data.mockCode} 자동 입력 · 아래 버튼을 눌러 조회하세요.` : "입력한 휴대폰 번호로 인증번호를 보냈습니다.");
    } catch (requestError) {
      setError(requestError.message || "인증번호를 보내지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/my-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, phone, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBookings(data.bookings);
      setNotice("휴대폰 인증이 완료됐습니다. 인증은 30분 동안 유지됩니다.");
    } catch (requestError) {
      setError(requestError.message || "예약을 조회하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(booking) {
    const quote = booking.refund;
    if (!window.confirm(`${booking.room_name} 예약을 취소하시겠습니까?\n환불 예정액: ${money(quote.amount)} (${quote.rate}%)`)) return;
    setError("");
    setNotice("");
    setCancellingId(booking.id);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...data.booking, refund: data.refund } : item));
      setNotice(`예약이 취소됐습니다. 환불 예정액은 ${money(data.refund.amount)}입니다.`);
    } catch (requestError) {
      setError(requestError.message || "예약을 취소하지 못했습니다.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <section className="my-bookings-section" id="my-bookings">
      <div className="my-bookings-shell">
        <div className="my-bookings-heading"><p className="kicker">MY BOOKING</p><h2>내 예약 보기</h2><p>이름과 휴대폰 번호를 입력하고 문자 인증 후 조회합니다.</p></div>
        <form className="lookup-form" onSubmit={requestCode}>
          <label className="field"><span>예약자 이름</span><input value={customerName} onChange={(event) => changeIdentity(setCustomerName, event.target.value)} placeholder="홍길동" data-testid="lookup-name" /></label>
          <label className="field"><span>휴대폰 번호</span><input value={phone} onChange={(event) => changeIdentity(setPhone, phoneFormat(event.target.value))} placeholder="010-0000-0000" inputMode="numeric" data-testid="lookup-phone" /></label>
          <button className="button primary" disabled={loading} data-testid="request-code-button">{loading ? "전송 중…" : codeSent ? "인증번호 재전송" : "인증번호 받기"}</button>
        </form>
        {codeSent && <form className="verification-form" onSubmit={verifyCode}><label className="field"><span>문자로 받은 6자리 인증번호</span><input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="000000" data-testid="verification-code" /></label><button className="button primary" disabled={loading || code.length !== 6} data-testid="verify-code-button">인증하고 조회</button><small>인증번호는 5분 동안 유효합니다.</small></form>}
        {error && <p className="lookup-message error" role="alert">{error}</p>}
        {notice && <p className="lookup-message success" role="status" data-testid="lookup-notice">{notice}</p>}
        {bookings?.length === 0 && <div className="empty-bookings">일치하는 예약이 없습니다.</div>}
        {bookings?.map((booking) => (
          <article className="booking-history-card" key={booking.id} data-testid="booking-history-card">
            <div className="booking-history-top"><div><span className={`status-pill ${booking.status}`}>{booking.status === "confirmed" ? "예약 확정" : "취소 완료"}</span><h3>{booking.room_name}</h3></div><strong>{money(booking.amount)}</strong></div>
            <div className="booking-history-details"><div><span>이용 시작</span><b>{dateTime(booking.start_at)}</b></div><div><span>예상 종료</span><b>{dateTime(booking.end_at)}</b></div><div><span>예약 단위</span><b>{booking.quantity}{unitName[booking.booking_unit]}</b></div></div>
            {booking.status === "confirmed" && <div className="history-codes"><div><span>공용 출입구 PW</span><strong>{booking.entrance_code}</strong></div><div><span>개인실 PW</span><strong>{booking.access_code}</strong></div></div>}
            <div className="living-guide"><h4>생활안내</h4><ul><li><b>청소</b><span>매일 저녁 6시에 청소가 진행됩니다.</span></li><li><b>주차</b><span>주차등록은 1일 2시간까지 가능하며 라운지에 있는 태블릿을 이용 부탁드립니다.</span></li><li><b>Wi-Fi</b><span>SOS_guest / 비밀번호</span></li><li><b>이용수칙</b><span>스피커폰 대신 이어폰을 사용하고 음료 외 음식물은 반입하지 않습니다.</span></li></ul></div>
            <div className="refund-action"><div><span>취소·환불</span><strong>{booking.refund.rate}% · {money(booking.refund.amount)} 환불 예정</strong><small>{booking.refund.reason}</small></div>{booking.status === "confirmed" && booking.refund.canCancel && <button className="button danger" onClick={() => cancel(booking)} disabled={cancellingId === booking.id} data-testid="cancel-booking">{cancellingId === booking.id ? "취소 중…" : "예약 취소"}</button>}</div>
          </article>
        ))}
      </div>
    </section>
  );
}