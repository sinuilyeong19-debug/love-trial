import { supabase } from "@/lib/supabase"
import CaseCard from "@/components/CaseCard"
import { Case } from "@/types"
import { Scale } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

async function getCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return []
  return data as Case[]
}

export default async function HomePage() {
  const cases = await getCases()

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* 히어로 배너 */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6 text-center space-y-3">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/20 p-3">
            <Scale className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">연애 재판</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          연애 갈등을 올리면 AI 판사가 판결하고<br />
          커뮤니티가 투표로 참여합니다
        </p>
        <Link href="/submit">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            내 사연 올리기
          </Button>
        </Link>
      </div>

      {/* 사연 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">최근 사연</h2>
          <span className="text-xs text-muted-foreground">{cases.length}개</span>
        </div>

        {cases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-2">
            <p className="text-muted-foreground text-sm">아직 사연이 없어요</p>
            <p className="text-xs text-muted-foreground">첫 번째 사연을 올려보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
