"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FuzzyDetail } from "@/lib/types"

type FuzzyPanelProps = {
	fuzzyDetails: FuzzyDetail[]
	clusterScores: Record<string, number>
}

export function FuzzyPanel({ fuzzyDetails, clusterScores }: FuzzyPanelProps) {
	if (fuzzyDetails.length === 0) {
		return null
	}

	const clusterData = Object.entries(clusterScores)
		.map(([cluster, score]) => ({
			cluster,
			score,
		}))
		.sort((a, b) => b.score - a.score)

	const getSeverityClasses = (dominantSet: FuzzyDetail["dominant_set"]) => {
		if (dominantSet === "HIGH") {
			return "border border-red-100 bg-red-50 text-red-600"
		}
		if (dominantSet === "MEDIUM") {
			return "border border-amber-100 bg-amber-50 text-amber-600"
		}
		return "border border-blue-100 bg-blue-50 text-blue-600"
	}

	const getClusterWidthClass = (score: number) => {
		if (score >= 0.9) return "w-[90%]"
		if (score >= 0.8) return "w-[80%]"
		if (score >= 0.7) return "w-[70%]"
		if (score >= 0.6) return "w-[60%]"
		if (score >= 0.5) return "w-[50%]"
		if (score >= 0.4) return "w-[40%]"
		if (score >= 0.3) return "w-[30%]"
		if (score >= 0.2) return "w-[20%]"
		if (score >= 0.1) return "w-[10%]"
		return "w-[5%]"
	}

	return (
		<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
			<CardHeader className="p-0 pb-1">
				<CardTitle className="text-sm font-semibold text-zinc-900">Fuzzy Analysis</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 p-0">
				<div>
					{fuzzyDetails.map((detail) => (
						<div key={detail.symptom} className="flex items-center gap-2 border-b border-zinc-50 py-1.5 last:border-0">
							<p className="w-24 shrink-0 truncate text-xs font-medium text-zinc-700">{detail.symptom}</p>
							<span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${getSeverityClasses(detail.dominant_set)}`}>
								{detail.dominant_set === "MEDIUM" ? "MED" : detail.dominant_set}
							</span>
							<p className="ml-auto text-xs font-mono text-zinc-400">
								L:{detail.mu_low.toFixed(3)} M:{detail.mu_medium.toFixed(3)} H:{detail.mu_high.toFixed(3)} Σ={detail.mf_sum.toFixed(3)}
							</p>
						</div>
					))}
				</div>

				<div>
					<p className="mb-2 mt-3 text-xs text-zinc-500">Cluster activation</p>
					<div className="space-y-1">
						{clusterData.map((item) => (
							<div key={item.cluster} className="flex items-center gap-2 py-0.5">
								<p className="w-28 shrink-0 truncate text-xs text-zinc-500">{item.cluster}</p>
								<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
									<div className={`h-full rounded-full bg-indigo-500 ${getClusterWidthClass(item.score)}`} />
								</div>
								<p className="w-8 text-right text-xs tabular-nums text-zinc-400">{item.score.toFixed(2)}</p>
							</div>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 mt-3 text-xs text-zinc-500">Evidence scores</p>
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-zinc-100 text-zinc-400">
								<th className="py-1 text-left font-medium">Symptom</th>
								<th className="py-1 text-right font-medium">P(S|D)</th>
								<th className="py-1 text-right font-medium">ic</th>
								<th className="py-1 text-right font-medium">ev</th>
							</tr>
						</thead>
						<tbody>
							{fuzzyDetails.map((detail) => (
								<tr key={`${detail.symptom}-evidence`} className="border-b border-zinc-50 text-xs last:border-0">
									<td className="py-1 text-zinc-700 font-medium">{detail.symptom}</td>
									<td className="py-1 text-right tabular-nums text-zinc-500">{(detail.p_laplace ?? 0).toFixed(3)}</td>
									<td className="py-1 text-right tabular-nums text-zinc-500">{detail.input_centroid.toFixed(3)}</td>
									<td className="py-1 text-right tabular-nums text-zinc-500">{(detail.evidence_score ?? 0).toFixed(3)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}

