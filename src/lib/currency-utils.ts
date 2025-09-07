import { type Language } from '@/lib/i18n'

export function createCurrencyFormatter(language: Language): Intl.NumberFormat {
  return new Intl.NumberFormat(language === 'hu' ? 'hu-HU' : 'en-US', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

export function formatCurrency(amount: number, formatter: Intl.NumberFormat): string {
  return formatter.format(amount)
}
