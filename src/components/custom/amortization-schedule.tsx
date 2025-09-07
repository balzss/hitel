"use client"

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { type MortgageCalculation } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

interface AmortizationScheduleProps {
  language: Language
  calculation: MortgageCalculation
  formatCurrency: (amount: number) => string
}

export function AmortizationSchedule({ language, calculation, formatCurrency }: AmortizationScheduleProps) {
  const [showDetails, setShowDetails] = useState(false)
  const t = useMemo(() => getTranslation(language), [language])

  // Determine which payments to show based on schedule length
  const paymentsToShow = useMemo(() => {
    if (calculation.amortizationSchedule.length > 120) {
      // For loans longer than 10 years, show every 12th payment (yearly)
      return calculation.amortizationSchedule.filter(
        (_, index) => index % 12 === 0 || index === calculation.amortizationSchedule.length - 1
      )
    }
    // Show all payments for shorter loans
    return calculation.amortizationSchedule
  }, [calculation.amortizationSchedule])

  return (
    <Collapsible open={showDetails} onOpenChange={setShowDetails}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full">
          {showDetails ? (
            <>
              <ChevronUp />
              {t.hideDetails}
            </>
          ) : (
            <>
              <ChevronDown />
              {t.showDetails}
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        <h3 className="text-lg font-semibold mt-6">{t.amortizationSchedule}</h3>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.month}</TableHead>
                <TableHead>{t.payment}</TableHead>
                <TableHead>{t.principal}</TableHead>
                <TableHead>{t.interest}</TableHead>
                <TableHead>{t.balance}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsToShow.map((payment) => (
                <TableRow key={payment.month}>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{formatCurrency(payment.payment)}</TableCell>
                  <TableCell>{formatCurrency(payment.principal)}</TableCell>
                  <TableCell>{formatCurrency(payment.interest)}</TableCell>
                  <TableCell>{formatCurrency(payment.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {calculation.amortizationSchedule.length > 120 && (
            <p className="text-sm text-muted-foreground mt-2">
              {t.yearlyPaymentsNote} {t.fullScheduleNote.replace('{count}', calculation.amortizationSchedule.length.toString())}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
