import { supabase } from "@/lib/supabase"
import { Case } from "@/types"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Scale, User, Users } from "lucide-react"
import { formatDate, getCategoryLabel } from "@/lib/utils"
import VoteSection from "./VoteSection"
import VerdictSection from "./VerdictSection"

export const dynamic = "force-dynamic"

async function getCase(id: string): Promise<Case | null> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as Case
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const caseData = await getCase(id)

  if (!caseData) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-secondary text-primary border-0 text-xs">
            {getCategoryLabel(caseData.category)}
          </Badge>
          {caseData.status === "judged" ? (
            <Badge className="bg-accent/20 text-primary border-accent/30 text-xs">
              <Scale className="h-3 w-3 mr-1" />
              판결 완료
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border text-muted-foreground text-xs">
              판결 대기 중...
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground leading-snug">{caseData.title}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {caseData.nickname}
          </span>
          <span>{formatDate(caseData.created_at)}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {caseData.vote_my_side + caseData.vote_other_side}명 참여
          </span>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* 내 입장 */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-1.5">
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs">내 입장</span>
            {caseData.nickname}의 이야기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {caseData.my_story}
          </p>
        </CardContent>
      </Card>

      {/* 상대방 입장 (있을 때만) */}
      {caseData.other_story && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-xs text-destructive">상대 입장</span>
              상대방의 이야기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {caseData.other_story}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI 판결 섹션 */}
      <VerdictSection caseData={caseData} />

      {/* 커뮤니티 투표 섹션 */}
      <VoteSection caseData={caseData} />
    </div>
  )
}
