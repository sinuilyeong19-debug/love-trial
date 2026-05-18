import { supabase } from "@/lib/supabase"
import CaseCard from "@/components/CaseCard"
import { Case } from "@/types"
import { Scale, Flame, Clock, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "fight", label: "😤 다툼" },
  { value: "cheating", label: "💔 바람" },
  { value: "breakup", label: "😢 이별" },
  { value: "dating", label: "🌸 연애초기" },
  { value: "marriage", label: "💍 결혼" },
  { value: "etc", label: "💬 기타" },
]

async function getCases(cat: string, sort: string): Promise<Case[]> {
  let query = supabase.from("cases").select("*")

  if (cat && cat !== "all") {
    query = query.eq("category", cat)
  }

  const { data, error } = await query.limit(100)
  if (error) return []

  const cases = data as Case[]

  if (sort === "hot") {
    return cases.sort(
      (a, b) =>
        b.vote_my_side + b.vote_other_side - (a.vote_my_side + a.vote_other_side)
    )
  }

  return cases.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

async function getStats(): Promise<{ totalCases: number; totalVotes: number }> {
  const { data } = await supabase
    .from("cases")
    .select("vote_my_side, vote_other_side")

  const totalCases = data?.length ?? 0
  const totalVotes =
    data?.reduce((acc, c) => acc + c.vote_my_side + c.vote_other_side, 0) ?? 0

  return { totalCases, totalVotes }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; sort?: string }>
}) {
  const { cat = "all", sort = "new" } = await searchParams
  const [cases, stats] = await Promise.all([getCases(cat, sort), getStats()])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* 히어로 배너 */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/20 p-4 ring-4 ring-primary/10">
            <Scale className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">연애 재판</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            연애 갈등을 올리면 AI 판사가 판결하고<br />
            커뮤니티가 함께 심판합니다
          </p>
        </div>

        {/* 라이브 통계 */}
        <div className="flex justify-center gap-10 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary tabular-nums">{stats.totalCases}</div>
            <div className="text-xs text-muted-foreground mt-0.5">총 사연</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary tabular-nums">{stats.totalVotes}</div>
            <div className="text-xs text-muted-foreground mt-0.5">총 투표</div>
          </div>
        </div>

        <Link href="/submit">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full">
            ⚖️ 내 사연 올리기
          </Button>
        </Link>
      </div>

      {/* 카테고리 필터 */}
      <div className="space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <Link key={c.value} href={`/?cat=${c.value}&sort=${sort}`}>
              <span
                className={`inline-block rounded-full px-3 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                  cat === c.value
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c.label}
              </span>
            </Link>
          ))}
        </div>

        {/* 정렬 */}
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-muted-foreground mr-1">정렬</span>
          <Link href={`/?cat=${cat}&sort=new`}>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                sort !== "hot"
                  ? "bg-secondary text-primary border-primary/30"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              <Clock className="h-3 w-3" />
              최신순
            </span>
          </Link>
          <Link href={`/?cat=${cat}&sort=hot`}>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                sort === "hot"
                  ? "bg-secondary text-primary border-primary/30"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              <Flame className="h-3 w-3" />
              인기순
            </span>
          </Link>
        </div>
      </div>

      {/* 사연 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">
            {CATEGORIES.find((c) => c.value === cat)?.label ?? "전체"} 사연
          </h2>
          <span className="text-xs text-muted-foreground">{cases.length}건</span>
        </div>

        {cases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
            <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm font-medium">아직 사연이 없어요</p>
            <p className="text-xs text-muted-foreground">첫 번째 사연을 올려보세요!</p>
            <Link href="/submit">
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                사연 올리기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c, i) => (
              <CaseCard key={c.id} caseData={c} rank={sort === "hot" ? i + 1 : undefined} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
