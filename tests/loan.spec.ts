import { test, expect } from '@playwright/test';
import {SmallLoanPage} from "../page-objects/pages/SmallLoanPage";
import {LoanDecisionPage} from "../page-objects/pages/LoanDecisionPage";

test.describe("Loan app tests",async () => {
  test('TL-20-1 base test', async ({ page }) => {
    const smallLoanPage = new SmallLoanPage(page);
    const loanDecisionPage = new LoanDecisionPage(page);
    //открытие страницы и заполнение формы
    await smallLoanPage.open();
    const prefilledAmount = await smallLoanPage.amountInput.getCurrentValue();
    const prefilledPeriod = await smallLoanPage.getFirstPeriodOption();

    await smallLoanPage.applyButton.click();
    await smallLoanPage.login();
    //проверка значений на странице решение по кредиту
    const finalAmount = await loanDecisionPage.getFinalAmountValue();
    const finalPeriod = await loanDecisionPage.getFinalPeriodValue();

    expect(finalAmount).toEqual(prefilledAmount);
    expect(finalPeriod).toEqual(prefilledPeriod);

    await smallLoanPage.open();
    await smallLoanPage.applyImage2.click({force: true});
    await smallLoanPage.amountInput.checkInViewPort();

    const amountSlider = smallLoanPage.amountSlider;
    const periodSlider = smallLoanPage.periodSlider;
    //сдвигаем ползунок
    const amountSliderOffsetWidth = await amountSlider.evaluate((el) => {
      return el.getBoundingClientRect().width;
    });
    await amountSlider.hover({ force: true, position: { x: 0, y: 0 } });
    await page.mouse.down();
    await amountSlider.hover({
      force: true,
      position: { x: amountSliderOffsetWidth / 2, y: 0 },
    });
    await page.mouse.up();

    const periodSliderOffsetWidth = await periodSlider.evaluate((el) => {
      return el.getBoundingClientRect().width;
    });
    //сдвигаем ползунок периода
    await periodSlider.hover({ force: true, position: { x: 0, y: 0 } });
    await page.mouse.down();
    await periodSlider.hover({force: true, position: { x: periodSliderOffsetWidth / 2, y: 0 },});
    await page.mouse.up();
    //новые значения после изменения ползунков
    const newAmount = await smallLoanPage.amountInput.getCurrentValue();
    const newPeriodValue = await smallLoanPage.getPeriodCurrentValue();
    const monthlyPayment = await smallLoanPage.getMonthlyPayment();
    //подача заявки после изменений
    await smallLoanPage.applyButton.click();
    await smallLoanPage.login();
    //новые значения
    const finalNewAmount = await loanDecisionPage.getFinalAmountValue();
    const finalPayment = await loanDecisionPage.getFinalMonthlyPaymentValue();
    const newFinalPeriod = await loanDecisionPage.getFinalPeriodValue();
    //значения после изменений совпадают
    expect(finalNewAmount).toEqual(newAmount);
    expect(monthlyPayment).toEqual(finalPayment);
    expect(newPeriodValue).toEqual(newFinalPeriod);
  });
})



