import { test, expect } from '@playwright/test';
import {SmallLoanPage} from "../page-objects/pages/SmallLoanPage";

test.describe("Loan app mock tests",async () => {
    test('TL-21-1 positive test', async ({ page }) => {
        const expectedMonthlyAmount = 100005
        const smallLoanPage = new SmallLoanPage(page);

        await page.route("**/api/loan-calc*", async (request ) => {
            const responseBody = {paymentAmountMonthly: expectedMonthlyAmount};
            await request.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(responseBody)
            });
        });
        const loanCalcResponse = page.waitForResponse("**/api/loan-calc*");
        await page.goto("http://localhost:3000");
        await loanCalcResponse;
        await smallLoanPage.checkMonthlyAmount(expectedMonthlyAmount);
    });
    test('TL-21-2 negative test: 500 error',async ({ page }) => {
        const smallLoanPage = new SmallLoanPage(page);
        await page.route("**/api/loan-calc*", async (route) => {
            await route.fulfill({
                status: 500
            });
        });
        await smallLoanPage.open();
        await expect(smallLoanPage.errorMessage).toBeVisible();
    });

    test('TL-21-3 negative test: 200 with empty body', async ({ page }) => {
        const smallLoanPage = new SmallLoanPage(page);
        await page.route("**/api/loan-calc*", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json"
            });
        });

        const loanCalcResponse = page.waitForResponse("**/api/loan-calc*");
        await smallLoanPage.open();
        await loanCalcResponse;
        await smallLoanPage.checkPaymentUndefined();
    });

    test('TL-21-4 negative test: 200 with incorrect key', async ({ page }) => {
        const smallLoanPage = new SmallLoanPage(page);

        await page.route("**/api/loan-calc*", async (request ) => {
            const responseBody = {incorrectkey: 1347};
            await request.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(responseBody)
            });
        });

        const loanCalcResponse = page.waitForResponse("**/api/loan-calc*");
        await smallLoanPage.open();
        await loanCalcResponse;
        await smallLoanPage.checkPaymentUndefined();
    });
})

