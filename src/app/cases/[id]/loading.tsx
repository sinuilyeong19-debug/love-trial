export default function CaseLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4 animate-pulse">
      {/* 뒤로가기 */}
      <div className="h-4 w-20 bg-muted rounded" />

      {/* 헤더 */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded" />
        <div className="flex gap-3">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* 두 입장 스켈레톤 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="h-5 w-24 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
            <div className="h-3 w-4/6 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        </div>
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="h-5 w-24 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-4/6 bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
            <div className="h-3 w-3/5 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* 판결 스켈레톤 */}
      <div className="rounded-xl border border-border p-5 space-y-4">
        <div className="h-5 w-28 bg-muted rounded" />
        <div className="h-12 w-full bg-muted rounded-lg" />
        <div className="h-4 w-full bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-5/6 bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
        </div>
      </div>

      {/* 투표 스켈레톤 */}
      <div className="rounded-xl border border-border p-5 space-y-4">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-5 w-full bg-muted rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  )
}
