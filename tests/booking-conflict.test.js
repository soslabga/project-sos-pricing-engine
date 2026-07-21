import test from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import path from "node:path";

const testDb = path.join(process.cwd(), "data", "conflict-test.db");
process.env.SOS_DB_PATH = testDb;
rmSync(testDb, { force: true });
const { createBooking } = await import("../lib/db.js");

test("같은 룸의 겹치는 예약은 DB 트리거에서 차단", () => {
  const base = {
    roomId: 1,
    customerName: "테스트 사용자",
    phone: "01012345678",
    unit: "hour",
    quantity: 2,
    amount: 26_800,
  };
  createBooking({ ...base, startAt: "2030-01-10T01:00:00.000Z", endAt: "2030-01-10T03:00:00.000Z" });
  assert.throws(
    () => createBooking({ ...base, startAt: "2030-01-10T02:00:00.000Z", endAt: "2030-01-10T04:00:00.000Z" }),
    /BOOKING_CONFLICT/,
  );
});

test("같은 룸이어도 경계가 맞닿기만 하면 예약 가능", () => {
  const booking = createBooking({
    roomId: 1,
    customerName: "경계 테스트",
    phone: "01012345678",
    unit: "hour",
    quantity: 1,
    amount: 13_400,
    startAt: "2030-01-10T03:00:00.000Z",
    endAt: "2030-01-10T04:00:00.000Z",
  });
  assert.equal(booking.room_id, 1);
});
