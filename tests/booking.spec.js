import { test, expect } from "@playwright/test";

const runId = Date.now();

test("전체 예약 플로우와 mock SMS 토스트", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /일할 공간이 필요할 때/ })).toBeVisible();
  await page.locator("#booking").scrollIntoViewIfNeeded();
  await page.getByTestId("room-next").click();
  await expect(page.getByTestId("calculated-price")).toHaveText("25,000원");
  await page.getByTestId("schedule-next").click();
  await page.getByTestId("name-input").fill("김소스");
  await page.getByTestId("phone-input").fill("01012345678");
  await page.getByTestId("consent-checkbox").check();
  await page.getByTestId("pay-button").click();
  await expect(page.getByTestId("step-complete")).toBeVisible();
  await expect(page.getByTestId("entrance-code")).toHaveText(/^\d{6}$/);
  await expect(page.getByTestId("access-code")).toHaveText(/^\d{6}$/);
  await expect(page.getByTestId("sms-toast")).toContainText("[모의] 010-1234-5678로");
  await page.screenshot({ path: `evidence/e2e-complete-${runId}.png`, fullPage: true });
});

test("동일 룸·시간 중복 예약을 화면에서 차단", async ({ page, request }) => {
  const startAt = new Date(Date.UTC(2040, 0, 1, 0, runId % 500000, runId % 1000)).toISOString();
  const first = await request.post("/api/bookings", { data: { roomId: 11, category: "multi_a", unit: "hour", quantity: 2, startAt, customerName: "첫 예약", phone: "01011112222" } });
  expect(first.status()).toBe(201);
  const second = await request.post("/api/bookings", { data: { roomId: 11, category: "multi_a", unit: "hour", quantity: 2, startAt, customerName: "중복 예약", phone: "01033334444" } });
  expect(second.status()).toBe(409);
  const tampered = await request.post("/api/bookings", { data: { roomId: 11, category: "private", unit: "day", quantity: 1, startAt: new Date(Date.parse(startAt) + 86400000).toISOString(), customerName: "가격 변조", phone: "01055556666" } });
  expect(tampered.status()).toBe(400);
  await page.goto("/");
  await page.locator("#booking").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /멀티룸 A/ }).first().click();
  await page.getByTestId("room-next").click();
  await expect(page.getByTestId("calculated-price")).toHaveText("13,400원");
  await page.screenshot({ path: `evidence/booking-ui-${runId}.png`, fullPage: true });
});





