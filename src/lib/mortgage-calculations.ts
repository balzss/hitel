import { type MortgageCalculation, type AmortizationPayment } from '@/types/mortgage'

export function calculateInflationAdjustedValue(
  currentValue: number,
  inflationRate: number,
  years: number
): number {
  return Math.round(currentValue * Math.pow(1 + inflationRate / 100, years))
}

export function calculateMortgage(
  principal: number,
  annualRate: number,
  totalMonths: number,
  currentPropertyValue?: number,
  expectedYearlyInflation?: number
): MortgageCalculation {
  const monthlyRate = annualRate / 100 / 12

  // Monthly payment calculation using the standard mortgage formula
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  // Check if we should calculate inflation-adjusted property values
  const shouldCalculateInflation = currentPropertyValue &&
    expectedYearlyInflation !== undefined &&
    expectedYearlyInflation !== null &&
    currentPropertyValue > 0

  // Use more efficient calculation for large schedules
  let balance = principal
  const amortizationSchedule: AmortizationPayment[] = []

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance = Math.max(0, balance - principalPayment)

    const payment: AmortizationPayment = {
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance
    }

    // Add inflation-adjusted property value if configured
    if (shouldCalculateInflation && currentPropertyValue && expectedYearlyInflation !== undefined) {
      const years = month / 12
      payment.adjustedPropertyValue = calculateInflationAdjustedValue(
        currentPropertyValue,
        expectedYearlyInflation,
        years
      )
    }

    amortizationSchedule.push(payment)

    // Early exit if balance is 0 (avoid unnecessary iterations)
    if (balance === 0) break
  }

  const totalAmount = monthlyPayment * totalMonths
  const totalInterest = totalAmount - principal

  return {
    monthlyPayment,
    totalInterest,
    totalAmount,
    amortizationSchedule
  }
}

export function convertTotalMonthsToYearsAndMonths(totalMonths: number): {
  years: number
  months: number
} {
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  }
}

export function convertYearsAndMonthsToTotal(years: number, months: number): number {
  return Math.round(years * 12 + months)
}
