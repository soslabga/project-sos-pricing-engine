import test from "node:test";
import assert from "node:assert/strict";
import { buildReservationMessage } from "../lib/sms-solapi.js";

test("예약 안내 문자에 고객·금액·코드·주차 안내가 포함됨", () => {
  const message = buildReservationMessage({
    customer_name: "테스트 고객",
    start_at: "2030-07-28T00:00:00.000Z",
    room_name: "1인실 3번 부스",
    amount: 25_000,
    entrance_code: "458210",
    access_code: "731942",
  });
  assert.match(message, /테스트 고객님/);
  assert.match(message, /25,000원/);
  assert.match(message, /예약일 \/ /);
  assert.match(message, /사무실 \/ 1인실 3번 부스/);
  assert.doesNotMatch(message, /공간|^- 이용일 \/ /m);
  assert.match(message, /공용 출입구 PW : 458210/);
  assert.match(message, /개인실 PW : 731942/);
  assert.match(message, /주차등록은 1일 2시간/);
  assert.match(message, /라운지에 있는 태블릿/);
});

test("인증번호 문자는 SMS 길이 이내", () => {
  const text = `[SOS] 인증번호 123456 (5분 유효)`;
  assert.ok(Buffer.byteLength(text, "utf8") <= 90);
});
