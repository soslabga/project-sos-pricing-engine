import test from "node:test";
import assert from "node:assert/strict";
import { calculateEnd, calculatePrice } from "../lib/pricing.js";

test("1인실 일·주·월 가격", () => {
  assert.equal(calculatePrice("private", "day", 1), 25_000);
  assert.equal(calculatePrice("private", "week", 1), 125_000);
  assert.equal(calculatePrice("private", "month", 1), 280_000);
});

test("멀티룸 A 시간 가격", () => {
  assert.equal(calculatePrice("multi_a", "hour", 1), 13_400);
  assert.equal(calculatePrice("multi_a", "hour", 3), 40_200);
});

test("멀티룸 B 일·주 가격과 미결정 월 가격", () => {
  assert.equal(calculatePrice("multi_b", "day", 1), 80_000);
  assert.equal(calculatePrice("multi_b", "week", 1), 400_000);
  assert.throws(() => calculatePrice("multi_b", "month", 1), /PRICE_UNDECIDED/);
});
test("일·주·월 예상 종료일 계산", () => {
  assert.equal(calculateEnd("2026-07-28T00:00:00.000Z", "day", 1), "2026-07-29T00:00:00.000Z");
  assert.equal(calculateEnd("2026-07-28T00:00:00.000Z", "week", 1), "2026-08-04T00:00:00.000Z");
  assert.equal(calculateEnd("2026-01-30T00:00:00.000Z", "month", 1), "2026-02-28T00:00:00.000Z");
});
