import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
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

  let verdict: string
  let my_fault: number
  let other_fault: number

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (apiKey && apiKey !== "your_anthropic_api_key") {
    // ── 실제 Claude API 호출 ──
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk")
      const anthropic = new Anthropic({ apiKey })

      const otherPart = caseData.other_story
        ? `\n\n[상대방 입장]\n${caseData.other_story}`
        : ""

      const prompt = `당신은 갈등을 공정하게 판결하는 AI 판사입니다. 아래 사연을 읽고 판결문을 작성해주세요.

[카테고리] ${caseData.category}
[제목] ${caseData.title}

[제출자 입장]
${caseData.my_story}${otherPart}

다음 JSON 형식으로만 응답하세요:
{
  "verdict": "판결문 (200~400자, 법원 판결문 스타일로 엄격하고 공정하게)",
  "my_fault": 제출자의 잘못 비율 (0~100 정수),
  "other_fault": 상대방의 잘못 비율 (my_fault + other_fault = 100)
}`

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      })

      const content = message.content[0]
      if (content.type !== "text") throw new Error("invalid response")

      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("no json")
      const parsed = JSON.parse(jsonMatch[0])
      verdict = parsed.verdict
      my_fault = parsed.my_fault
      other_fault = parsed.other_fault
    } catch (e) {
      console.warn("[judge] Claude API 실패, mock으로 대체:", e)
      ;({ verdict, my_fault, other_fault } = generateMockVerdict(caseData))
    }
  } else {
    // ── API 키 없을 때 mock 판결 ──
    ;({ verdict, my_fault, other_fault } = generateMockVerdict(caseData))
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      status: "judged",
      ai_verdict: verdict,
      ai_my_fault: my_fault,
      ai_other_fault: other_fault,
    })
    .eq("id", caseId)

  if (updateError) {
    return NextResponse.json({ error: "update failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true, verdict })
}

function generateMockVerdict(caseData: {
  title: string
  my_story: string
  other_story?: string | null
  category: string
  nickname: string
}): { verdict: string; my_fault: number; other_fault: number } {
  const hasOtherStory = !!caseData.other_story

  // 카테고리별 판결 패턴
  const patterns: Record<string, { my: number; other: number; tone: string }[]> = {
    cheating: [
      { my: 10, other: 90, tone: "피고의 행위는 신뢰를 심각하게 훼손하였습니다." },
      { my: 20, other: 80, tone: "본 법정은 피고의 행동에 중대한 과실이 있음을 인정합니다." },
    ],
    fight: [
      { my: 40, other: 60, tone: "양측 모두 감정 조절에 실패한 부분이 있으나, 피고 측 귀책이 더 큽니다." },
      { my: 50, other: 50, tone: "본 사안은 쌍방 과실로, 서로에 대한 배려가 부족하였습니다." },
      { my: 60, other: 40, tone: "원고 측에 다소 과도한 반응이 있었음을 인정합니다." },
    ],
    breakup: [
      { my: 30, other: 70, tone: "이별의 방식에 있어 피고 측 배려가 부족하였습니다." },
      { my: 50, other: 50, tone: "이별은 쌍방의 선택이나, 그 과정에서 상호 존중이 결여되었습니다." },
    ],
    work: [
      { my: 20, other: 80, tone: "직장 내 관계에서 상대방의 행동은 명백히 선을 넘었습니다." },
      { my: 35, other: 65, tone: "업무 관계에서 피고 측이 적절한 경계를 지키지 않았습니다." },
    ],
    friend: [
      { my: 30, other: 70, tone: "우정 관계에서 피고의 행동은 신뢰를 저버린 것입니다." },
      { my: 45, other: 55, tone: "친구 사이에서 발생한 본 사안은 소통 부재에서 비롯되었습니다." },
    ],
    family: [
      { my: 25, other: 75, tone: "가족 간의 경계를 침범한 피고 측 과실이 큽니다." },
      { my: 50, other: 50, tone: "가족 관계에서 양측 모두 상대의 감정을 충분히 고려하지 못했습니다." },
    ],
  }

  const categoryPatterns = patterns[caseData.category] ?? patterns.fight
  const pattern = categoryPatterns[Math.floor(Math.random() * categoryPatterns.length)]

  // 상대방 진술이 있으면 조금 더 공정하게
  const my_fault = hasOtherStory
    ? Math.min(Math.max(pattern.my + Math.floor(Math.random() * 11) - 5, 5), 95)
    : Math.min(Math.max(pattern.my - 5, 5), 95)
  const other_fault = 100 - my_fault

  const winner = my_fault < other_fault ? "상대방" : my_fault > other_fault ? "제출자" : "쌍방"
  const winnerLine =
    my_fault === other_fault
      ? "본 법정은 양측 모두에게 동등한 책임이 있다고 판결합니다."
      : `본 법정은 ${winner} 측에 더 큰 책임이 있다고 판결합니다.`

  const verdict = `주문: ${winnerLine}

이유: ${pattern.tone} ${
    hasOtherStory
      ? "양측의 진술을 검토한 결과,"
      : "제출자의 진술만으로 검토한 결과,"
  } 본 사안에서 제출자의 귀책 비율은 ${my_fault}%, 상대방의 귀책 비율은 ${other_fault}%로 산정합니다.

${
  my_fault <= 30
    ? "제출자의 억울함은 충분히 이해되나, 향후 명확한 의사소통으로 유사한 상황을 예방하시기 바랍니다."
    : my_fault >= 70
    ? "제출자는 상대방의 입장을 보다 적극적으로 고려할 필요가 있습니다."
    : "양측이 서로의 감정과 입장을 존중하며 대화로 해결해 나가길 권고합니다."
}`

  return { verdict, my_fault, other_fault }
}
