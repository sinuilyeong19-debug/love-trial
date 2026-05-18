"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">연애 재판</span>
        </Link>

        <Link href="/submit">
          <Button
            size="sm"
            className={cn(
              "gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90",
              pathname === "/submit" && "opacity-70"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            사연 올리기
          </Button>
        </Link>
      </div>
    </header>
  )
}
