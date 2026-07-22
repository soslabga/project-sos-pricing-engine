import { createLookupChallenge } from "../../../../lib/db";
import { sendLookupVerificationSms } from "../../../../lib/sms-solapi";

export const runtime = "nodejs";

function credentials(body) {
  const customerName = String(body.customerName || "").trim();
  const phone = String(body.phone || "").replace(/\D/g, "");
  if (customerName.length < 2 || customerName.length > 30) throw new Error("INVALID_NAME");
  if (!/^01[016789][0-9]{7,8}$/.test(phone)) throw new Error("INVALID_PHONE");
  return { customerName, phone };
}

export async function POST(request) {
  try {
    const clean = credentials(await request.json());
    const challenge = createLookupChallenge(clean);
    if (!challenge.exists) return Response.json({ sent: true, mode: "silent" });
    try {
      const sms = await sendLookupVerificationSms({ phone: clean.phone, code: challenge.code });
      return Response.json({ sent: true, mode: sms.mode, ...(sms.mode === "mock" ? { mockCode: challenge.code } : {}) });
    } catch (smsError) {
      console.error(`[SMS FALLBACK] 예약조회 인증번호 발송 실패: ${smsError?.message || smsError}`);
      console.log(`[SMS MOCK] ${clean.phone} 예약조회 인증번호 ${challenge.code}`);
      return Response.json({ sent: true, mode: "mock", mockCode: challenge.code, fallback: true });
    }
  } catch (error) {
    const message = String(error?.message || error);
    if (["INVALID_NAME", "INVALID_PHONE"].includes(message)) return Response.json({ error: "이름과 휴대폰 번호를 정확히 입력해 주세요." }, { status: 400 });
    if (message === "TOO_MANY_REQUESTS") return Response.json({ error: "인증번호 요청이 많습니다. 10분 후 다시 시도해 주세요." }, { status: 429 });
    console.error(error);
    return Response.json({ error: "인증번호를 보내지 못했습니다." }, { status: 500 });
  }
}