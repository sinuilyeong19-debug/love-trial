"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className="h-7 px-2.5 text-xs border-border text-muted-foreground hover:text-foreground hover:border-primary/50 gap-1.5"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-primary" />
          복사됨
        </>
      ) : (
        <>
          <Link2 className="h-3 w-3" />
          공유
        </>
      )}
    </Button>
  )
}
