"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import { Comment } from "@/types"
import { formatDate } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface CommentSectionProps {
  caseId: string
  initialComments: Comment[]
}

export default function CommentSection({ caseId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [nickname, setNickname] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Realtime 댓글 구독
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment
          setComments((prev) => {
            // 내가 방금 올린 댓글은 이미 낙관적 업데이트 됐으니 중복 방지
            if (prev.find((c) => c.id === newComment.id)) return prev
            return [...prev, newComment]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    if (content.trim().length > 500) {
      setError("댓글은 500자 이하로 작성해주세요")
      return
    }

    setLoading(true)
    setError("")

    // 낙관적 업데이트 (바로 화면에 표시)
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      case_id: caseId,
      nickname: nickname.trim() || "익명",
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimistic])
    setContent("")

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        nickname: nickname.trim() || "익명",
        content: optimistic.content,
      }),
    })

    if (!res.ok) {
      // 실패하면 낙관적 업데이트 롤백
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setError("댓글 등록에 실패했습니다. 다시 시도해주세요.")
    }

    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <MessageCircle className="h-4 w-4 text-primary" />
          배심원 의견
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {comments.length}개
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 댓글 목록 */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-6 space-y-1">
              <p className="text-sm text-muted-foreground">아직 의견이 없어요</p>
              <p className="text-xs text-muted-foreground/60">첫 번째 배심원 의견을 남겨보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl bg-muted/40 border border-border/50 px-3 py-2.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {comment.nickname}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* 댓글 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-border pt-3">
          <Input
            placeholder="닉네임 (선택, 기본 익명)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="h-8 text-xs bg-input border-border"
          />
          <div className="flex gap-2">
            <Textarea
              placeholder="이 사건에 대한 의견을 남겨주세요..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError("")
              }}
              rows={2}
              maxLength={500}
              className="text-sm bg-input border-border resize-none flex-1"
            />
            <Button
              type="submit"
              disabled={loading || !content.trim()}
              className="h-auto px-3 bg-primary text-primary-foreground hover:bg-primary/90 self-stretch"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-right text-[10px] text-muted-foreground">{content.length}/500</p>
        </form>
      </CardContent>
    </Card>
  )
}
