# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern mortgage calculator web application built with Next.js 15 (App Router) and TypeScript. It calculates loan payments, displays amortization schedules, and supports bilingual operation (Hungarian/English).

**Live demo:** https://balzss.github.io/hitel

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Production
npm run build            # Build static export for GitHub Pages
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

## Build Configuration

The project uses **static export** mode (`output: 'export'` in next.config.ts) for GitHub Pages deployment. All routes are pre-rendered at build time.

## Architecture

### State Management Pattern

The application uses a custom hook composition pattern for state management:

1. **`useMortgageStorage`** (src/hooks/use-mortgage-storage.ts) - Single source of truth for data persistence using localStorage with a unified storage key
2. **`useMortgageInputs`** (src/hooks/use-mortgage-inputs.ts) - Manages input state and derived values (e.g., converting years+months to total months)
3. **`useMortgageValidation`** (src/hooks/use-mortgage-validation.ts) - Input validation logic
4. **`useMortgageCalculation`** (src/hooks/use-mortgage-calculation.ts) - Debounced calculation with loading state

### Component Hierarchy

```
app/page.tsx (HomeContent)
  ├─ CalculatorHeader (language toggle, share, theme)
  └─ MortgageCalculator
      ├─ MortgageInputForm (loan amount, term, interest rate inputs)
      ├─ MortgageResults (summary cards)
      ├─ MortgageLineChart (balance visualization)
      ├─ MortgagePieChart (principal vs interest)
      └─ AmortizationSchedule (collapsible table by year)
```

### Key Data Flow

1. User inputs flow through `MortgageInputForm` → `useMortgageInputs` hook
2. Inputs are validated on blur via `useMortgageValidation`
3. Valid inputs trigger calculations via `useMortgageCalculation` (debounced 300ms)
4. Results update `MortgageResults`, charts, and `AmortizationSchedule`
5. All changes persist to localStorage via `useMortgageStorage`
6. URL sharing encodes calculation parameters in query string

### Core Calculation Logic

The mortgage calculation (src/lib/mortgage-calculations.ts) uses the standard amortization formula:

```
monthlyPayment = P × (r × (1 + r)^n) / ((1 + r)^n - 1)
```

Where P = principal, r = monthly rate, n = total months

### Internationalization

- Translations defined in src/lib/i18n.ts as a typed object
- Language persisted in localStorage
- Currency formatting uses browser's `Intl.NumberFormat` API with HUF locale

### UI Components

- **Shadcn UI**: Base components in src/components/ui/ (built on Radix UI)
- **Custom components**: Application-specific components in src/components/custom/
- **Styling**: Tailwind CSS with custom theme configuration

## Important Patterns

### Number Input Handling

The loan amount input accepts values in millions (e.g., "25" = 25 million HUF) and multiplies by 1,000,000 internally for calculations. This simplifies the UI for the Hungarian mortgage market.

### Validation Pattern

Validation errors are shown only on blur, but cleared immediately when the user starts typing again (enhancing UX). This is implemented via separate change and blur handlers in MortgageCalculator.

### Chart Data

Both charts use Recharts library and receive the same calculation data but visualize different aspects:
- Line chart: Balance over time with interest/payment overlay
- Pie chart: Total principal vs total interest split

## Testing Considerations

No test framework is currently configured. When adding tests:
- Mock localStorage for storage hooks
- Test mortgage calculation edge cases (zero interest, single payment, etc.)
- Test number formatting for both locales
