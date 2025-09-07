# Vibe Coding Master Plan: Next.js Hungarian Mortgage Calculator

## 1. Our Persona & Guiding Principles

### Your Persona
You are my senior development partner, an expert in Next.js, TypeScript, and building performant, accessible web applications. You have a keen eye for clean UI/UX and write type-safe, maintainable, and highly efficient code. You think step-by-step and will present the code for each step before proceeding to the next.

### Guiding Principles

- **Performance First**: The application must be extremely fast. We will use static site generation (output: 'export') for instant loading. All calculations will be handled client-side with no lag.

- **Mobile-First & Responsive**: The UI will be designed for mobile screens first and scale perfectly to desktop.

- **Type Safety**: We will leverage TypeScript strictly throughout the project.

- **Component-Based Architecture**: We will use shadcn/ui components (located in `components/ui`) and our custom components (in `components/custom`) to build a clean, consistent, and accessible interface.

- **Clean State Management**: We will use React hooks (`useState`, `useEffect`, `useCallback`) for all state management. No complex state management libraries are needed.

- **Persistence & Sharability**: User settings and last-used values will be saved to localStorage. Input values will also be synchronized with URL search parameters to allow sharing specific calculations.

## 2. The Project: A Minimalist Mortgage Calculator

We are building a single-page, statically-generated mortgage calculator tailored for the Hungarian market.

### Tech Stack

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui (using default styles: Slate theme, New York font)
- Lucide React (for icons)

## 3. Component & State Plan

### File Structure

- `app/layout.tsx`: Root layout to contain providers (Theme, Language, Toaster).
- `app/page.tsx`: The main page component that will import and render our calculator.
- `components/custom/mortgage-calculator.tsx`: The core interactive component containing all logic and UI.
- `components/custom/theme-provider.tsx` & `components/custom/theme-toggle.tsx`: For light/dark mode functionality.
- `lib/i18n.ts`: A simple file to hold our Hungarian and English translation strings.
- `hooks/use-local-storage.ts`: A custom hook to abstract localStorage logic.

### State Management (mortgage-calculator.tsx)

#### State Priority
On initial load, the component will prioritize setting its state in the following order:

1. URL Search Parameters (if present)
2. localStorage values (if present)
3. Default initial values

#### State Variables
- **Inputs**: `loanAmount` (string), `loanTermMonths` (string), `interestRate` (string).
- **Outputs**: `monthlyPayment` (number | null), `amortizationSchedule` (array | null).
- **UI State**: `language` ('hu' | 'en'), `showDetails` (boolean).

## 4. The Step-by-Step Build Plan

Please follow these steps in order. Complete each step fully and present the code before moving on.

### Step 0: Project Initialization

1. Initialize a new Next.js project:
```bash
npx create-next-app@latest mortgage-calculator -ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

2. Navigate into the project directory.

3. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```
   - Style: Default
   - Base color: Slate
   - CSS variables: Yes

4. Add the required shadcn/ui components and lucide-react:
```bash
npx shadcn-ui@latest add card input label button select separator table collapsible dialog sonner
npm install lucide-react
```

### Step 1: Theme Provider & Language Setup

- Create `components/custom/theme-provider.tsx` using the standard code from next-themes.
- Create `components/custom/theme-toggle.tsx` button.
- In `app/layout.tsx`, wrap the children with the ThemeProvider and add the `<Toaster />` component from sonner.
- Create `lib/i18n.ts` with translation strings. Include new strings for the share dialog (e.g., "Share Calculation", "Copy URL", "URL Copied!", "Share via...").

### Step 2: Custom useLocalStorage Hook

Create `hooks/use-local-storage.ts`. This hook will handle reading from and writing to localStorage safely.

### Step 3: Build the Calculator Component (mortgage-calculator.tsx)

This is the most complex step. We will build it incrementally.

#### Initial Setup

- Create `components/custom/mortgage-calculator.tsx`.
- Import necessary hooks from React (`useState`, `useEffect`, `useCallback`) and Next.js (`useRouter`, `useSearchParams`, `usePathname`).
- Import `useLocalStorage`, translations, and shadcn/ui components.

#### State Management & Initialization

- Use `useLocalStorage` to get the default values for `loanAmount`, `loanTermMonths`, and `interestRate`.
- Use `useState` to hold the active values for these inputs.
- Use a `useEffect` hook that runs once on component mount. Inside it, use `useSearchParams` to read URL parameters. If valid parameters exist, update the active state with them, overriding the values from localStorage. If not, initialize the state with the values from localStorage.

#### URL Sync

- Create a `useEffect` hook that listens for changes to the active input states (`loanAmount`, `loanTermMonths`, `interestRate`).
- Inside this effect, use a debounce mechanism (e.g., `setTimeout` with a 500ms delay) to avoid updating the URL on every keystroke.
- When the debounced effect runs, use `useRouter` to update the URL's search parameters with the current input values without reloading the page.

#### UI and Calculation Logic

- Build the main UI with `<Card>`, `<Input>`, etc.
- Implement the `calculateMortgage` function and the `useEffect` that triggers it, as described in the previous plan.

#### Share Functionality

- Add a `<Dialog>` component to the JSX.
- The `<DialogTrigger>` will be a `<Button>` with a Share2 icon from Lucide, placed in the card header.

##### Dialog Content

- Inside the dialog, display the title "Share Calculation".
- Add a read-only `<Input>` that displays the current shareable URL (`window.location.href`).

##### Dialog Footer Actions

- Add a "Copy URL" button. Its `onClick` handler should call `navigator.clipboard.writeText(window.location.href)` and trigger a toast notification (from sonner) saying "URL Copied!".
- Add a "Share via device" button. Its `onClick` should check for `navigator.share` and, if available, call `navigator.share({ title: 'Mortgage Calculation', url: window.location.href })`. This button should be conditionally rendered only if `navigator.share` is available.

### Step 4: Final Assembly & Static Export

- In `app/page.tsx`, render the `<MortgageCalculator />` component inside a `<Suspense>` boundary, as `useSearchParams` requires it.
- Modify `next.config.mjs` to enable static site generation.

### Step 5: Automated Deployment with GitHub Actions

1. In your project's root, create a new directory path: `.github/workflows/`.
2. Inside that directory, create a new file named `deploy.yml`.
3. Paste the following code into `deploy.yml`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

