import { useState } from 'react'

type SetValue<T> = T | ((val: T) => T)

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      if (!item) {
        return initialValue
      }
      
      // Try to parse as JSON first
      try {
        return JSON.parse(item)
      } catch (parseError) {
        // If JSON parsing fails, check if it's a simple string value
        // This handles cases where values were stored without JSON.stringify
        console.warn(`Failed to parse localStorage value for key "${key}": ${parseError}`)
        console.warn(`Attempting to use raw value: "${item}"`)
        
        // For string values or string union types, try to use the raw value
        if (typeof initialValue === 'string' || 
            (typeof item === 'string' && item.trim().length > 0)) {
          return item as T
        }
        
        // For other types, fall back to initial value and clear the invalid storage
        console.warn(`Clearing invalid localStorage value for key "${key}"`)
        window.localStorage.removeItem(key)
        return initialValue
      }
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
