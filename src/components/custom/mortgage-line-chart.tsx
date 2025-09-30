"use client"

import React, { useMemo, useCallback, memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { type MortgageCalculation } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

interface MortgageLineChartProps {
  language: Language
  calculation: MortgageCalculation
  formatCurrency: (amount: number) => string
}

const COLORS = {
  balance: 'var(--chart-purple)',   // Purple: #6929c4 (light) / #d4bbff (dark)
  interest: 'var(--chart-blue)',    // Blue: #002d9c (light) / #4589ff (dark)
  payment: 'var(--chart-teal)',     // Teal: #005d5d (light) / #08bdba (dark)
  adjustedPropertyValue: 'var(--chart-1)', // Orange/red for property value
}

export function MortgageLineChart({ language, calculation, formatCurrency }: MortgageLineChartProps) {
  const t = useMemo(() => getTranslation(language), [language])
  
  // Check if adjusted property value is available
  const hasAdjustedPropertyValue = useMemo(() =>
    calculation.amortizationSchedule.some(p => p.adjustedPropertyValue !== undefined)
  , [calculation.amortizationSchedule])

  // Sample data points for the chart (every 12th month for performance)
  const chartData = useMemo(() => {
    return calculation.amortizationSchedule
      .filter((_, index) => index % 12 === 0 || index === calculation.amortizationSchedule.length - 1)
      .map((payment) => {
        // Calculate cumulative payments and interest up to this month
        const cumulativePayments = calculation.amortizationSchedule
          .slice(0, payment.month)
          .reduce((sum, p) => sum + p.payment, 0)

        const cumulativeInterest = calculation.amortizationSchedule
          .slice(0, payment.month)
          .reduce((sum, p) => sum + p.interest, 0)

        return {
          month: payment.month,
          year: Math.ceil(payment.month / 12),
          balance: payment.balance,
          interest: cumulativeInterest, // Now shows cumulative interest
          payment: cumulativePayments, // Now shows cumulative payments
          adjustedPropertyValue: payment.adjustedPropertyValue,
        }
      })
  }, [calculation.amortizationSchedule])

  interface TooltipData {
    active?: boolean
    payload?: Array<{
      name?: string
      value?: number
      color?: string
    }>
    label?: number
  }

  const CustomTooltip = ({ active, payload, label }: TooltipData) => {
    if (active && payload && payload.length) {
      const year = Math.ceil((label as number) / 12)
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">
            {language === 'hu' ? `${year}. ${t.year}` : `${t.year} ${year}`} 
            <span className="text-muted-foreground ml-1">({t.month} {label})</span>
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value as number)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const formatXAxisLabel = useCallback((tickItem: number) => {
    const year = Math.ceil(tickItem / 12)
    return language === 'hu' ? `${year}. ${t.year}` : `${t.year} ${year}`
  }, [language, t.year])

  const formatYAxisLabel = useCallback((value: number) => {
    // Format large numbers in a compact way
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }, [])

  return (
    <div className="w-full h-[300px] my-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatXAxisLabel}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={formatYAxisLabel}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke={COLORS.balance} 
            strokeWidth={2}
            name={t.balance}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="interest" 
            stroke={COLORS.interest} 
            strokeWidth={2}
            name={t.interest}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="payment"
            stroke={COLORS.payment}
            strokeWidth={2}
            name={t.payment}
            dot={false}
          />
          {hasAdjustedPropertyValue && (
            <Line
              type="monotone"
              dataKey="adjustedPropertyValue"
              stroke={COLORS.adjustedPropertyValue}
              strokeWidth={2}
              name={t.adjustedPropertyValue}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(MortgageLineChart)
