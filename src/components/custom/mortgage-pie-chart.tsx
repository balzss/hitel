"use client"

import React, { useMemo, memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { type MortgageCalculation } from '@/types/mortgage'
import { type Language, getTranslation } from '@/lib/i18n'

interface PieTooltipData {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    payload?: {
      name: string
      value: number
    }
  }>
}

interface MortgagePieChartProps {
  language: Language
  calculation: MortgageCalculation
  loanAmount: number
  formatCurrency: (amount: number) => string
}

const COLORS = {
  principal: 'var(--chart-purple)', // Purple: #6929c4 (light) / #d4bbff (dark)
  interest: 'var(--chart-blue)',    // Blue: #002d9c (light) / #4589ff (dark)
}

export function MortgagePieChart({ language, calculation, loanAmount, formatCurrency }: MortgagePieChartProps) {
  const t = useMemo(() => getTranslation(language), [language])

  const data = useMemo(() => [
    {
      name: t.principal,
      value: loanAmount * 1000000, // Convert from millions to actual amount
      color: COLORS.principal,
    },
    {
      name: t.interest,
      value: calculation.totalInterest,
      color: COLORS.interest,
    },
  ], [t.principal, t.interest, loanAmount, calculation.totalInterest])

  const CustomTooltip = ({ active, payload }: PieTooltipData) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value as number)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((data.value as number / (loanAmount * 1000000 + calculation.totalInterest)) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px] my-6">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(MortgagePieChart)
