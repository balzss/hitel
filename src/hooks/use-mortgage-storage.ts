import { useState, useCallback } from 'react'

export interface MortgageData {
  loanAmount: string
  loanTermYears: string
  loanTermMonths: string
  interestRate: string
  language: 'hu' | 'en'
  currentPropertyValue?: string
  expectedYearlyInflation?: string
  advancedFeaturesExpanded?: boolean
}

const STORAGE_KEY = 'mortgage-calculator-data'

const defaultValues: MortgageData = {
  loanAmount: '25',
  loanTermYears: '20',
  loanTermMonths: '0',
  interestRate: '7.5',
  language: 'hu',
  currentPropertyValue: '',
  expectedYearlyInflation: '',
  advancedFeaturesExpanded: false
}

function useMortgageStorage(): [MortgageData, (updates: Partial<MortgageData>) => void] {
  const [data, setData] = useState<MortgageData>(() => {
    if (typeof window === "undefined") {
      return defaultValues
    }
    
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return defaultValues
      }
      
      try {
        const parsedData = JSON.parse(stored)
        
        // Validate and merge with defaults to handle missing properties
        return {
          ...defaultValues,
          ...parsedData
        }
      } catch (parseError) {
        console.warn(`Failed to parse stored mortgage data: ${parseError}`)
        
        // Try to migrate from old individual keys
        const migrated = migrateFromIndividualKeys()
        if (migrated) {
          console.log('Successfully migrated from individual localStorage keys')
          return migrated
        }
        
        return defaultValues
      }
    } catch (error) {
      console.error('Error loading mortgage data from localStorage:', error)
      return defaultValues
    }
  })

  const updateData = useCallback((updates: Partial<MortgageData>) => {
    setData(prevData => {
      const newData = { ...prevData, ...updates }
      
      // Save to localStorage
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
        }
      } catch (error) {
        console.error('Error saving mortgage data to localStorage:', error)
      }
      
      return newData
    })
  }, [])

  return [data, updateData]
}

// Helper function to migrate from old individual localStorage keys
function migrateFromIndividualKeys(): MortgageData | null {
  if (typeof window === "undefined") return null
  
  try {
    const oldKeys = [
      'loanAmount',
      'loanTermYears', 
      'loanTermMonths',
      'interestRate',
      'language'
    ]
    
    const migratedData: Partial<MortgageData> = {}
    let hasOldData = false
    
    oldKeys.forEach(key => {
      const value = window.localStorage.getItem(key)
      if (value) {
        hasOldData = true
        try {
          // Try to parse as JSON first
          const parsedValue = JSON.parse(value)
          ;(migratedData as Record<string, unknown>)[key] = parsedValue
        } catch {
          // If parsing fails, use raw value (handles the original issue)
          ;(migratedData as Record<string, unknown>)[key] = value
        }
      }
    })
    
    if (hasOldData) {
      const finalData = { ...defaultValues, ...migratedData }
      
      // Save migrated data to new format
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData))
      
      // Clean up old keys
      oldKeys.forEach(key => {
        window.localStorage.removeItem(key)
      })
      
      return finalData
    }
    
    return null
  } catch (error) {
    console.error('Error during migration:', error)
    return null
  }
}

export default useMortgageStorage
