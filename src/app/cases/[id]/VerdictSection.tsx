"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Loader2 } from "lucide-react"
import { Case } from "@/types"
import { supabase } from "@/lib/supabase"

interface VerdictSectionProps {
  caseData: Case
}

export default function VerdictSection({ caseData: initial }: VerdictSectionProps) {
  const [caseData, setCaseData] = useState(initial)
  const [polling, setPolling] = useState(initial.status === "pending")

  useEffect(() => {
    if (initial.status === "judged") return

    // 판결 완료될 때까지 3초마다 폴링
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
      <Card className="border-primary/30 bg-card">
        <CardContent className="py-8 text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <Scale className="h-10 w-10 text-primary/40" />
              <Loader2 className="h-5 w-5 text-primary animate-spin absolute -bottom-1 -right-1" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">AI 판사가 심리 중입니다...</p>
          <p className="text-xs text-muted-foreground">잠시만 기다려주세요. 판결이 나오면 자동으로 표시됩니다.</p>
        </CardContent>
      </Card>
    )
  }

  if (!caseData.ai_verdict) return null

  const myFault = caseData.ai_my_fault ?? 50
  const otherFault = caseData.ai_other_fault ?? 50

  return (
    <Card className="border-primary/40 bg-gradient-to-b from-primary/5 to-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Scale className="h-5 w-5" />
          AI 판사 판결문
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 잘잘못 비율 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary">제출자 잘못 {myFault}%</span>
            <span className="text-destructive">상대방 잘못 {otherFault}%</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-all duration-700"
              style={{ width: `${myFault}%` }}
            />
            <div
              className="bg-destructive transition-all duration-700"
              style={{ width: `${otherFault}%` }}
            />
          </div>
          <div className="text-center">
            {myFault < otherFault ? (
              <span className="text-xs font-semibold text-primary">
                → 상대방 잘못이 더 큽니다 ({otherFault}%)
              </span>
            ) : myFault > otherFault ? (
              <span className="text-xs font-semibold text-destructive">
                → 제출자 잘못이 더 큽니다 ({myFault}%)
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                → 쌍방 과실 (50:50)
              </span>
            )}
          </div>
        </div>

        {/* 판결문 */}
        <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {caseData.ai_verdict}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
