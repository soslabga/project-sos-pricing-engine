import test from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";

const testDb = path.join(process.cwd(), "data", "cancel-test.db");
process.env.SOS_DB_PATH = testDb;
rmSync(testDb, { force: true });
const { createBooking, findBookings, cancelBooking, createLookupChallenge, verifyLookupChallenge, getLookupSession } = await import("../lib/db.js");

const base = {
  roomId: 2,
  customerName: "예약 취소",
  phone: "01022223333",
  unit: "day",
  quantity: 1,
  amount: 25_000,
  startAt: "2030-01-06T00:00:00.000Z",
  endAt: "2030-01-07T00:00:00.000Z",
};

test("이름과 휴대폰 번호로 예약 조회", () => {
  createBooking(base);
  assert.equal(findBookings({ customerName: "예약 취소", phone: "010-2222-3333" }).length, 1);
  assert.equal(findBookings({ customerName: "다른 이름", phone: "010-2222-3333" }).length, 0);
});


test("예약 조회는 휴대폰 인증번호와 30분 세션이 필요", () => {
  const now = new Date("2030-01-01T00:00:00.000Z");
  const challenge = createLookupChallenge({ customerName: base.customerName, phone: base.phone, now });
  assert.equal(challenge.exists, true);
  assert.throws(() => verifyLookupChallenge({ customerName: base.customerName, phone: base.phone, code: "000000", now }), /INVALID_OR_EXPIRED_CODE/);
  const session = verifyLookupChallenge({ customerName: base.customerName, phone: base.phone, code: challenge.code, now });
  assert.equal(getLookupSession(session.token, now).phone, base.phone);
  assert.equal(getLookupSession(session.token, new Date("2030-01-01T00:31:00.000Z")), null);
});
test("취소 시 환불액 저장 후 같은 시간 재예약 가능", () => {
  const found = findBookings({ customerName: base.customerName, phone: base.phone })[0];
  const result = cancelBooking({ id: found.id, customerName: base.customerName, phone: base.phone, now: new Date("2030-01-01T00:00:00.000Z") });
  assert.equal(result.booking.status, "cancelled");
  assert.equal(result.booking.refund_rate, 80);
  assert.equal(result.booking.refund_amount, 20_000);
  const replacement = createBooking({ ...base, customerName: "재예약 고객", phone: "01044445555" });
  assert.equal(replacement.status, "confirmed");
});