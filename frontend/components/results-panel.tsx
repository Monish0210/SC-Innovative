"use client"

import { useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiseaseDetail } from "@/components/disease-detail"
import type { DiseaseResult } from "@/lib/types"
import { cn } from "@/lib/utils"

type ResultsPanelProps = {
	results: DiseaseResult[]
	topResult?: DiseaseResult
}

export function ResultsPanel({ results, topResult }: ResultsPanelProps) {
	const [selectedDisease, setSelectedDisease] = useState<DiseaseResult | null>(null)
	const [sheetOpen, setSheetOpen] = useState(false)

	const top5 = useMemo(() => results.slice(0, 5), [results])
	const totalProbability = useMemo(
		() => results.reduce((sum, row) => sum + (Number.isFinite(row.probability) ? row.probability : 0), 0),
		[results]
	)

	const getConfidence = (p: number) => {
		if (p > 40) {
			return { label: "High" }
		}
		if (p >= 20) {
			return { label: "Moderate" }
		}
		return { label: "Low" }
	}

	const getBarWidthClass = (probability: number) => {
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

	const openDisease = (result: DiseaseResult) => {
		setSelectedDisease(result)
		setSheetOpen(true)
	}

	if (results.length === 0) {
		return (
			<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
				<CardHeader className="p-0">
					<CardTitle className="text-sm font-semibold text-zinc-900">Results</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="flex min-h-50 flex-col items-center justify-center text-center">
						<p className="text-sm font-medium text-zinc-400">Run an analysis</p>
						<p className="mt-1 text-xs text-zinc-400">Select symptoms on the left, then click Run Analysis</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const primary = top5[0]
	const secondary = top5.slice(1)

	return (
		<>
			<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
				<CardHeader className="flex-row items-center justify-between space-y-0 p-0">
					<div className="flex items-center gap-2">
						<CardTitle className="text-sm font-semibold text-zinc-900">Results</CardTitle>
						<span className="text-xs text-zinc-400">41 diseases ranked</span>
					</div>
					<span className="text-xs text-zinc-300">Σ {totalProbability.toFixed(0)}%</span>
				</CardHeader>
				<CardContent className="mt-3 space-y-3 p-0">
					{primary ? (
						<div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
							<div className="flex items-baseline justify-between gap-2">
								<p className="text-base font-semibold text-zinc-900">{primary.disease}</p>
								<p className="text-base font-semibold tabular-nums text-zinc-900">{primary.probability.toFixed(2)}%</p>
							</div>
							<div className="mb-2 mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-200">
								<div className={`h-full rounded-full bg-zinc-800 ${getBarWidthClass(primary.probability)}`} />
							</div>
							<div className="flex items-center justify-between">
								<p className={cn("text-xs", primary.probability > 40 ? "text-emerald-600" : primary.probability > 20 ? "text-amber-600" : "text-zinc-400")}>{getConfidence(primary.probability).label} confidence</p>
								<button type="button" className="cursor-pointer text-xs text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline" onClick={() => openDisease(primary)}>
									View details
								</button>
							</div>
						</div>
					) : null}

					<div className="divide-y divide-zinc-100">
						{secondary.map((item, index) => (
							<div key={`${item.disease}-${index + 1}`} className="flex items-center gap-3 py-2.5">
								<span className="w-4 shrink-0 text-xs tabular-nums text-zinc-300">{index + 2}</span>
								<p className="flex-1 text-xs text-zinc-700">{item.disease}</p>
								<div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-100">
									<div className={`h-full rounded-full bg-zinc-400 ${getBarWidthClass(item.probability)}`} />
								</div>
								<p className="w-10 text-right text-xs font-medium tabular-nums text-zinc-600">{item.probability.toFixed(1)}%</p>
								<button type="button" className="text-xs text-zinc-400 transition-colors hover:text-zinc-700 hover:underline" onClick={() => openDisease(item)}>
									Details
								</button>
							</div>
						))}
					</div>
					<p className="mt-3 text-center text-xs italic text-zinc-300">
						Educational only · Consult a qualified doctor
					</p>
				</CardContent>
			</Card>

			<DiseaseDetail open={sheetOpen} onOpenChange={setSheetOpen} result={selectedDisease} />
		</>
	)
}

