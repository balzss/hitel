"use client"

import { Suspense, useState, useEffect } from 'react'
import { MortgageCalculator } from '@/components/custom/mortgage-calculator'
import { CalculatorHeader } from '@/components/custom/calculator-header'
import { type Language } from '@/lib/i18n'
import useMortgageStorage from '@/hooks/use-mortgage-storage'
import { usePageMetadata } from '@/hooks/use-page-metadata'

function HomeContent() {
  const [storedData] = useMortgageStorage()

  const [language, setLanguage] = useState<Language>('hu')
  const [loanAmount, setLoanAmount] = useState('')
  const [totalMonths, setTotalMonths] = useState(0)
  const [interestRate, setInterestRate] = useState('')
  const [currentPropertyValue, setCurrentPropertyValue] = useState<string | undefined>('')
  const [expectedYearlyInflation, setExpectedYearlyInflation] = useState<string | undefined>('')
  const [advancedFeaturesExpanded, setAdvancedFeaturesExpanded] = useState(false)

  // Initialize language from localStorage
  useEffect(() => {
    setLanguage(storedData.language)
  }, [storedData.language])

  // Update page metadata when language changes
  usePageMetadata(language)

  const handleToggleAdvancedFeatures = () => {
    setAdvancedFeaturesExpanded(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 pb-16 max-w-4xl">
        <CalculatorHeader
          language={language}
          onLanguageChange={setLanguage}
          loanAmount={loanAmount}
          totalMonths={totalMonths}
          interestRate={interestRate}
          currentPropertyValue={currentPropertyValue}
          expectedYearlyInflation={expectedYearlyInflation}
          advancedFeaturesExpanded={advancedFeaturesExpanded}
          onToggleAdvancedFeatures={handleToggleAdvancedFeatures}
        />
        <MortgageCalculator
          language={language}
          onValuesChange={(values) => {
            setLoanAmount(values.loanAmount)
            setTotalMonths(values.totalMonths)
            setInterestRate(values.interestRate)
            setCurrentPropertyValue(values.currentPropertyValue)
            setExpectedYearlyInflation(values.expectedYearlyInflation)
          }}
        />
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
