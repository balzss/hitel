"use client"

import React, { useMemo, useCallback, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalculationLoader } from '@/components/custom/loader'
import { MortgageInputForm } from '@/components/custom/mortgage-input-form'
import { MortgageResults } from '@/components/custom/mortgage-results'
import { AmortizationSchedule } from '@/components/custom/amortization-schedule'

import { useMortgageInputs } from '@/hooks/use-mortgage-inputs'
import { useMortgageValidation } from '@/hooks/use-mortgage-validation'
import { useMortgageCalculation } from '@/hooks/use-mortgage-calculation'

import { type ValidationErrors } from '@/types/mortgage'
import { type Language } from '@/lib/i18n'
import { createCurrencyFormatter, formatCurrency } from '@/lib/currency-utils'

interface MortgageCalculatorProps {
  language: Language
  onValuesChange?: (values: {
    loanAmount: string
    totalMonths: number
    interestRate: string
  }) => void
}

export function MortgageCalculator({ language, onValuesChange }: MortgageCalculatorProps) {
  // Use custom hooks for state management
  const {
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    totalMonths,
    hasValues,
    handleLoanAmountChange,
    handleInterestRateChange,
    handleYearChange,
    handleMonthChange,
    handleReset
  } = useMortgageInputs({ language, onValuesChange })

  // Use validation hook
  const { validateInputs } = useMortgageValidation(language)
  
  // State for validation errors (only updated on blur)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Blur handlers for validation
  const handleLoanAmountBlur = useCallback(() => {
    const errors = validateInputs(loanAmount, interestRate, totalMonths)
    setValidationErrors(prev => ({
      ...prev,
      loanAmount: errors.loanAmount
    }))
  }, [validateInputs, loanAmount, interestRate, totalMonths])

  const handleInterestRateBlur = useCallback(() => {
    const errors = validateInputs(loanAmount, interestRate, totalMonths)
    setValidationErrors(prev => ({
      ...prev,
      interestRate: errors.interestRate
    }))
  }, [validateInputs, loanAmount, interestRate, totalMonths])

  // Enhanced change handlers that clear validation errors immediately
  const handleLoanAmountChangeWithClear = useCallback((value: string) => {
    handleLoanAmountChange(value)
    // Clear validation error immediately when user starts typing
    setValidationErrors(prev => ({
      ...prev,
      loanAmount: undefined
    }))
  }, [handleLoanAmountChange])

  const handleInterestRateChangeWithClear = useCallback((value: string) => {
    handleInterestRateChange(value)
    // Clear validation error immediately when user starts typing
    setValidationErrors(prev => ({
      ...prev,
      interestRate: undefined
    }))
  }, [handleInterestRateChange])

  // For calculation purposes, validate all inputs
  const allValidationErrors = useMemo(() => {
    return validateInputs(loanAmount, interestRate, totalMonths)
  }, [validateInputs, loanAmount, interestRate, totalMonths])

  // Use calculation hook
  const { calculation, isCalculating } = useMortgageCalculation(
    loanAmount,
    interestRate,
    totalMonths,
    allValidationErrors
  )

  // Memoized currency formatter
  const currencyFormatter = useMemo(() => {
    return createCurrencyFormatter(language)
  }, [language])

  // Format currency function
  const formatCurrencyValue = useCallback((amount: number): string => {
    return formatCurrency(amount, currencyFormatter)
  }, [currencyFormatter])

  return (
    <Card className="mb-6">
      <CardContent className="space-y-6">
        <MortgageInputForm
          language={language}
          loanAmount={loanAmount}
          loanTermYears={loanTermYears}
          loanTermMonths={loanTermMonths}
          interestRate={interestRate}
          totalMonths={totalMonths}
          validationErrors={validationErrors}
          hasValues={hasValues}
          onLoanAmountChange={handleLoanAmountChangeWithClear}
          onInterestRateChange={handleInterestRateChangeWithClear}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onLoanAmountBlur={handleLoanAmountBlur}
          onInterestRateBlur={handleInterestRateBlur}
          onReset={handleReset}
        />

        {/* Results */}
        {isCalculating && (
          <>
            <Separator />
            <CalculationLoader />
          </>
        )}

        {calculation && !isCalculating && (
          <>
            <Separator />
            <MortgageResults
              language={language}
              calculation={calculation}
              formatCurrency={formatCurrencyValue}
            />

            <Separator />
            <AmortizationSchedule
              language={language}
              calculation={calculation}
              formatCurrency={formatCurrencyValue}
              loanAmount={parseFloat(loanAmount)}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
