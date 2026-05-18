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
    fight: "다툼",
    cheating: "바람",
    breakup: "이별",
    dating: "연애 초기",
    marriage: "결혼/약혼",
    etc: "기타",
  }
  return labels[category] ?? category
}
