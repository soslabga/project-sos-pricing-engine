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
  if (unit === "hour") end.setTime(end.getTime() + quantity * 60 * 60 * 1000);
  else if (unit === "day") end.setTime(end.getTime() + quantity * 24 * 60 * 60 * 1000);
  else if (unit === "week") end.setTime(end.getTime() + quantity * 7 * 24 * 60 * 60 * 1000);
  else if (unit === "month") {
    const koreaOffset = 9 * 60 * 60 * 1000;
    const korean = new Date(end.getTime() + koreaOffset);
    const originalDay = korean.getUTCDate();
    korean.setUTCDate(1);
    korean.setUTCMonth(korean.getUTCMonth() + quantity);
    const lastDay = new Date(Date.UTC(korean.getUTCFullYear(), korean.getUTCMonth() + 1, 0)).getUTCDate();
    korean.setUTCDate(Math.min(originalDay, lastDay));
    end.setTime(korean.getTime() - koreaOffset);
  } else throw new Error("INVALID_UNIT");
  return end.toISOString();
}

