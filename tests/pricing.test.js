import test from "node:test";
import assert from "node:assert/strict";
import { calculatePrice } from "../lib/pricing.js";

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

