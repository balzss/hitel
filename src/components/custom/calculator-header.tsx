"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Share2, Globe, Github, Clipboard, Share } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/custom/theme-toggle'

import { type Language, getTranslation } from '@/lib/i18n'

interface CalculatorHeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
  loanAmount: string
  totalMonths: number
  interestRate: string
}

export function CalculatorHeader({
  language,
  onLanguageChange,
  loanAmount,
  totalMonths,
  interestRate
}: CalculatorHeaderProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const pathname = usePathname()

  // Get current translations
  const t = getTranslation(language)

  // Get language display name
  const getLanguageDisplayName = (lang: Language) => {
    const translations = getTranslation(lang)
    return lang === 'hu' ? translations.languageHu : translations.languageEn
  }

  // Generate shareable URL on-demand
  const generateShareableUrl = () => {
    if (typeof window === 'undefined') return ''

    const params = new URLSearchParams()
    if (loanAmount) params.set('amt', loanAmount)
    if (totalMonths > 0) params.set('term', totalMonths.toString())
    if (interestRate) params.set('rate', interestRate)

    const baseUrl = `${window.location.protocol}//${window.location.host}${pathname}`
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }

  // Share functions
  const handleCopyUrl = async () => {
    try {
      const shareableUrl = generateShareableUrl()
      await navigator.clipboard.writeText(shareableUrl)
      setIsShareDialogOpen(false)
      toast.success(t.urlCopied)
    } catch (_err) {
      toast.error('Failed to copy URL')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const shareableUrl = generateShareableUrl()
        await navigator.share({
          title: t.shareCalculation,
          url: shareableUrl,
        })
        setIsShareDialogOpen(false)
      } catch (_err) {
        console.log('Share cancelled')
      }
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link
            href="https://github.com/balzss/hitel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </Button>
        <ThemeToggle />
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger >
            <SelectValue>
              <div className="flex items-center gap-2">
                <Globe />
                {getLanguageDisplayName(language)}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hu">{getLanguageDisplayName('hu')}</SelectItem>
            <SelectItem value="en">{getLanguageDisplayName('en')}</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Share2 />
              {t.share}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.shareCalculation}</DialogTitle>
              <DialogDescription>
                Share this mortgage calculation with others
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={generateShareableUrl()}
                className="flex-1"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 justify-end">
              {canNativeShare && (
                <Button onClick={handleNativeShare} variant="outline">
                  <Share />
                  {t.shareVia}
                </Button>
              )}
              <Button onClick={handleCopyUrl}>
                <Clipboard />
                {t.copyUrl}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
