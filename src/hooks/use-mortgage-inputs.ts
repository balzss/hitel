import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { convertTotalMonthsToYearsAndMonths, convertYearsAndMonthsToTotal } from '@/lib/mortgage-calculations'
import useMortgageStorage from '@/hooks/use-mortgage-storage'
import { type Language } from '@/lib/i18n'

interface UseMortgageInputsProps {
  language: Language
  onValuesChange?: (values: {
    loanAmount: string
    totalMonths: number
    interestRate: string
  }) => void
}

export function useMortgageInputs({ language, onValuesChange }: UseMortgageInputsProps) {
  const searchParams = useSearchParams()
  const [storedData, updateStoredData] = useMortgageStorage()
  const localStorageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Input states
  const [loanAmount, setLoanAmount] = useState('')
  const [loanTermYears, setLoanTermYears] = useState('')
  const [loanTermMonths, setLoanTermMonths] = useState('')
  const [interestRate, setInterestRate] = useState('')

  // Calculate total months from years and months
  const totalMonths = useMemo(() => {
    const years = parseFloat(loanTermYears) || 0
    const months = parseFloat(loanTermMonths) || 0
    return convertYearsAndMonthsToTotal(years, months)
  }, [loanTermYears, loanTermMonths])

  // Custom input handlers to allow zero values
  const handleLoanAmountChange = useCallback((value: string) => {
    if (value === '') {
      setLoanAmount('')
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setLoanAmount(value)
    }
  }, [])

  const handleInterestRateChange = useCallback((value: string) => {
    if (value === '') {
      setInterestRate('')
      return
    }

    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setInterestRate(value)
    }
  }, [])

  // Handle year selection - update months accordingly
  const handleYearChange = useCallback((yearValue: string) => {
    setLoanTermYears(yearValue)
    setLoanTermMonths('0') // Reset months when selecting a predefined year
  }, [])

  // Handle month change - simplified to just set total months
  const handleMonthChange = useCallback((monthValue: string) => {
    const totalMonths = parseFloat(monthValue) || 0

    if (totalMonths > 0) {
      const { years, months } = convertTotalMonthsToYearsAndMonths(totalMonths)
      setLoanTermYears(years.toString())
      setLoanTermMonths(months.toString())
    } else {
      setLoanTermYears('')
      setLoanTermMonths('')
    }
  }, [])

  const handleReset = useCallback(() => {
    if (localStorageTimeoutRef.current) {
      clearTimeout(localStorageTimeoutRef.current)
    }

    setLoanAmount('')
    setLoanTermYears('')
    setLoanTermMonths('')
    setInterestRate('')
  }, [])

  // Initialize state from URL params and localStorage
  useEffect(() => {
    const urlLoanAmount = searchParams.get('amt')
    const urlTotalMonths = searchParams.get('term')
    const urlInterestRate = searchParams.get('rate')

    setLoanAmount(urlLoanAmount || storedData.loanAmount)

    if (urlTotalMonths) {
      const totalMonths = parseInt(urlTotalMonths)
      const { years, months } = convertTotalMonthsToYearsAndMonths(totalMonths)
      setLoanTermYears(years.toString())
      setLoanTermMonths(months.toString())
    } else {
      setLoanTermYears(storedData.loanTermYears)
      setLoanTermMonths(storedData.loanTermMonths)
    }

    setInterestRate(urlInterestRate || storedData.interestRate)
  }, [searchParams, storedData])

  // Optimized localStorage sync
  const localStorageValues = useMemo(() => ({
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    language
  }), [loanAmount, loanTermYears, loanTermMonths, interestRate, language])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (localStorageTimeoutRef.current) {
      clearTimeout(localStorageTimeoutRef.current)
    }

    localStorageTimeoutRef.current = setTimeout(() => {
      updateStoredData(localStorageValues)
    }, 1000)

    return () => {
      if (localStorageTimeoutRef.current) {
        clearTimeout(localStorageTimeoutRef.current)
      }
    }
  }, [localStorageValues, updateStoredData])

  // Notify parent component of value changes
  useEffect(() => {
    if (onValuesChange) {
      onValuesChange({
        loanAmount,
        totalMonths,
        interestRate
      })
    }
  }, [onValuesChange, loanAmount, totalMonths, interestRate])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (localStorageTimeoutRef.current) {
        clearTimeout(localStorageTimeoutRef.current)
      }
    }
  }, [])

  // Check if form has any values (for disabling reset button)
  const hasValues = useMemo(() => {
    return !!(loanAmount || loanTermYears || loanTermMonths || interestRate)
  }, [loanAmount, loanTermYears, loanTermMonths, interestRate])

  return {
    // State
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    totalMonths,
    hasValues,

    // Handlers
    handleLoanAmountChange,
    handleInterestRateChange,
    handleYearChange,
    handleMonthChange,
    handleReset
  }
}
