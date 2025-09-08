export type Language = 'hu' | 'en'

export interface Translations {
  // Page meta
  pageTitle: string
  pageDescription: string

  // Main content
  title: string

  // Form labels and placeholders
  loanAmount: string
  loanTermMonths: string
  loanTermYears: string
  interestRate: string

  // Buttons
  calculate: string
  reset: string
  showDetails: string
  hideDetails: string
  share: string

  // Results
  monthlyPayment: string
  totalInterest: string
  totalAmount: string

  // Amortization table
  amortizationSchedule: string
  payment: string
  principal: string
  interest: string
  balance: string
  month: string

  // Share dialog
  shareCalculation: string
  copyUrl: string
  urlCopied: string
  shareVia: string

  // Validation messages
  invalidLoanAmount: string
  invalidLoanTerm: string
  invalidInterestRate: string
  zeroInterestRate: string

  // Language display names
  languageHu: string
  languageEn: string

  // Form placeholders and labels
  selectYearsPlaceholder: string
  years: string
  months: string
  enterTotalMonthsPlaceholder: string

  // Collapsible table controls
  expandAll: string
  collapseAll: string
  year: string
  paymentsCount: string
  total: string
  downloadCsv: string

  // Chart labels
  principalVsInterest: string
  balanceInterestPayment: string
}

export const translations: Record<Language, Translations> = {
  hu: {
    pageTitle: "Lakáshitel kalkulátor",
    pageDescription: "Egyszerű és gyors magyar lakáshitel kalkulátor. Számítsa ki havi törlesztőrészletét, kamatterhét és törlesztési ütemtervét.",

    title: "Lakáshitel kalkulátor",

    loanAmount: "Hitel összege (millió)",
    loanTermMonths: "Összes hónap",
    loanTermYears: "Futamidő",
    interestRate: "Kamatláb (%)",

    calculate: "Számítás",
    reset: "Törlés",
    showDetails: "Részletek mutatása",
    hideDetails: "Részletek elrejtése",
    share: "Megosztás",

    monthlyPayment: "Havi törlesztőrészlet",
    totalInterest: "Összes kamat",
    totalAmount: "Összes visszafizetendő",

    amortizationSchedule: "Törlesztési ütemterv",
    payment: "Törlesztés",
    principal: "Tőke",
    interest: "Kamat",
    balance: "Fennmaradó tartozás",
    month: "Hónap",

    shareCalculation: "Számítás megosztása",
    copyUrl: "URL másolása",
    urlCopied: "URL másolva!",
    shareVia: "Megosztás...",

    invalidLoanAmount: "Érvényes hitel összeget adj meg",
    invalidLoanTerm: "Érvényes futamidőt adj meg",
    invalidInterestRate: "Érvényes kamatlábat adj meg",
    zeroInterestRate: "A kamatláb nem lehet nulla",

    languageHu: "Magyar",
    languageEn: "English",

    selectYearsPlaceholder: "Válassz évet",
    years: "év",
    months: "hónap",
    enterTotalMonthsPlaceholder: "Vagy add meg hónapban",

    expandAll: "Összes kinyitása",
    collapseAll: "Összes bezárása",
    year: "év",
    paymentsCount: "fizetés",
    total: "Összesen",
    downloadCsv: "CSV letöltése",

    principalVsInterest: "Tőke vs Kamat",
    balanceInterestPayment: "Egyenleg, Kamat és Törlesztés"
  },

  en: {
    pageTitle: "Mortgage Calculator",
    pageDescription: "Simple and fast Hungarian mortgage calculator. Calculate your monthly payment, interest costs, and amortization schedule.",

    title: "Mortgage Calculator",

    loanAmount: "Loan Amount (millions)",
    loanTermMonths: "Total Months",
    loanTermYears: "Loan Term",
    interestRate: "Interest Rate (%)",

    calculate: "Calculate",
    reset: "Reset",
    showDetails: "Show Details",
    hideDetails: "Hide Details",
    share: "Share",

    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    totalAmount: "Total Amount",

    amortizationSchedule: "Amortization Schedule",
    payment: "Payment",
    principal: "Principal",
    interest: "Interest",
    balance: "Balance",
    month: "Month",

    shareCalculation: "Share Calculation",
    copyUrl: "Copy URL",
    urlCopied: "URL Copied!",
    shareVia: "Share via...",

    invalidLoanAmount: "Please enter a valid loan amount",
    invalidLoanTerm: "Please enter a valid loan term",
    invalidInterestRate: "Please enter a valid interest rate",
    zeroInterestRate: "Interest rate cannot be zero",

    languageHu: "Magyar",
    languageEn: "English",

    selectYearsPlaceholder: "Select years",
    years: "years",
    months: "months",
    enterTotalMonthsPlaceholder: "Or enter total months",

    expandAll: "Expand All",
    collapseAll: "Collapse All",
    year: "Year",
    paymentsCount: "payments",
    total: "Total",
    downloadCsv: "Download CSV",

    principalVsInterest: "Principal vs Interest",
    balanceInterestPayment: "Balance, Interest & Payment"
  }
}

export function getTranslation(language: Language): Translations {
  return translations[language]
}
