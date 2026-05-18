"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Loader2, Gavel } from "lucide-react"
import { Case } from "@/types"
import { supabase } from "@/lib/supabase"

interface VerdictSectionProps {
  caseData: Case
}

export default function VerdictSection({ caseData: initial }: VerdictSectionProps) {
  const [caseData, setCaseData] = useState(initial)
  const [polling, setPolling] = useState(initial.status === "pending")
  const [dots, setDots] = useState(0)

  // 로딩 애니메이션용 점 카운터
  useEffect(() => {
    if (!polling) return
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 600)
    return () => clearInterval(t)
  }, [polling])

  // 판결 완료될 때까지 폴링
  useEffect(() => {
    if (initial.status === "judged") return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("cases")
        .select("status, ai_verdict, ai_my_fault, ai_other_fault")
        .eq("id", initial.id)
        .single()

      if (data?.status === "judged") {
        setCaseData((prev) => ({ ...prev, ...data }))
        setPolling(false)
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [initial.id, initial.status])

  if (polling) {
    return (
      <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-card overflow-hidden">
        <CardContent className="py-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-full bg-primary/10 p-4 ring-4 ring-primary/5">
                <Scale className="h-10 w-10 text-primary/60" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-card p-1">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI 판사가 심리 중입니다{"." .repeat(dots + 1)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              잠시 후 판결문이 자동으로 표시됩니다
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!caseData.ai_verdict) return null

  const myFault = caseData.ai_my_fault ?? 50
  const otherFault = caseData.ai_other_fault ?? 50

  const isMyFault = myFault > otherFault
  const isBothFault = myFault === otherFault

  return (
    <Card className="border-primary/40 bg-gradient-to-b from-primary/8 to-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-primary/15">
        <CardTitle className="flex items-center gap-2 text-primary text-base">
          <Gavel className="h-5 w-5" />
          AI 판사 판결문
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* 주문 (결론) */}
        <div
          className={`rounded-xl p-4 border text-center space-y-1 ${
            isBothFault
              ? "bg-muted/40 border-border"
              : isMyFault
              ? "bg-destructive/10 border-destructive/30"
              : "bg-primary/10 border-primary/30"
          }`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">주 문</p>
          <p
            className={`text-lg font-bold ${
              isBothFault
                ? "text-foreground"
                : isMyFault
                ? "text-destructive"
                : "text-primary"
            }`}
          >
            {isBothFault
              ? "⚖️ 쌍방 과실 (50:50)"
              : isMyFault
              ? `😬 제출자 잘못이 더 큽니다 (${myFault}%)`
              : `✅ 상대방 잘못이 더 큽니다 (${otherFault}%)`}
          </p>
        </div>

        {/* 잘잘못 비율 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium px-1">
            <span className="text-primary">원고 잘못 {myFault}%</span>
            <span className="text-destructive">피고 잘못 {otherFault}%</span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ width: `${myFault}%` }}
            >
              {myFault > 15 && (
                <span className="text-[10px] font-bold text-primary-foreground">{myFault}%</span>
              )}
            </div>
            <div
              className="absolute right-0 top-0 h-full bg-destructive transition-all duration-1000 ease-out flex items-center justify-start pl-2"
              style={{ width: `${otherFault}%` }}
            >
              {otherFault > 15 && (
                <span className="text-[10px] font-bold text-white">{otherFault}%</span>
              )}
            </div>
          </div>
        </div>

        {/* 이유 */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">이 유</p>
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {caseData.ai_verdict}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
