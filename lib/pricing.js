export const PRICE_TABLE = Object.freeze({
  private: Object.freeze({ day: 25_000, week: 125_000, month: 280_000 }),
  multi_a: Object.freeze({ hour: 13_400 }),
  multi_b: Object.freeze({ day: 80_000, week: 400_000, month: null }),
});

export function calculatePrice(category, unit, quantity = 1) {
  const unitPrice = PRICE_TABLE[category]?.[unit];
  if (unitPrice === null) throw new Error("PRICE_UNDECIDED");
  if (!Number.isInteger(unitPrice) || unitPrice < 0) throw new Error("INVALID_PRICE_OPTION");
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("INVALID_QUANTITY");
  return unitPrice * quantity;
}

export function calculateEnd(startAt, unit, quantity = 1) {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) throw new Error("INVALID_START_DATE");
  const end = new Date(start);
  if (unit === "hour") end.setHours(end.getHours() + quantity);
  else if (unit === "day") end.setDate(end.getDate() + quantity);
  else if (unit === "week") end.setDate(end.getDate() + 7 * quantity);
  else if (unit === "month") end.setMonth(end.getMonth() + quantity);
  else throw new Error("INVALID_UNIT");
  return end.toISOString();
}

