import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVoterToken(): string {
  if (typeof window === "undefined") return ""
  let token = localStorage.getItem("voter_token")
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem("voter_token", token)
  }
  return token
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    // 연애
    fight: "😤 다툼",
    cheating: "💔 바람",
    breakup: "😢 이별",
    dating: "🌸 연애초기",
    marriage: "💍 결혼",
    // 직장
    work: "💼 직장/회사",
    // 친구
    friend: "👥 친구",
    // 가족
    family: "👨‍👩‍👧 가족",
    // 일상
    daily: "📅 일상",
    // 기타
    etc: "💬 기타",
  }
  return labels[category] ?? category
}
