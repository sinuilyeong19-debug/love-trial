export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* 히어로 스켈레톤 */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4 animate-pulse">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-7 w-32 bg-muted rounded-lg mx-auto" />
          <div className="h-4 w-56 bg-muted rounded mx-auto" />
        </div>
        <div className="flex justify-center gap-10">
          <div className="h-10 w-16 bg-muted rounded-lg" />
          <div className="h-10 w-16 bg-muted rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-full mx-auto" />
      </div>

      {/* 필터 스켈레톤 */}
      <div className="flex gap-2 flex-wrap animate-pulse">
        {[60, 80, 70, 90, 75, 65].map((w, i) => (
          <div key={i} className="h-7 rounded-full bg-muted" style={{ width: w }} />
        ))}
      </div>

      {/* 카드 스켈레톤 */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="space-y-1">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-5/6 bg-muted rounded" />
            </div>
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
