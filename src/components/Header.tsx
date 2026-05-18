"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scale, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="rounded-lg bg-primary/15 p-1.5 group-hover:bg-primary/25 transition-colors">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground tracking-tight">우리 재판소</span>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">LIFE COURT</span>
          </div>
        </Link>

        <Link href="/submit">
          <Button
            size="sm"
            className={cn(
              "gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs h-8 px-4",
              pathname === "/submit" && "opacity-60 pointer-events-none"
            )}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>사연 올리기</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
