"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ThumbsUp, ThumbsDown, Check, Share2 } from "lucide-react"
import { Case, VoteType } from "@/types"
import { getVoterToken } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface VoteSectionProps {
  caseData: Case
}

export default function VoteSection({ caseData: initial }: VoteSectionProps) {
  const [votes, setVotes] = useState({
    my_side: initial.vote_my_side,
    other_side: initial.vote_other_side,
  })
  const [myVote, setMyVote] = useState<VoteType | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [shareMsg, setShareMsg] = useState("")

  useEffect(() => {
    const token = getVoterToken()
    fetch(`/api/vote?caseId=${initial.id}&voterToken=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hasVoted) setMyVote(d.vote_type)
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [initial.id])

  // Realtime 투표 수 동기화
  useEffect(() => {
    const channel = supabase
      .channel(`case-votes-${initial.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cases",
          filter: `id=eq.${initial.id}`,
        },
        (payload) => {
          const row = payload.new as Case
          setVotes({ my_side: row.vote_my_side, other_side: row.vote_other_side })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initial.id])

  async function handleVote(voteType: VoteType) {
    if (myVote || loading || checking) return
    setLoading(true)

    const token = getVoterToken()
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: initial.id, voteType, voterToken: token }),
    })

    if (res.ok) {
      setMyVote(voteType)
      setVotes((prev) => ({
        ...prev,
        [voteType]: prev[voteType] + 1,
      }))
    }
    setLoading(false)
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg("링크 복사됨! 친구에게 공유해보세요 👀")
      setTimeout(() => setShareMsg(""), 3000)
    } catch {
      setShareMsg("링크를 복사해서 공유해보세요!")
      setTimeout(() => setShareMsg(""), 3000)
    }
  }

  const total = votes.my_side + votes.other_side
  const myPercent = total > 0 ? Math.round((votes.my_side / total) * 100) : 50
  const otherPercent = total > 0 ? 100 - myPercent : 50
  const hasVoted = !!myVote

  const winner =
    total > 0
      ? myPercent > otherPercent
        ? "내 편 우세"
        : otherPercent > myPercent
        ? "상대 편 우세"
        : "박빙"
      : null

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Users className="h-4 w-4 text-primary" />
          커뮤니티 투표
          {winner && (
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
              현재 {winner}
            </span>
          )}
          <span className="ml-auto text-xs font-normal text-muted-foreground">{total}명 참여</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 투표 바 */}
        {total > 0 && (
          <div className="space-y-2">
            <div className="relative flex h-5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-primary transition-all duration-700 ease-out flex items-center justify-end pr-2"
                style={{ width: `${myPercent}%` }}
              >
                {myPercent > 18 && (
                  <span className="text-[10px] font-bold text-primary-foreground">{myPercent}%</span>
                )}
              </div>
              <div
                className="bg-destructive transition-all duration-700 ease-out flex items-center justify-start pl-2"
                style={{ width: `${otherPercent}%` }}
              >
                {otherPercent > 18 && (
                  <span className="text-[10px] font-bold text-white">{otherPercent}%</span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
              <span className="text-primary font-semibold">
                내 편 {votes.my_side}표 ({myPercent}%)
              </span>
              <span className="text-destructive font-semibold">
                상대 편 {votes.other_side}표 ({otherPercent}%)
              </span>
            </div>
          </div>
        )}

        {/* 투표 버튼 */}
        {!checking && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={hasVoted || loading}
              onClick={() => handleVote("my_side")}
              className={`h-16 flex-col gap-1.5 border-2 transition-all rounded-xl ${
                myVote === "my_side"
                  ? "border-primary bg-primary/20 text-primary shadow-md shadow-primary/20"
                  : hasVoted
                  ? "border-border opacity-40 cursor-not-allowed"
                  : "border-border hover:border-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {myVote === "my_side" ? (
                <Check className="h-5 w-5" />
              ) : (
                <ThumbsUp className="h-5 w-5" />
              )}
              <span className="text-xs font-semibold">
                {myVote === "my_side" ? "✓ 내 편 투표함" : "내 편"}
              </span>
            </Button>

            <Button
              variant="outline"
              disabled={hasVoted || loading}
              onClick={() => handleVote("other_side")}
              className={`h-16 flex-col gap-1.5 border-2 transition-all rounded-xl ${
                myVote === "other_side"
                  ? "border-destructive bg-destructive/20 text-destructive shadow-md shadow-destructive/20"
                  : hasVoted
                  ? "border-border opacity-40 cursor-not-allowed"
                  : "border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
              }`}
            >
              {myVote === "other_side" ? (
                <Check className="h-5 w-5" />
              ) : (
                <ThumbsDown className="h-5 w-5" />
              )}
              <span className="text-xs font-semibold">
                {myVote === "other_side" ? "✓ 상대 편 투표함" : "상대 편"}
              </span>
            </Button>
          </div>
        )}

        {/* 투표 후 공유 유도 */}
        {hasVoted && (
          <div className="space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              투표 완료! 결과는 실시간으로 반영됩니다.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="w-full text-xs text-muted-foreground hover:text-primary gap-2"
            >
              <Share2 className="h-3.5 w-3.5" />
              이 사연 친구에게 공유하기
            </Button>
            {shareMsg && (
              <p className="text-center text-xs text-primary animate-in fade-in">{shareMsg}</p>
            )}
          </div>
        )}

        {!hasVoted && !checking && total === 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            🗳️ 첫 번째 배심원이 되어보세요!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
