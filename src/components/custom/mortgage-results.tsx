"use client"

import React, { useMemo } from 'react'
import { type MortgageCalculation } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

interface MortgageResultsProps {
  language: Language
  calculation: MortgageCalculation
  formatCurrency: (amount: number) => string
}

export function MortgageResults({ language, calculation, formatCurrency }: MortgageResultsProps) {
  const t = useMemo(() => getTranslation(language), [language])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <div className="text-2xl font-bold text-primary">
          {formatCurrency(calculation.monthlyPayment)}
        </div>
        <div className="text-sm text-muted-foreground">{t.monthlyPayment}</div>
      </div>

      <div className="text-center p-4 border rounded-lg">
        <div className="text-xl font-semibold">
          {formatCurrency(calculation.totalInterest)}
        </div>
        <div className="text-sm text-muted-foreground">{t.totalInterest}</div>
      </div>

      <div className="text-center p-4 border rounded-lg">
        <div className="text-xl font-semibold">
          {formatCurrency(calculation.totalAmount)}
        </div>
        <div className="text-sm text-muted-foreground">{t.totalAmount}</div>
      </div>
    </div>
  )
}
