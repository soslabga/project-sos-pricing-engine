import { findBookings, verifyLookupChallenge } from "../../../lib/db";
import { calculateRefundQuote } from "../../../lib/refund";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const customerName = String(body.customerName || "").trim();
    const phone = String(body.phone || "").replace(/\D/g, "");
    const code = String(body.code || "").replace(/\D/g, "");
    if (customerName.length < 2 || !/^01[016789][0-9]{7,8}$/.test(phone) || !/^\d{6}$/.test(code)) {
      return Response.json({ error: "인증번호를 정확히 입력해 주세요." }, { status: 400 });
    }
    const session = verifyLookupChallenge({ customerName, phone, code });
    const bookings = findBookings({ customerName, phone }).map((booking) => ({ ...booking, refund: calculateRefundQuote(booking) }));
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return Response.json({ bookings }, {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `sos_booking_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800${secure}`,
      },
    });
  } catch (error) {
    const message = String(error?.message || error);
    if (message === "INVALID_OR_EXPIRED_CODE") return Response.json({ error: "인증번호가 틀렸거나 만료됐습니다." }, { status: 401 });
    console.error(error);
    return Response.json({ error: "예약 인증 중 오류가 발생했습니다." }, { status: 500 });
  }
}