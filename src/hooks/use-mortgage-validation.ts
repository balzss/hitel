import { useCallback } from 'react'
import { type ValidationErrors } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

export function useMortgageValidation(language: Language) {
  const validateInputs = useCallback((
    loanAmount: string, 
    interestRate: string, 
    totalMonths: number
  ): ValidationErrors => {
    const t = getTranslation(language)
    const errors: ValidationErrors = {}

    // Validate loan amount
    const principal = parseFloat(loanAmount)
    if (loanAmount && (isNaN(principal) || principal <= 0)) {
      errors.loanAmount = t.invalidLoanAmount
    }

    // Validate interest rate
    const interestRateNum = parseFloat(interestRate)
    if (interestRate && (isNaN(interestRateNum) || interestRateNum < 0)) {
      errors.interestRate = t.invalidInterestRate
    } else if (interestRate && interestRateNum === 0) {
      errors.interestRate = t.zeroInterestRate
    }

    // Validate loan term
    if (totalMonths > 0 && totalMonths < 1) {
      errors.totalMonths = t.invalidLoanTerm
    }

    return errors
  }, [language])

  return { validateInputs }
}
