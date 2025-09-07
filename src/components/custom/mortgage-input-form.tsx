"use client"

import React, { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { type ValidationErrors } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

interface MortgageInputFormProps {
  language: Language
  loanAmount: string
  loanTermYears: string
  loanTermMonths: string
  interestRate: string
  totalMonths: number
  validationErrors: ValidationErrors
  hasValues: boolean
  onLoanAmountChange: (value: string) => void
  onInterestRateChange: (value: string) => void
  onYearChange: (value: string) => void
  onMonthChange: (value: string) => void
  onLoanAmountBlur?: () => void
  onInterestRateBlur?: () => void
  onReset: () => void
}

export function MortgageInputForm({
  language,
  loanAmount,
  loanTermYears,
  loanTermMonths,
  interestRate,
  totalMonths,
  validationErrors,
  hasValues,
  onLoanAmountChange,
  onInterestRateChange,
  onYearChange,
  onMonthChange,
  onLoanAmountBlur,
  onInterestRateBlur,
  onReset
}: MortgageInputFormProps) {
  const t = useMemo(() => getTranslation(language), [language])

  // Predefined loan term options in years
  const loanTermOptions = useMemo(() => [
    { value: '10', label: `10 ${t.years}` },
    { value: '15', label: `15 ${t.years}` },
    { value: '20', label: `20 ${t.years}` },
    { value: '25', label: `25 ${t.years}` },
    { value: '30', label: `30 ${t.years}` },
    { value: '35', label: `35 ${t.years}` },
  ], [t.years])

  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loan-amount">{t.loanAmount}</Label>
          <Input
            id="loan-amount"
            type="number"
            step="0.1"
            min="0"
            placeholder="55"
            value={loanAmount}
            onChange={(e) => onLoanAmountChange(e.target.value)}
            onBlur={onLoanAmountBlur}
            className={validationErrors.loanAmount ? "border-destructive-border focus:border-destructive-border" : ""}
          />
          {validationErrors.loanAmount && (
            <p className="text-sm text-destructive">{validationErrors.loanAmount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t.loanTermYears}</Label>
          <Select value={loanTermYears} onValueChange={onYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t.selectYearsPlaceholder}>
                {loanTermYears ? (
                  totalMonths % 12 === 0 ?
                    `${loanTermYears} ${t.years}` :
                    `${loanTermYears} ${t.years}, ${loanTermMonths} ${t.months}`
                ) : t.selectYearsPlaceholder}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {loanTermOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Label htmlFor="loan-term-months" className="text-xs text-muted-foreground">
              {t.loanTermMonths}
            </Label>
            <Input
              id="loan-term-months"
              type="number"
              min="0"
              placeholder={t.enterTotalMonthsPlaceholder}
              value={totalMonths || ''}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest-rate">{t.interestRate}</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            min="0"
            placeholder="7.5"
            value={interestRate}
            onChange={(e) => onInterestRateChange(e.target.value)}
            onBlur={onInterestRateBlur}
            className={validationErrors.interestRate ? "border-destructive-border focus:border-destructive-border" : ""}
          />
          {validationErrors.interestRate && (
            <p className="text-sm text-destructive">{validationErrors.interestRate}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button onClick={onReset} variant="outline" disabled={!hasValues}>
          <RotateCcw />
          {t.reset}
        </Button>
      </div>
    </div>
  )
}
