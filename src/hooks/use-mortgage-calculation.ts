import { useMemo } from 'react'
import type { ValidationErrors } from '@/types/mortgage'
import { calculateMortgage } from '@/lib/mortgage-calculations'

export function useMortgageCalculation(
  loanAmount: string,
  interestRate: string,
  totalMonths: number,
  validationErrors: ValidationErrors,
  currentPropertyValue?: string,
  expectedYearlyInflation?: string
) {
  const calculation = useMemo(() => {
    // Check if all required fields are present and not empty
    if (!loanAmount || !interestRate || totalMonths <= 0) {
      return null
    }

    const principal = parseFloat(loanAmount) * 1000000
    const rate = parseFloat(interestRate)

    // Validate that all values are valid numbers and within reasonable ranges
    // Also check that there are no validation errors
    if (isNaN(principal) || isNaN(rate) || principal <= 0 || totalMonths <= 0 || rate <= 0 || Object.keys(validationErrors).length > 0) {
      return null
    }

    // Parse optional inflation parameters
    let propertyValue: number | undefined
    let inflation: number | undefined

    if (currentPropertyValue && currentPropertyValue.trim() !== '') {
      propertyValue = parseFloat(currentPropertyValue) * 1000000
      if (isNaN(propertyValue) || propertyValue <= 0) {
        propertyValue = undefined
      }
    }

    if (expectedYearlyInflation && expectedYearlyInflation.trim() !== '') {
      inflation = parseFloat(expectedYearlyInflation)
      if (isNaN(inflation)) {
        inflation = undefined
      }
    }

    return calculateMortgage(principal, rate, totalMonths, propertyValue, inflation)
  }, [loanAmount, interestRate, totalMonths, validationErrors, currentPropertyValue, expectedYearlyInflation])

  const isCalculating = useMemo(() => {
    // Check if all required fields are present and not empty
    if (!loanAmount || !interestRate || totalMonths <= 0) {
      return false
    }

    const principal = parseFloat(loanAmount) * 1000000
    const rate = parseFloat(interestRate)

    // Check if all values are valid numbers and within reasonable ranges
    // Also check that there are no validation errors
    const isValid = !isNaN(principal) && !isNaN(rate) && principal > 0 && totalMonths > 0 && rate > 0 && Object.keys(validationErrors).length === 0

    // Show loading for a brief moment when inputs change and are valid
    return isValid && !calculation
  }, [loanAmount, interestRate, totalMonths, validationErrors, calculation])

  return { calculation, isCalculating }
}
