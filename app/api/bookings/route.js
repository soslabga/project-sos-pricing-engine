import { createBooking, getRoom, updateSmsStatus } from "../../../lib/db";
import { calculateEnd, calculatePrice } from "../../../lib/pricing";
import { sendReservationSms } from "../../../lib/sms-solapi";

export const runtime = "nodejs";

function validate(body) {
  const roomId = Number(body.roomId);
  const quantity = Number(body.quantity);
  const phone = String(body.phone || "").replace(/[^0-9]/g, "");
  const customerName = String(body.customerName || "").trim();
  if (!Number.isInteger(roomId) || roomId < 1) throw new Error("INVALID_ROOM");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("INVALID_QUANTITY");
  if (!/^01[016789][0-9]{7,8}$/.test(phone)) throw new Error("INVALID_PHONE");
  if (customerName.length < 2 || customerName.length > 30) throw new Error("INVALID_NAME");
  return { roomId, quantity, phone, customerName };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const clean = validate(body);
    const room = getRoom(clean.roomId);
    if (!room) throw new Error("ROOM_NOT_FOUND");
    const category = room.category;
    const unit = String(body.unit);
    const start = new Date(body.startAt);
    if (Number.isNaN(start.getTime())) throw new Error("INVALID_START_DATE");
    if (start.getTime() < Date.now() - 60_000) throw new Error("PAST_BOOKING");

    const amount = calculatePrice(category, unit, clean.quantity);
    const endAt = calculateEnd(start.toISOString(), unit, clean.quantity);
    const booking = createBooking({
      ...clean,
      startAt: start.toISOString(),
      endAt,
      unit,
      amount,
    });

    try {
      const sms = await sendReservationSms(booking);
      updateSmsStatus(booking.id, sms.mode === "mock" ? "mocked" : "sent");
      return Response.json({ booking: { ...booking, sms_status: sms.mode === "mock" ? "mocked" : "sent" }, sms }, { status: 201 });
    } catch (smsError) {
      updateSmsStatus(booking.id, "failed");
      return Response.json({ booking: { ...booking, sms_status: "failed" }, sms: { mode: "solapi", success: false } }, { status: 201 });
    }
  } catch (error) {
    const message = String(error?.message || error);
    if (message.includes("BOOKING_CONFLICT")) {
      return Response.json({ error: "이미 예약된 시간입니다. 다른 시간이나 공간을 선택해 주세요." }, { status: 409 });
    }
    const known = ["INVALID_ROOM", "INVALID_QUANTITY", "INVALID_PHONE", "INVALID_NAME", "INVALID_START_DATE", "PAST_BOOKING", "INVALID_PRICE_OPTION", "PRICE_UNDECIDED", "ROOM_NOT_FOUND"];
    if (known.includes(message)) return Response.json({ error: message }, { status: 400 });
    console.error(error);
    return Response.json({ error: "예약 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}



