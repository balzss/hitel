import React from 'react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  className?: string
}

export function Loader({ 
  size = 'md', 
  variant = 'spinner', 
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  if (variant === 'spinner') {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  if (variant === 'dots') {
    const dotSizes = {
      sm: 'w-1 h-1',
      md: 'w-1.5 h-1.5',
      lg: 'w-2 h-2'
    }

    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-full animate-pulse',
              dotSizes[size]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'bg-primary/20 rounded animate-pulse',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return null
}

// Specialized loader for calculation states
export function CalculationLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <div className="flex items-center space-x-2">
        <Loader variant="spinner" size="sm" />
        <span className="text-sm text-muted-foreground">Calculating...</span>
      </div>
    </div>
  )
}
