import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { caseId } = await req.json()
  if (!caseId) return NextResponse.json({ error: "caseId required" }, { status: 400 })

  const { data: caseData, error: fetchError } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single()

  if (fetchError || !caseData) {
    return NextResponse.json({ error: "case not found" }, { status: 404 })
  }

  const otherPart = caseData.other_story
    ? `\n\n[상대방 입장]\n${caseData.other_story}`
    : ""

  const prompt = `당신은 연애 갈등을 공정하게 판결하는 AI 판사입니다. 아래 사연을 읽고 판결문을 작성해주세요.

[카테고리] ${caseData.category}
[제목] ${caseData.title}

[제출자 입장]
${caseData.my_story}${otherPart}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "verdict": "판결문 (200~400자, 법원 판결문 스타일로 엄격하고 공정하게, 마지막에 최종 판결을 내려주세요)",
  "my_fault": 제출자의 잘못 비율 (0~100 사이 정수),
  "other_fault": 상대방의 잘못 비율 (0~100 사이 정수, my_fault + other_fault = 100)
}`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== "text") {
    return NextResponse.json({ error: "invalid response" }, { status: 500 })
  }

  let parsed: { verdict: string; my_fault: number; other_fault: number }
  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("no json")
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    return NextResponse.json({ error: "parse error" }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      status: "judged",
      ai_verdict: parsed.verdict,
      ai_my_fault: parsed.my_fault,
      ai_other_fault: parsed.other_fault,
    })
    .eq("id", caseId)

  if (updateError) {
    return NextResponse.json({ error: "update failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true, verdict: parsed.verdict })
}
