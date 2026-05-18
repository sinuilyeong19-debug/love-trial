import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-muted p-5">
          <Scale className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-lg font-semibold text-foreground">사건 번호를 찾을 수 없습니다</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          해당 사연이 삭제되었거나 존재하지 않습니다.<br />
          재판은 이미 종결되었을 수 있습니다.
        </p>
      </div>
      <Link href="/">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
          법정으로 돌아가기
        </Button>
      </Link>
    </div>
  )
}
