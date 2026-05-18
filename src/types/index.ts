export type VoteType = "my_side" | "other_side"

export interface Case {
  id: string
  title: string
  my_story: string
  other_story: string | null
  category: string
  status: "pending" | "judged"
  ai_verdict: string | null
  ai_my_fault: number | null
  ai_other_fault: number | null
  vote_my_side: number
  vote_other_side: number
  created_at: string
  nickname: string
}

export interface Vote {
  id: string
  case_id: string
  vote_type: VoteType
  created_at: string
  voter_token: string
}

export interface Comment {
  id: string
  case_id: string
  nickname: string
  content: string
  created_at: string
}
