"use client"

import React, { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Language, getTranslation } from '@/lib/i18n'

interface InflationCalculatorInputsProps {
  language: Language
  currentPropertyValue: string
  expectedYearlyInflation: string
  onCurrentPropertyValueChange: (value: string) => void
  onExpectedYearlyInflationChange: (value: string) => void
}

export function InflationCalculatorInputs({
  language,
  currentPropertyValue,
  expectedYearlyInflation,
  onCurrentPropertyValueChange,
  onExpectedYearlyInflationChange
}: InflationCalculatorInputsProps) {
  const t = useMemo(() => getTranslation(language), [language])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current-property-value">
            {t.currentPropertyValue}
          </Label>
          <Input
            id="current-property-value"
            type="number"
            step="0.1"
            min="0"
            placeholder="30"
            value={currentPropertyValue}
            onChange={(e) => onCurrentPropertyValueChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected-yearly-inflation">
            {t.expectedYearlyInflation}
          </Label>
          <Input
            id="expected-yearly-inflation"
            type="number"
            step="0.1"
            min="-100"
            max="100"
            placeholder="3.5"
            value={expectedYearlyInflation}
            onChange={(e) => onExpectedYearlyInflationChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
