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

  const downloadCsv = () => {
    // Create CSV headers
    const headers = [
      t.month,
      t.payment,
      t.principal,
      t.interest,
      t.balance
    ]

    // Create CSV rows
    const rows = calculation.amortizationSchedule.map(payment => [
      payment.month.toString(),
      payment.payment.toFixed(2),
      payment.principal.toFixed(2),
      payment.interest.toFixed(2),
      payment.balance.toFixed(2)
    ])

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
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t.amortizationSchedule}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCsv}
                >
                  <Download />
                  {t.downloadCsv}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllYears}
                >
                  {expandedYears.size === Object.keys(paymentsByYear).length ? <Minimize2 /> : <Maximize2 />}
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
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
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
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
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
                          {payments.map((payment) => (
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
