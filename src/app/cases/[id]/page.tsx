import { supabase } from "@/lib/supabase"
import { createServerSupabase } from "@/lib/supabase-server"
import { Case, Comment } from "@/types"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Scale, User, Users, ChevronLeft } from "lucide-react"
import { formatDate, getCategoryLabel } from "@/lib/utils"
import Link from "next/link"
import VoteSection from "./VoteSection"
import VerdictSection from "./VerdictSection"
import ShareButton from "./ShareButton"
import CommentSection from "./CommentSection"

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

async function getComments(caseId: string): Promise<Comment[]> {
  const supabaseServer = createServerSupabase()
  const { data } = await supabaseServer
    .from("comments")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  return (data as Comment[]) ?? []
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [caseData, comments] = await Promise.all([getCase(id), getComments(id)])

  if (!caseData) notFound()

  const total = (caseData.vote_my_side ?? 0) + (caseData.vote_other_side ?? 0)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
        목록으로
      </Link>

      {/* 헤더 */}
      <div className="space-y-2.5">
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
            <Badge variant="outline" className="border-border text-muted-foreground text-xs animate-pulse">
              AI 심리 중...
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground leading-snug">{caseData.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {caseData.nickname}
            </span>
            <span>{formatDate(caseData.created_at)}</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {total}명 참여
            </span>
          </div>
          <ShareButton />
        </div>
      </div>

      <Separator className="bg-border" />

      {/* 두 입장 나란히 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 내 입장 */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              원고
            </span>
            <span className="text-xs font-medium text-foreground">{caseData.nickname}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {caseData.my_story}
          </p>
        </div>

        {/* 상대방 입장 */}
        {caseData.other_story ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                피고
              </span>
              <span className="text-xs font-medium text-foreground">상대방</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {caseData.other_story}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 flex flex-col items-center justify-center text-center space-y-2 min-h-[120px]">
            <span className="text-2xl">🤐</span>
            <p className="text-xs text-muted-foreground">상대방 입장 없음</p>
            <p className="text-xs text-muted-foreground/60">원고 측 진술만 제출됨</p>
          </div>
        )}
      </div>

      {/* AI 판결 섹션 */}
      <VerdictSection caseData={caseData} />

      {/* 커뮤니티 투표 섹션 */}
      <VoteSection caseData={caseData} />

      {/* 배심원 댓글 섹션 */}
      <CommentSection caseId={caseData.id} initialComments={comments} />
    </div>
  )
}
