import { type MortgageCalculation, type AmortizationPayment } from '@/types/mortgage'

export function calculateMortgage(
  principal: number,
  annualRate: number,
  totalMonths: number
): MortgageCalculation {
  const monthlyRate = annualRate / 100 / 12

  // Monthly payment calculation using the standard mortgage formula
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  // Use more efficient calculation for large schedules
  let balance = principal
  const amortizationSchedule: AmortizationPayment[] = []

  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    balance = Math.max(0, balance - principalPayment)

    amortizationSchedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance
    })

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
