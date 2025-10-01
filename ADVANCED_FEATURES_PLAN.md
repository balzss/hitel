# Advanced Features Implementation Plan

## Overview
Add an expandable "Advanced Features" section to the mortgage calculator that can be toggled on/off. The first advanced feature will be an inflation-adjusted property value calculator.

## UI/UX Design

### Header Button
- **Location**: Calculator header, left of the reset button
- **Icon**: `Settings2` from lucide-react (or `SlidersHorizontal`)
- **Behavior**: Toggle button to show/hide advanced features panel
- **States**:
  - Default: Collapsed (advanced features hidden)
  - Active: Expanded (advanced features visible)
  - Visual indicator when active (e.g., different background color)

### Advanced Features Panel
- **Location**: Between `MortgageInputForm` and `MortgageResults` components
- **Animation**: Smooth expand/collapse using Radix Collapsible component
- **Structure**:
  ```
  [Advanced Features Panel - Collapsible]
  ├─ Section Header: "Advanced Features"
  └─ Inflation Calculator Section
      ├─ Current Property Value (HUF input)
      └─ Expected Yearly Inflation (% input)
  ```

## Feature 1: Inflation-Adjusted Property Value

### Input Fields

1. **Current Property Value**
   - Type: Number input (HUF)
   - Format: Same pattern as loan amount (accepts millions, e.g., "25" = 25M HUF)
   - Validation: Positive number only
   - Label: "Current Property Value" (EN) / "Jelenlegi ingatlan érték" (HU)
   - Optional: Can be left empty to disable feature

2. **Expected Yearly Inflation**
   - Type: Number input (percentage)
   - Format: Decimal, e.g., "3.5" = 3.5%
   - Validation: -100 to +100 range
   - Label: "Expected Yearly Inflation (%)" (EN) / "Várható éves infláció (%)" (HU)
   - Optional: Can be left empty to disable feature

### Calculation Logic

**Formula for inflation-adjusted value:**
```typescript
adjustedValue = currentPropertyValue × (1 + inflationRate)^years
```

Where:
- `currentPropertyValue`: User input (in HUF)
- `inflationRate`: User input converted to decimal (e.g., 3.5% → 0.035)
- `years`: Number of years from start date

**Implementation points:**
- Calculate adjusted value for each year in the amortization schedule
- Store in the `MortgageScheduleEntry` type as optional field
- Only calculate if both inputs are provided and valid
- Round to nearest HUF

### Data Structure Changes

**Update `MortgageScheduleEntry` type** (src/types/mortgage.ts):
```typescript
export interface MortgageScheduleEntry {
  // ... existing fields
  adjustedPropertyValue?: number; // Optional: inflation-adjusted property value
}
```

**Add to `MortgageInputs` type**:
```typescript
export interface MortgageInputs {
  // ... existing fields
  currentPropertyValue?: number;
  expectedYearlyInflation?: number;
}
```

### Amortization Table Changes

**New Column** (only visible when feature is active):
- Header: "Adjusted Property Value" (EN) / "Korrigált ingatlan érték" (HU)
- Position: After "Remaining Balance" column
- Format: HUF with thousand separators (same as other currency columns)
- Mobile: Should be included in responsive table design

**Visual Enhancement**:
- Optional: Add a "Net Equity" indicator showing `adjustedPropertyValue - remainingBalance`
- Color coding: Green if positive equity growth vs inflation

## Technical Implementation

### File Structure

```
src/
├── components/custom/
│   ├── advanced-features-panel.tsx         [NEW]
│   ├── inflation-calculator-inputs.tsx     [NEW]
│   └── mortgage-calculator.tsx             [MODIFY]
├── hooks/
│   ├── use-mortgage-inputs.ts              [MODIFY]
│   ├── use-mortgage-storage.ts             [MODIFY]
│   └── use-mortgage-calculation.ts         [MODIFY]
├── lib/
│   ├── mortgage-calculations.ts            [MODIFY]
│   └── i18n.ts                             [MODIFY]
└── types/
    └── mortgage.ts                         [MODIFY]
```

### Implementation Steps

#### Step 1: Update Type Definitions
**File**: `src/types/mortgage.ts`
- Add optional fields to `MortgageInputs`
- Add `adjustedPropertyValue?` to `MortgageScheduleEntry`

#### Step 2: Update Internationalization
**File**: `src/lib/i18n.ts`

Add new translation keys:
```typescript
advancedFeatures: {
  title: "Advanced Features" / "Speciális funkciók",
  toggleButton: "Advanced Settings" / "Speciális beállítások",
}
inflationCalculator: {
  title: "Inflation-Adjusted Property Value" / "Inflációval korrigált ingatlan érték",
  currentPropertyValue: "Current Property Value (Million HUF)" / "Jelenlegi ingatlan érték (millió HUF)",
  expectedInflation: "Expected Yearly Inflation (%)" / "Várható éves infláció (%)",
  adjustedValueColumn: "Adjusted Property Value" / "Korrigált ingatlan érték",
  netEquity: "Net Equity" / "Nettó saját tőke",
}
```

#### Step 3: Update Storage Hook
**File**: `src/hooks/use-mortgage-storage.ts`
- Extend stored data to include `currentPropertyValue` and `expectedYearlyInflation`
- Add `advancedFeaturesExpanded` state to persist panel visibility

#### Step 4: Update Inputs Hook
**File**: `src/hooks/use-mortgage-inputs.ts`
- Add state for `currentPropertyValue` and `expectedYearlyInflation`
- Add handlers for updating these values
- Ensure proper type conversion (millions → HUF, percentage → decimal)

#### Step 5: Update Calculation Logic
**File**: `src/lib/mortgage-calculations.ts`

Add new function:
```typescript
export function calculateInflationAdjustedValue(
  currentValue: number,
  inflationRate: number,
  years: number
): number {
  return Math.round(currentValue * Math.pow(1 + inflationRate / 100, years));
}
```

Modify `calculateMortgageSchedule` to:
- Accept optional `currentPropertyValue` and `expectedYearlyInflation` parameters
- Calculate adjusted value for each year if parameters provided
- Include in returned schedule entries

#### Step 6: Update Calculation Hook
**File**: `src/hooks/use-mortgage-calculation.ts`
- Pass new input values to calculation function
- Maintain debouncing behavior

#### Step 7: Create Advanced Features Panel Component
**File**: `src/components/custom/advanced-features-panel.tsx`

Structure:
```tsx
<Collapsible open={isExpanded}>
  <Card>
    <CardHeader>
      <CardTitle>{t.advancedFeatures.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <InflationCalculatorInputs
        currentPropertyValue={currentPropertyValue}
        expectedYearlyInflation={expectedYearlyInflation}
        onCurrentPropertyValueChange={...}
        onExpectedYearlyInflationChange={...}
      />
    </CardContent>
  </Card>
</Collapsible>
```

#### Step 8: Create Inflation Calculator Inputs Component
**File**: `src/components/custom/inflation-calculator-inputs.tsx`

- Two number input fields with proper formatting
- Validation feedback
- Help text explaining the feature

#### Step 9: Update Calculator Header
**File**: `src/components/custom/calculator-header.tsx`

Add advanced features toggle button:
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={toggleAdvancedFeatures}
  aria-label={t.advancedFeatures.toggleButton}
>
  <Settings2 className="h-4 w-4" />
</Button>
```

#### Step 10: Update Main Calculator Component
**File**: `src/components/custom/mortgage-calculator.tsx`

- Add state for advanced features panel visibility
- Render `AdvancedFeaturesPanel` between input form and results
- Pass down necessary props and handlers

#### Step 11: Update Amortization Schedule
**File**: `src/components/custom/amortization-schedule.tsx`

- Add conditional column for adjusted property value
- Only render if `adjustedPropertyValue` data exists
- Format currency values appropriately
- Update responsive design to accommodate new column

#### Step 12: Update URL Sharing
**File**: `src/components/custom/calculator-header.tsx` (share functionality)

- Include new parameters in query string when generating share URLs
- Parse parameters when loading from shared URL
- Backward compatible: ignore missing parameters

## Validation Rules

1. **Current Property Value**:
   - Must be positive if provided
   - Reasonable range: 1M - 1000M HUF (can be adjusted)

2. **Expected Yearly Inflation**:
   - Range: -100% to +100%
   - Typically: 0% to 20%
   - Allow negative values for deflation scenarios

## Edge Cases

1. **Empty inputs**: Feature disabled, no additional column shown
2. **Partially filled**: Require both fields to activate feature
3. **Zero inflation**: Valid input, adjusted value equals current value
4. **Very high inflation**: Large numbers should format correctly
5. **Share URLs**: Old URLs without inflation params should work normally

## Testing Checklist

- [ ] Toggle button shows/hides panel correctly
- [ ] Panel state persists in localStorage
- [ ] Input validation works correctly
- [ ] Calculations are accurate (test with known values)
- [ ] Table column appears/disappears correctly
- [ ] Currency formatting is correct
- [ ] Both languages display correctly
- [ ] Share URL includes new parameters
- [ ] Loading shared URL populates inputs correctly
- [ ] Mobile responsive layout works
- [ ] Export to CSV includes new column when active

## Future Advanced Features (Not in this implementation)

Ideas for additional advanced features to add later:
- Extra payment calculator (lump sum payments)
- Payment frequency options (bi-weekly, weekly)
- Interest rate change scenarios
- Tax deduction calculator
- Prepayment penalty calculator
- Comparison mode (multiple scenarios side-by-side)

## Design Considerations

### Visual Consistency
- Use existing Shadcn UI components (Card, Collapsible, Input)
- Match existing input field styling
- Consistent spacing with rest of the form

### Performance
- Inflation calculations are lightweight (no performance impact)
- Maintain existing debouncing for recalculations
- No additional API calls required

### Accessibility
- Toggle button has proper aria-label
- Collapsible panel has proper aria attributes
- Input fields have associated labels
- Keyboard navigation works correctly

## Migration Notes

- No breaking changes to existing functionality
- All new features are optional/additive
- Existing localStorage data remains valid
- Backward compatible with existing share URLs
