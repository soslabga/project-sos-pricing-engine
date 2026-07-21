import { cancelBooking, getLookupSession } from "../../../../../lib/db";

export const runtime = "nodejs";

function sessionToken(request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("sos_booking_session="))?.split("=")[1] || "";
}

export async function POST(request, context) {
  try {
    const session = getLookupSession(sessionToken(request));
    if (!session) return Response.json({ error: "인증 시간이 만료됐습니다. 다시 인증해 주세요." }, { status: 401 });
    const { id } = await context.params;
    if (!/^\d+$/.test(id)) return Response.json({ error: "예약 번호가 올바르지 않습니다." }, { status: 400 });
    const result = cancelBooking({ id: Number(id), customerName: session.customer_name, phone: session.phone });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = String(error?.message || error);
    if (message === "BOOKING_NOT_FOUND") return Response.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
    if (message === "CANCELLATION_CLOSED") return Response.json({ error: "이용이 시작된 예약은 온라인으로 취소할 수 없습니다." }, { status: 409 });
    console.error(error);
    return Response.json({ error: "예약 취소 중 오류가 발생했습니다." }, { status: 500 });
  }
}