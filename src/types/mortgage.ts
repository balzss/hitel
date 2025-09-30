export interface AmortizationPayment {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  adjustedPropertyValue?: number
}

export interface MortgageCalculation {
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
  amortizationSchedule: AmortizationPayment[]
}

export interface MortgageInputValues {
  loanAmount: string
  loanTermYears: string
  loanTermMonths: string
  interestRate: string
  currentPropertyValue?: string
  expectedYearlyInflation?: string
}

export interface ValidationErrors {
  loanAmount?: string
  interestRate?: string
  totalMonths?: string
}
