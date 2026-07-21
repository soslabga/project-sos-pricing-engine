import { SolapiMessageService } from "solapi";

function formatKoreanDate(iso) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(iso));
}

export function buildReservationMessage(booking) {
  const address = process.env.SOS_ADDRESS || "판교 주소, TBD";
  const wifiPassword = process.env.SOS_WIFI_PASSWORD || "비밀번호";
  const supportPhone = process.env.SOS_SUPPORT_PHONE || "번호";
  const amount = Number(booking.amount).toLocaleString("ko-KR");
  return `[Project SOS] 예약 안내
[Web발신]
안녕하세요, ${booking.customer_name}님.

Project SOS를 이용해 주셔서 감사합니다. 예약하신 사무실 이용 안내를 드립니다.

[예약 정보]
- 예약일 / ${formatKoreanDate(booking.start_at)}
- 사무실 / ${booking.room_name}
- ${amount}원(부가세포함) 결제 완료

[출입 안내]
- 위치: ${address}
- 공용 출입구 PW : ${booking.entrance_code}
- 개인실 PW : ${booking.access_code}

[이용 안내]
- Wi-Fi: SOS_guest / ${wifiPassword}
- 주차등록은 1일 2시간까지 가능하며 라운지에 있는 태블릿을 이용 부탁드립니다.
- 사무실 내 스피커폰 사용은 자제해 주시고 이어폰을 사용해 주시기 바랍니다.
- 음료 외 음식물 반입은 금지되어 있습니다.
- 문의: 원격관제 24시간 연결 ${supportPhone}

[퇴실 시 주의 사항]
이용 후에는 반드시 문을 닫고 퇴실해 주세요.
무인으로 운영되는 사무실인 만큼 이용 수칙 준수를 부탁드립니다.

감사합니다.
* 본 문자에는 답장할 수 없습니다.`;
}

export async function sendReservationSms(booking) {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;
  const message = buildReservationMessage(booking);

  if (!apiKey || !apiSecret || !sender) {
    console.log(`[SMS MOCK] ${booking.phone}로 공용 '${booking.entrance_code}' · 개인실 '${booking.access_code}' 전송됨`);
    console.log(message);
    return { mode: "mock", success: true };
  }

  const service = new SolapiMessageService(apiKey, apiSecret);
  const result = await service.sendOne({
    to: booking.phone.replace(/\D/g, ""),
    from: sender.replace(/\D/g, ""),
    text: message,
    subject: "[Project SOS] 예약 안내",
    autoTypeDetect: true,
  });
  return { mode: "solapi", success: true, messageId: result?.messageId };
}
export async function sendLookupVerificationSms({ phone, code }) {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER;
  const text = `[Project SOS] 내 예약 조회 인증번호는 ${code}입니다. 5분 안에 입력해 주세요.`;
  if (!apiKey || !apiSecret || !sender) {
    console.log(`[SMS MOCK] ${phone} 예약조회 인증번호 ${code}`);
    return { mode: "mock", success: true, code };
  }
  const service = new SolapiMessageService(apiKey, apiSecret);
  const result = await service.sendOne({
    to: phone.replace(/\D/g, ""),
    from: sender.replace(/\D/g, ""),
    text,
    subject: "[Project SOS] 인증번호",
    autoTypeDetect: true,
  });
  return { mode: "solapi", success: true, messageId: result?.messageId };
}
