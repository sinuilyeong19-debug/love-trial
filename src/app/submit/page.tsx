"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Scale, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

const CATEGORY_GROUPS = [
  {
    group: "💑 연애",
    categories: [
      { value: "fight", label: "😤 다툼" },
      { value: "cheating", label: "💔 바람" },
      { value: "breakup", label: "😢 이별" },
      { value: "dating", label: "🌸 연애초기" },
      { value: "marriage", label: "💍 결혼" },
    ],
  },
  {
    group: "🏢 직장",
    categories: [
      { value: "work", label: "💼 직장/회사" },
    ],
  },
  {
    group: "👥 관계",
    categories: [
      { value: "friend", label: "👥 친구" },
      { value: "family", label: "👨‍👩‍👧 가족" },
    ],
  },
  {
    group: "🌐 기타",
    categories: [
      { value: "daily", label: "📅 일상" },
      { value: "etc", label: "💬 기타" },
    ],
  },
]

export default function SubmitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    nickname: "",
    category: "etc",
    my_story: "",
    other_story: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.my_story.trim()) {
      setError("제목과 내 사연은 필수입니다")
      return
    }
    if (form.my_story.trim().length < 30) {
      setError("사연은 최소 30자 이상 작성해주세요")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: newCase, error: insertError } = await supabase
        .from("cases")
        .insert({
          title: form.title.trim(),
          nickname: form.nickname.trim() || "익명",
          category: form.category,
          my_story: form.my_story.trim(),
          other_story: form.other_story.trim() || null,
          status: "pending",
        })
        .select()
        .single()

      if (insertError || !newCase) {
        setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.")
        setLoading(false)
        return
      }

      // AI 판결 요청 (비동기)
      fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: newCase.id }),
      })

      router.push(`/cases/${newCase.id}`)
    } catch {
      setError("알 수 없는 오류가 발생했습니다")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Scale className="h-5 w-5 text-primary" />
            사연 올리기
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            연애, 직장, 친구, 가족 등 어떤 갈등이든 판결받을 수 있어요.<br />
            상황을 솔직하게 적어주세요.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 제목 */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-foreground">
                제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="예) 상사가 내 아이디어 가로챘는데 제가 예민한 건가요?"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                maxLength={100}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-right text-xs text-muted-foreground">{form.title.length}/100</p>
            </div>

            {/* 닉네임 + 카테고리 */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="nickname" className="text-foreground">닉네임</Label>
                <Input
                  id="nickname"
                  placeholder="익명"
                  value={form.nickname}
                  onChange={(e) => update("nickname", e.target.value)}
                  maxLength={20}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">카테고리</Label>
                <div className="space-y-2">
                  {CATEGORY_GROUPS.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{group.group}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => update("category", cat.value)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                              form.category === cat.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 내 사연 */}
            <div className="space-y-1.5">
              <Label htmlFor="my_story" className="text-foreground">
                내 입장에서 본 상황 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="my_story"
                placeholder="있었던 일을 솔직하게 적어주세요. 구체적일수록 더 정확한 판결이 나옵니다."
                value={form.my_story}
                onChange={(e) => update("my_story", e.target.value)}
                rows={6}
                maxLength={2000}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{form.my_story.length}/2000</p>
            </div>

            {/* 상대방 입장 (선택) */}
            <div className="space-y-1.5">
              <Label htmlFor="other_story" className="text-foreground">
                상대방 입장{" "}
                <span className="text-muted-foreground text-xs font-normal">(선택 — 적으면 더 공정한 판결)</span>
              </Label>
              <Textarea
                id="other_story"
                placeholder="상대방이 한 말이나 상대방 입장에서 본 상황을 적어주세요"
                value={form.other_story}
                onChange={(e) => update("other_story", e.target.value)}
                rows={4}
                maxLength={1000}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* 에러 */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI 판사에게 전달 중...
                </>
              ) : (
                "⚖️ 재판 시작하기"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
