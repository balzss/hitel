import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { convertTotalMonthsToYearsAndMonths, convertYearsAndMonthsToTotal } from '@/lib/mortgage-calculations'
import useMortgageStorage from '@/hooks/use-mortgage-storage'
import { type Language } from '@/lib/i18n'

interface UseMortgageInputsProps {
  language: Language
  onValuesChange?: (values: {
    loanAmount: string
    totalMonths: number
    interestRate: string
    currentPropertyValue?: string
    expectedYearlyInflation?: string
  }) => void
}

export function useMortgageInputs({ language, onValuesChange }: UseMortgageInputsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [storedData, updateStoredData] = useMortgageStorage()
  const localStorageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const shouldIgnoreUrlParams = useRef(false)

  // Input states
  const [loanAmount, setLoanAmount] = useState('')
  const [loanTermYears, setLoanTermYears] = useState('')
  const [loanTermMonths, setLoanTermMonths] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [currentPropertyValue, setCurrentPropertyValue] = useState('')
  const [expectedYearlyInflation, setExpectedYearlyInflation] = useState('')
  const [advancedFeaturesExpanded, setAdvancedFeaturesExpanded] = useState(false)

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
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setLoanAmount(value)
      }
    }
    
    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

  const handleInterestRateChange = useCallback((value: string) => {
    if (value === '') {
      setInterestRate('')
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setInterestRate(value)
      }
    }
    
    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

  // Handle year selection - update months accordingly
  const handleYearChange = useCallback((yearValue: string) => {
    setLoanTermYears(yearValue)
    setLoanTermMonths('0') // Reset months when selecting a predefined year
    
    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

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
    
    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

  const handleCurrentPropertyValueChange = useCallback((value: string) => {
    if (value === '') {
      setCurrentPropertyValue('')
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setCurrentPropertyValue(value)
      }
    }

    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

  const handleExpectedYearlyInflationChange = useCallback((value: string) => {
    if (value === '') {
      setExpectedYearlyInflation('')
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= -100 && numValue <= 100) {
        setExpectedYearlyInflation(value)
      }
    }

    // Mark that we should ignore URL params from now on and clear URL
    if (!shouldIgnoreUrlParams.current && window.location.search) {
      shouldIgnoreUrlParams.current = true
      // Clear URL asynchronously to not interfere with input
      setTimeout(() => {
        router.push(pathname)
      }, 0)
    }
  }, [router, pathname])

  const handleToggleAdvancedFeatures = useCallback(() => {
    setAdvancedFeaturesExpanded(prev => !prev)
  }, [])

  const handleReset = useCallback(() => {
    if (localStorageTimeoutRef.current) {
      clearTimeout(localStorageTimeoutRef.current)
    }

    // Set reset flag to prevent re-initialization
    setIsResetting(true)
    shouldIgnoreUrlParams.current = false

    // Always clear form data
    setLoanAmount('')
    setLoanTermYears('')
    setLoanTermMonths('')
    setInterestRate('')
    setCurrentPropertyValue('')
    setExpectedYearlyInflation('')

    // Always clear URL parameters if they exist
    if (window.location.search) {
      router.push(pathname)
    }
  }, [router, pathname])

  // Initialize state from URL params and localStorage
  useEffect(() => {
    // Skip initialization if we're in the middle of a reset or should ignore URL params
    if (isResetting || shouldIgnoreUrlParams.current) return

    const urlLoanAmount = searchParams.get('amt')
    const urlTotalMonths = searchParams.get('term')
    const urlInterestRate = searchParams.get('rate')
    const urlCurrentPropertyValue = searchParams.get('propValue')
    const urlExpectedYearlyInflation = searchParams.get('inflation')

    // Check if we have URL parameters
    const hasUrlParams = !!(urlLoanAmount || urlTotalMonths || urlInterestRate || urlCurrentPropertyValue || urlExpectedYearlyInflation)

    if (hasUrlParams) {
      // Load from URL parameters
      setLoanAmount(urlLoanAmount || '')

      if (urlTotalMonths) {
        const totalMonths = parseInt(urlTotalMonths)
        const { years, months } = convertTotalMonthsToYearsAndMonths(totalMonths)
        setLoanTermYears(years.toString())
        setLoanTermMonths(months.toString())
      }

      setInterestRate(urlInterestRate || '')
      setCurrentPropertyValue(urlCurrentPropertyValue || '')
      setExpectedYearlyInflation(urlExpectedYearlyInflation || '')

      // Expand advanced features if we have inflation params in URL
      if (urlCurrentPropertyValue || urlExpectedYearlyInflation) {
        setAdvancedFeaturesExpanded(true)
      }
    } else {
      // Load from localStorage when no URL parameters
      setLoanAmount(storedData.loanAmount)
      setLoanTermYears(storedData.loanTermYears)
      setLoanTermMonths(storedData.loanTermMonths)
      setInterestRate(storedData.interestRate)
      setCurrentPropertyValue(storedData.currentPropertyValue || '')
      setExpectedYearlyInflation(storedData.expectedYearlyInflation || '')
      setAdvancedFeaturesExpanded(storedData.advancedFeaturesExpanded || false)
    }
  }, [searchParams, storedData, isResetting])

  // Clear reset flag when URL is clean (after reset navigation)
  useEffect(() => {
    if (isResetting && !window.location.search) {
      setIsResetting(false)
    }
  }, [isResetting, searchParams])

  // Optimized localStorage sync
  const localStorageValues = useMemo(() => ({
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    language,
    currentPropertyValue,
    expectedYearlyInflation,
    advancedFeaturesExpanded
  }), [loanAmount, loanTermYears, loanTermMonths, interestRate, language, currentPropertyValue, expectedYearlyInflation, advancedFeaturesExpanded])

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
        interestRate,
        currentPropertyValue,
        expectedYearlyInflation
      })
    }
  }, [onValuesChange, loanAmount, totalMonths, interestRate, currentPropertyValue, expectedYearlyInflation])

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
    return !!(loanAmount || loanTermYears || loanTermMonths || interestRate || currentPropertyValue || expectedYearlyInflation)
  }, [loanAmount, loanTermYears, loanTermMonths, interestRate, currentPropertyValue, expectedYearlyInflation])

  return {
    // State
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    totalMonths,
    hasValues,
    currentPropertyValue,
    expectedYearlyInflation,
    advancedFeaturesExpanded,

    // Handlers
    handleLoanAmountChange,
    handleInterestRateChange,
    handleYearChange,
    handleMonthChange,
    handleCurrentPropertyValueChange,
    handleExpectedYearlyInflationChange,
    handleToggleAdvancedFeatures,
    handleReset
  }
}
