const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const KST_OFFSET_MS = 9 * HOUR_MS;

function toTimestamp(value) {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const normalized = typeof value === "string" && !value.includes("T")
    ? `${value.replace(" ", "T")}Z`
    : value;
  return new Date(normalized).getTime();
}

function koreanDayNumber(value) {
  return Math.floor((toTimestamp(value) + KST_OFFSET_MS) / DAY_MS);
}

export function calculateRefundQuote(booking, now = Date.now()) {
  const nowMs = toTimestamp(now);
  const startMs = toTimestamp(booking.start_at);
  const createdMs = toTimestamp(booking.created_at);
  const amount = Number(booking.amount);

  if (booking.status === "cancelled") {
    return {
      canCancel: false,
      rate: Number(booking.refund_rate || 0),
      amount: Number(booking.refund_amount || 0),
      reason: "취소 완료",
    };
  }
  if (nowMs >= startMs) {
    return { canCancel: false, rate: 0, amount: 0, reason: "이용이 시작된 예약은 온라인으로 취소할 수 없습니다." };
  }

  let rate;
  let reason;
  if (Number.isFinite(createdMs) && nowMs - createdMs <= 2 * HOUR_MS) {
    rate = 100;
    reason = "결제 후 2시간 이내";
  } else {
    const remainingDays = koreanDayNumber(startMs) - koreanDayNumber(nowMs);
    if (remainingDays >= 8) {
      rate = 100;
      reason = "이용 8일 전까지";
    } else if (remainingDays >= 4) {
      rate = 80;
      reason = "이용 7~4일 전";
    } else if (remainingDays >= 2) {
      rate = 50;
      reason = "이용 3~2일 전";
    } else if (remainingDays >= 1) {
      rate = 30;
      reason = "이용 1일 전";
    } else {
      rate = 0;
      reason = "이용 당일";
    }
  }

  return { canCancel: true, rate, amount: Math.floor((amount * rate) / 100), reason };
}