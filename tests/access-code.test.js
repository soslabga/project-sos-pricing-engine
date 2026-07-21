import test from "node:test";
import assert from "node:assert/strict";
import { generateAccessCode } from "../lib/access-code.js";

test("출입코드는 0으로 시작하지 않는 6자리 숫자", () => {
  for (let index = 0; index < 100; index += 1) {
    assert.match(generateAccessCode(), /^[1-9][0-9]{5}$/);
  }
});

test("연속 생성한 출입코드는 실질적으로 중복되지 않음", () => {
  const codes = new Set(Array.from({ length: 100 }, () => generateAccessCode()));
  assert.ok(codes.size >= 99);
});
