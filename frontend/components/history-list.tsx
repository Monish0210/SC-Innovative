"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { DiagnosisResponse } from "@/lib/types"

type HistoryEntry = {
	id: string
	topDisease: string
	topProbability: number
	createdAt: string
	symptoms: string[]
	fullResults: DiagnosisResponse
}

type HistoryListProps = {
	diagnoses: HistoryEntry[]
}

export function HistoryList({ diagnoses }: HistoryListProps) {
	const [openId, setOpenId] = useState<string | null>(null)
	const getWidthClass = (probability: number) => {
		if (probability >= 90) return "w-[90%]"
		if (probability >= 80) return "w-[80%]"
		if (probability >= 70) return "w-[70%]"
		if (probability >= 60) return "w-[60%]"
		if (probability >= 50) return "w-[50%]"
		if (probability >= 40) return "w-[40%]"
		if (probability >= 30) return "w-[30%]"
		if (probability >= 20) return "w-[20%]"
		if (probability >= 10) return "w-[10%]"
		return "w-[5%]"
	}
	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	})

	if (diagnoses.length === 0) {
		return (
			<div className="rounded-xl border border-zinc-200 bg-white p-16 text-center dark:border-border dark:bg-(--bg-card)">
				<p className="text-sm font-medium text-zinc-500 dark:text-(--text-2)">No diagnoses yet</p>
				<p className="mt-1 text-xs text-zinc-400 dark:text-(--text-3)">Run your first analysis to see results here</p>
				<Link
					href="/dashboard"
					className="mt-4 inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors duration-150 ease-in-out hover:bg-zinc-50 dark:border-border dark:text-(--text-2) dark:hover:bg-zinc-800/40"
				>
					Go to diagnosis
				</Link>
			</div>
		)
	}

	return (
		<div className="space-y-2">
			{diagnoses.map((entry) => {
				const payload = entry.fullResults
				const topRows = (payload.top5?.length ? payload.top5 : payload.all_results ?? []).slice(0, 5)
				const isOpen = openId === entry.id
				const formattedDate = dateFormatter.format(new Date(entry.createdAt))
				return (
					<Collapsible key={entry.id} open={isOpen} onOpenChange={(open) => setOpenId(open ? entry.id : null)} className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-border dark:bg-(--bg-card)">
						<CollapsibleTrigger className="w-full cursor-pointer px-5 py-4 transition-colors duration-150 ease-in-out hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
							<div className="flex w-full items-center gap-4 text-left">
								<p className="w-40 shrink-0 text-xs text-zinc-400 dark:text-(--text-3)">{formattedDate}</p>
								<p className="flex-1 text-sm font-medium text-zinc-900 dark:text-(--text-1)">{entry.topDisease}</p>
								<p className="w-14 shrink-0 text-sm tabular-nums text-zinc-900 dark:text-(--text-1)">{entry.topProbability.toFixed(1)}%</p>
								<p className="w-20 shrink-0 text-xs text-zinc-400 dark:text-(--text-3)">{entry.symptoms.length} symptoms</p>
								<ChevronDown
									className={`h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-150 ease-in-out ${isOpen ? "rotate-180" : ""}`}
								/>
							</div>
						</CollapsibleTrigger>

						<CollapsibleContent className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-700/60 dark:bg-zinc-900/40">
							<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
								{topRows.map((item, index) => (
									<div key={`${entry.id}-${item.disease}-${index}`} className="flex items-center gap-3 py-2.5">
										<span className="w-4 shrink-0 text-xs tabular-nums text-zinc-300 dark:text-zinc-500">{index + 1}</span>
										<p className="flex-1 text-xs text-zinc-700 dark:text-(--text-2)">{item.disease}</p>
										<div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
											<div className={`h-full rounded-full bg-zinc-400 dark:bg-zinc-500 ${getWidthClass(item.probability)}`} />
										</div>
										<p className="w-10 text-right text-xs font-medium tabular-nums text-zinc-600 dark:text-(--text-2)">{item.probability.toFixed(1)}%</p>
									</div>
								))}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)
			})}
		</div>
	)
}
