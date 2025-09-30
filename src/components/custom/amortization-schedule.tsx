"use client"

import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

import { type MortgageCalculation } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'
import MortgagePieChart from './mortgage-pie-chart'
import MortgageLineChart from './mortgage-line-chart'

interface AmortizationScheduleProps {
  language: Language
  calculation: MortgageCalculation
  formatCurrency: (amount: number) => string
  loanAmount: number
}

export function AmortizationSchedule({ language, calculation, formatCurrency, loanAmount }: AmortizationScheduleProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
  const t = useMemo(() => getTranslation(language), [language])

  // Group payments by year
  const paymentsByYear = useMemo(() => {
    const grouped = calculation.amortizationSchedule.reduce((acc, payment) => {
      const year = Math.ceil(payment.month / 12)
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(payment)
      return acc
    }, {} as Record<number, typeof calculation.amortizationSchedule>)

    return grouped
  }, [calculation.amortizationSchedule])

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  const toggleAllYears = () => {
    const allYears = Object.keys(paymentsByYear).map(Number)
    if (expandedYears.size === allYears.length) {
      setExpandedYears(new Set())
    } else {
      setExpandedYears(new Set(allYears))
    }
  }

  // Check if we have inflation data
  const hasInflationData = useMemo(() => {
    return calculation.amortizationSchedule.some(payment => payment.adjustedPropertyValue !== undefined)
  }, [calculation])

  const downloadCsv = () => {
    // Create CSV headers
    const headers = [
      t.month,
      t.payment,
      t.principal,
      t.interest,
      t.balance
    ]

    if (hasInflationData) {
      headers.push(t.adjustedPropertyValue)
    }

    // Create CSV rows
    const rows = calculation.amortizationSchedule.map(payment => {
      const row = [
        payment.month.toString(),
        payment.payment.toFixed(2),
        payment.principal.toFixed(2),
        payment.interest.toFixed(2),
        payment.balance.toFixed(2)
      ]

      if (hasInflationData && payment.adjustedPropertyValue !== undefined) {
        row.push(payment.adjustedPropertyValue.toFixed(2))
      }

      return row
    })

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `amortization-schedule.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Collapsible open={showDetails} onOpenChange={setShowDetails}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mt-6">
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
      <CollapsibleContent className="space-y-4 py-4">
        {/* Charts Section with fixed height to prevent layout shifts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[350px]">
          <div className="h-[350px]">
            <MortgagePieChart
              language={language}
              calculation={calculation}
              formatCurrency={formatCurrency}
              loanAmount={loanAmount}
            />
          </div>
          <div className="h-[350px]">
            <MortgageLineChart
              language={language}
              calculation={calculation}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="p-3 md:p-4 border-b">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
              <h3 className="text-base md:text-lg font-medium">{t.amortizationSchedule}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCsv}
                  className="text-xs md:text-sm"
                >
                  <Download />
                  {t.downloadCsv}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllYears}
                  className="text-xs md:text-sm"
                >
                  {expandedYears.size === Object.keys(paymentsByYear).length ?
                    <Minimize2 className="h-3 w-3 md:h-4 md:w-4" /> :
                    <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                  }
                  {expandedYears.size === Object.keys(paymentsByYear).length ? t.collapseAll : t.expandAll}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(paymentsByYear).map(([yearStr, payments]) => {
              const year = Number(yearStr)
              const isExpanded = expandedYears.has(year)
              const yearTotal = payments.reduce((sum, p) => sum + p.payment, 0)
              const yearPrincipal = payments.reduce((sum, p) => sum + p.principal, 0)
              const yearInterest = payments.reduce((sum, p) => sum + p.interest, 0)

              return (
                <div key={year} className="border-b last:border-b-0">
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full p-3 md:p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    {/* Mobile layout: Two columns */}
                    <div className="grid grid-cols-2 gap-3 md:hidden">
                      {/* Left column: Year and chevron */}
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          />
                          <span className="font-medium text-sm">
                            {language === 'hu' ? `${year}. ${t.year}` : `${t.year} ${year}`}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-6">
                          {payments.length} {t.paymentsCount}
                        </span>
                      </div>

                      {/* Right column: Financial data stacked */}
                      <div className="flex flex-col space-y-1 text-xs">
                        <span className="truncate">{t.total}: {formatCurrency(yearTotal)}</span>
                        <span className="truncate">{t.principal}: {formatCurrency(yearPrincipal)}</span>
                        <span className="truncate">{t.interest}: {formatCurrency(yearInterest)}</span>
                      </div>
                    </div>

                    {/* Desktop layout: Single row */}
                    <div className="hidden md:flex md:items-center md:justify-between">
                      <div className="flex items-center space-x-2">
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <span className="font-medium">
                          {language === 'hu' ? `${year}. ${t.year}` : `${t.year} ${year}`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({payments.length} {t.paymentsCount})
                        </span>
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <span>{t.total}: {formatCurrency(yearTotal)}</span>
                        <span>{t.principal}: {formatCurrency(yearPrincipal)}</span>
                        <span>{t.interest}: {formatCurrency(yearInterest)}</span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-2 md:px-4 md:pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs md:text-sm">{t.month}</TableHead>
                            <TableHead className="text-xs md:text-sm">{t.payment}</TableHead>
                            <TableHead className="text-xs md:text-sm">{t.principal}</TableHead>
                            <TableHead className="text-xs md:text-sm">{t.interest}</TableHead>
                            <TableHead className="text-xs md:text-sm">{t.balance}</TableHead>
                            {hasInflationData && (
                              <TableHead className="text-xs md:text-sm">{t.adjustedPropertyValue}</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.month}>
                              <TableCell className="text-xs md:text-sm">{payment.month}</TableCell>
                              <TableCell className="text-xs md:text-sm">{formatCurrency(payment.payment)}</TableCell>
                              <TableCell className="text-xs md:text-sm">{formatCurrency(payment.principal)}</TableCell>
                              <TableCell className="text-xs md:text-sm">{formatCurrency(payment.interest)}</TableCell>
                              <TableCell className="text-xs md:text-sm">{formatCurrency(payment.balance)}</TableCell>
                              {hasInflationData && payment.adjustedPropertyValue !== undefined && (
                                <TableCell className="text-xs md:text-sm">{formatCurrency(payment.adjustedPropertyValue)}</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
