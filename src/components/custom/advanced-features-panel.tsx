"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { InflationCalculatorInputs } from '@/components/custom/inflation-calculator-inputs'
import { type Language, getTranslation } from '@/lib/i18n'

interface AdvancedFeaturesPanelProps {
  language: Language
  isExpanded: boolean
  currentPropertyValue: string
  expectedYearlyInflation: string
  onCurrentPropertyValueChange: (value: string) => void
  onExpectedYearlyInflationChange: (value: string) => void
}

export function AdvancedFeaturesPanel({
  language,
  isExpanded,
  currentPropertyValue,
  expectedYearlyInflation,
  onCurrentPropertyValueChange,
  onExpectedYearlyInflationChange
}: AdvancedFeaturesPanelProps) {
  const t = useMemo(() => getTranslation(language), [language])

  return (
    <Collapsible open={isExpanded}>
      <CollapsibleContent>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.advancedFeatures}</CardTitle>
          </CardHeader>
          <CardContent>
            <InflationCalculatorInputs
              language={language}
              currentPropertyValue={currentPropertyValue}
              expectedYearlyInflation={expectedYearlyInflation}
              onCurrentPropertyValueChange={onCurrentPropertyValueChange}
              onExpectedYearlyInflationChange={onExpectedYearlyInflationChange}
            />
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
