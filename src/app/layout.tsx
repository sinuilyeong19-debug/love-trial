import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "우리 재판소 — AI가 판결해드립니다",
  description: "연애, 직장, 친구, 가족 — 어떤 갈등이든 AI 판사와 커뮤니티가 판결합니다",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
