"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, Users, MessageSquare } from "lucide-react"
import { Case } from "@/types"
import { formatDate, getCategoryLabel } from "@/lib/utils"

interface CaseCardProps {
  caseData: Case
}

export default function CaseCard({ caseData }: CaseCardProps) {
  const total = caseData.vote_my_side + caseData.vote_other_side
  const myPercent = total > 0 ? Math.round((caseData.vote_my_side / total) * 100) : 50
  const otherPercent = total > 0 ? 100 - myPercent : 50

  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card className="border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 cursor-pointer">
        <CardContent className="p-4 space-y-3">
          {/* 상단: 카테고리 + 상태 */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs bg-secondary text-primary border-0">
              {getCategoryLabel(caseData.category)}
            </Badge>
            <div className="flex items-center gap-1.5">
              {caseData.status === "judged" ? (
                <Badge className="text-xs bg-accent/20 text-primary border-accent/30">
                  <Scale className="h-3 w-3 mr-1" />
                  판결 완료
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  판결 대기
                </Badge>
              )}
            </div>
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
            {caseData.title}
          </h3>

          {/* 사연 미리보기 */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {caseData.my_story}
          </p>

          {/* 투표 바 */}
          {total > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${myPercent}%` }}
                />
                <div
                  className="bg-destructive transition-all duration-500"
                  style={{ width: `${otherPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-primary font-medium">내 편 {myPercent}%</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {total}명 참여
                </span>
                <span className="text-destructive font-medium">상대 편 {otherPercent}%</span>
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              아직 투표 없음 — 첫 번째로 판결해보세요
            </div>
          )}

          {/* 하단: 닉네임 + 시간 */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border">
            <span>{caseData.nickname}</span>
            <span>{formatDate(caseData.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
