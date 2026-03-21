import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardHistoryLoading() {
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-(--bg-page)">
			<div className="mx-auto w-full max-w-6xl px-6 py-8">
				<Skeleton className="h-8 w-28" />
				<Skeleton className="mt-2 h-4 w-44" />
				<div className="mt-6 space-y-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-border dark:bg-(--bg-card)">
							<div className="flex items-center gap-4">
								<Skeleton className="h-3 w-40" />
								<Skeleton className="h-4 flex-1" />
								<Skeleton className="h-4 w-14" />
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-4" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
