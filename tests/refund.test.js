import test from "node:test";
import assert from "node:assert/strict";
import { calculateRefundQuote } from "../lib/refund.js";

function booking(startAt, createdAt = "2029-01-01T00:00:00.000Z") {
  return { start_at: startAt, created_at: createdAt, amount: 100_000, status: "confirmed" };
}

const now = "2030-01-01T00:00:00.000Z";

test("환불률은 결제 후 2시간과 이용일까지 남은 날짜에 따라 계산", () => {
  assert.equal(calculateRefundQuote(booking("2030-01-20T00:00:00.000Z", "2029-12-31T23:30:00.000Z"), now).rate, 100);
  assert.equal(calculateRefundQuote(booking("2030-01-10T00:00:00.000Z"), now).rate, 100);
  assert.equal(calculateRefundQuote(booking("2030-01-06T00:00:00.000Z"), now).rate, 80);
  assert.equal(calculateRefundQuote(booking("2030-01-04T00:00:00.000Z"), now).rate, 50);
  assert.equal(calculateRefundQuote(booking("2030-01-02T00:00:00.000Z"), now).rate, 30);
  assert.equal(calculateRefundQuote(booking("2030-01-01T12:00:00.000Z"), now).rate, 0);
});

test("이용 시작 후에는 온라인 취소 불가", () => {
  const quote = calculateRefundQuote(booking("2029-12-31T23:00:00.000Z"), now);
  assert.equal(quote.canCancel, false);
  assert.equal(quote.amount, 0);
});