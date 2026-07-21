import crypto from "node:crypto";

export function generateAccessCode(length = 6) {
  const first = crypto.randomInt(1, 10).toString();
  let rest = "";
  for (let index = 1; index < length; index += 1) {
    rest += crypto.randomInt(0, 10).toString();
  }
  return first + rest;
}
