"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, Users, MessageSquare, Flame } from "lucide-react"
import { Case } from "@/types"
import { formatDate, getCategoryLabel } from "@/lib/utils"

interface CaseCardProps {
  caseData: Case
  rank?: number
}

export default function CaseCard({ caseData, rank }: CaseCardProps) {
  const total = (caseData.vote_my_side ?? 0) + (caseData.vote_other_side ?? 0)
  const myPercent = total > 0 ? Math.round((caseData.vote_my_side / total) * 100) : 50
  const otherPercent = total > 0 ? 100 - myPercent : 50

  const myFault = caseData.ai_my_fault
  const otherFault = caseData.ai_other_fault

  // AI 판결 요약
  let verdictLabel = ""
  if (caseData.status === "judged" && myFault !== null && otherFault !== null) {
    if (myFault === 50 && otherFault === 50) {
      verdictLabel = "⚖️ 쌍방 과실"
    } else if (myFault > otherFault) {
      verdictLabel = `😬 제출자 잘못 ${myFault}%`
    } else {
      verdictLabel = `✅ 상대방 잘못 ${otherFault}%`
    }
  }

  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card className="border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4 space-y-3">
          {/* 상단: 카테고리 + 상태 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {rank && rank <= 3 && (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                  <Flame className="h-3 w-3" />
                  {rank === 1 ? "1위" : rank === 2 ? "2위" : "3위"}
                </span>
              )}
              <Badge variant="secondary" className="text-xs bg-secondary text-primary border-0">
                {getCategoryLabel(caseData.category)}
              </Badge>
              {caseData.status === "judged" ? (
                <Badge className="text-xs bg-accent/20 text-primary border-accent/30">
                  <Scale className="h-3 w-3 mr-1" />
                  판결 완료
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground animate-pulse">
                  심리 중...
                </Badge>
              )}
            </div>
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {caseData.title}
          </h3>

          {/* AI 판결 결과 (있을 때) */}
          {verdictLabel && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary">
              {verdictLabel}
            </div>
          )}

          {/* 사연 미리보기 */}
          {!verdictLabel && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {caseData.my_story}
            </p>
          )}

          {/* 투표 바 */}
          {total > 0 ? (
            <div className="space-y-1.5">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary transition-all duration-700"
                  style={{ width: `${myPercent}%` }}
                />
                <div
                  className="bg-destructive transition-all duration-700"
                  style={{ width: `${otherPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-primary font-medium">내 편 {myPercent}%</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {total}명
                </span>
                <span className="text-destructive font-medium">상대 편 {otherPercent}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              첫 번째로 투표해보세요!
            </div>
          )}

          {/* 하단 */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border">
            <span className="font-medium">{caseData.nickname}</span>
            <span>{formatDate(caseData.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
