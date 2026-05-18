import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const caseId = req.nextUrl.searchParams.get("caseId")

  if (!caseId) {
    return NextResponse.json({ error: "missing caseId" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "failed to fetch comments" }, { status: 500 })
  }

  return NextResponse.json({ comments: data })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { caseId, nickname, content } = await req.json()

  if (!caseId || !content?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 })
  }

  if (content.trim().length > 500) {
    return NextResponse.json({ error: "content too long" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      case_id: caseId,
      nickname: nickname?.trim() || "익명",
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "failed to post comment" }, { status: 500 })
  }

  return NextResponse.json({ comment: data })
}
