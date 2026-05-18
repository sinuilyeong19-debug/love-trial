import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { caseId, voteType, voterToken } = await req.json()

  if (!caseId || !voteType || !voterToken) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }
  if (voteType !== "my_side" && voteType !== "other_side") {
    return NextResponse.json({ error: "invalid voteType" }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("case_id", caseId)
    .eq("voter_token", voterToken)
    .single()

  if (existing) {
    return NextResponse.json({ error: "already_voted", vote_type: existing.vote_type }, { status: 409 })
  }

  const { error: voteError } = await supabase.from("votes").insert({
    case_id: caseId,
    vote_type: voteType,
    voter_token: voterToken,
  })

  if (voteError) {
    return NextResponse.json({ error: "vote failed" }, { status: 500 })
  }

  const column = voteType === "my_side" ? "vote_my_side" : "vote_other_side"
  const { data: caseData } = await supabase
    .from("cases")
    .select(column)
    .eq("id", caseId)
    .single()

  if (caseData) {
    const current = (caseData as Record<string, number>)[column] ?? 0
    await supabase
      .from("cases")
      .update({ [column]: current + 1 })
      .eq("id", caseId)
  }

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const caseId = req.nextUrl.searchParams.get("caseId")
  const voterToken = req.nextUrl.searchParams.get("voterToken")

  if (!caseId || !voterToken) {
    return NextResponse.json({ hasVoted: false })
  }

  const { data } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("case_id", caseId)
    .eq("voter_token", voterToken)
    .single()

  return NextResponse.json({ hasVoted: !!data, vote_type: data?.vote_type ?? null })
}
