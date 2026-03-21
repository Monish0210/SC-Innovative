"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MetricsResponse } from "@/lib/types"

export function MetricsDashboard() {
	const { resolvedTheme } = useTheme()
	const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			try {
				const response = await fetch("/api/metrics")
				if (!response.ok) {
					throw new Error("Failed to load metrics")
				}
				const data = (await response.json()) as MetricsResponse
				if (mounted) {
					setMetrics(data)
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}
		void load()
		return () => {
			mounted = false
		}
	}, [])

	const improvement = useMemo(() => {
		if (!metrics) {
			return 0
		}
		return metrics.fuzzy_top1 - metrics.binary_top1
	}, [metrics])

	const compareData = useMemo(
		() => [
			{ mode: "Fuzzy", value: metrics?.fuzzy_top1 ?? 0 },
			{ mode: "Binary", value: metrics?.binary_top1 ?? 0 },
		],
		[metrics]
	)

	const f1Data = useMemo(() => {
		if (!metrics) {
			return []
		}
		return Object.entries(metrics.per_disease_f1)
			.map(([disease, f1]) => ({ disease, f1 }))
			.sort((a, b) => b.f1 - a.f1)
	}, [metrics])

	const weakestDiseases = useMemo(() => {
		return [...f1Data].sort((a, b) => a.f1 - b.f1).slice(0, 5)
	}, [f1Data])

	const strongestDiseases = useMemo(() => {
		return [...f1Data].slice(0, 5)
	}, [f1Data])

	const confusion10 = useMemo(() => {
		if (!metrics) {
			return { labels: [] as string[], matrix: [] as number[][], maxOffDiag: 0 }
		}
		const labels = Object.keys(metrics.confusion_matrix).slice(0, 10)
		const matrix = labels.map((actual) => labels.map((pred) => metrics.confusion_matrix[actual]?.[pred] ?? 0))
		let maxOffDiag = 1
		for (let r = 0; r < matrix.length; r++) {
			for (let c = 0; c < matrix[r].length; c++) {
				if (r !== c) {
					maxOffDiag = Math.max(maxOffDiag, matrix[r][c])
				}
			}
		}
		return { labels, matrix, maxOffDiag }
	}, [metrics])

	const topConfusions = useMemo(() => {
		if (!metrics) {
			return [] as Array<{ actual: string; predicted: string; count: number }>
		}
		const pairs: Array<{ actual: string; predicted: string; count: number }> = []
		for (const actual of Object.keys(metrics.confusion_matrix)) {
			for (const predicted of Object.keys(metrics.confusion_matrix[actual] || {})) {
				if (actual === predicted) {
					continue
				}
				const count = metrics.confusion_matrix[actual]?.[predicted] ?? 0
				if (count > 0) {
					pairs.push({ actual, predicted, count })
				}
			}
		}
		return pairs.sort((a, b) => b.count - a.count).slice(0, 8)
	}, [metrics])

	const isDark = resolvedTheme === "dark"
	const chartTick = isDark ? "#e2e8f0" : "#334155"
	const chartGrid = isDark ? "#334155" : "#cbd5e1"
	const tooltipBg = isDark ? "#0f172a" : "#ffffff"
	const tooltipBorder = isDark ? "#334155" : "#cbd5e1"

	const getMatrixCellClass = (isDiag: boolean, value: number) => {
		if (value <= 0) {
			return ""
		}
		if (isDiag) {
			if (value >= 18) return "bg-green-600/90 text-white"
			if (value >= 12) return "bg-green-500/70"
			if (value >= 6) return "bg-green-400/50"
			return "bg-green-300/40"
		}
		const ratio = value / (confusion10.maxOffDiag || 1)
		if (ratio >= 0.75) return "bg-red-600/90 text-white"
		if (ratio >= 0.5) return "bg-red-500/70"
		if (ratio >= 0.25) return "bg-red-400/50"
		return "bg-red-300/40"
	}

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-72 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		)
	}

	if (!metrics) {
		return <p className="text-sm text-muted-foreground">Metrics unavailable.</p>
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>How to Read These Metrics</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<p>Top-1: model guessed the correct disease as rank #1.</p>
					<p>Top-5: correct disease exists anywhere in the top 5 list.</p>
					<p>Macro F1: balanced quality across all diseases, not dominated by frequent ones.</p>
				</CardContent>
			</Card>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				{[
					{ label: "Top-1%", value: `${metrics.top1_accuracy.toFixed(2)}%` },
					{ label: "Top-5%", value: `${metrics.top5_accuracy.toFixed(2)}%` },
					{ label: "F1 macro", value: metrics.macro_f1.toFixed(3) },
					{ label: "Test size", value: String(metrics.test_size ?? metrics.split?.test_rows ?? 984) },
				].map((stat) => (
					<Card key={stat.label}>
						<CardHeader>
							<CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-semibold">{stat.value}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Fuzzy vs Binary (Overall Accuracy)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="h-52">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={compareData}>
								<CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
								<XAxis dataKey="mode" tick={{ fill: chartTick }} />
								<YAxis domain={[0, 100]} tick={{ fill: chartTick }} />
								<Tooltip
									formatter={(value: number) => `${value.toFixed(2)}%`}
									contentStyle={{ background: tooltipBg, borderColor: tooltipBorder }}
									labelStyle={{ color: chartTick }}
								/>
								<Bar dataKey="value" radius={[4, 4, 0, 0]}>
									<Cell fill="#16a34a" />
									<Cell fill="#94a3b8" />
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
					{improvement > 0 ? (
						<Badge className="bg-green-100 text-green-700">+{improvement.toFixed(1)}% improvement</Badge>
					) : null}
					<p className="text-xs text-muted-foreground">
						This compares two evidence styles on the same test set.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Per-disease Quality (F1, not per symptom)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-xs text-muted-foreground">
						Higher is better. Green bars are strong classes, yellow moderate, red weak.
					</p>
					<div className="h-105">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={f1Data} layout="vertical" margin={{ left: 40, right: 10 }}>
								<CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
								<XAxis type="number" domain={[0, 1]} tick={{ fill: chartTick }} />
								<YAxis dataKey="disease" type="category" width={140} tick={{ fill: chartTick, fontSize: 10 }} />
								<Tooltip
									formatter={(value: number) => value.toFixed(3)}
									contentStyle={{ background: tooltipBg, borderColor: tooltipBorder }}
									labelStyle={{ color: chartTick }}
								/>
								<Bar dataKey="f1" radius={[0, 4, 4, 0]}>
									{f1Data.map((row) => (
										<Cell
											key={row.disease}
											fill={row.f1 < 0.5 ? "#dc2626" : row.f1 <= 0.7 ? "#f59e0b" : "#16a34a"}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="rounded-md border p-3">
							<p className="mb-2 text-xs font-semibold text-muted-foreground">Strongest 5 diseases</p>
							<div className="space-y-1 text-sm">
								{strongestDiseases.map((row) => (
									<div key={`strong-${row.disease}`} className="flex items-center justify-between">
										<span>{row.disease}</span>
										<span className="font-medium">{row.f1.toFixed(3)}</span>
									</div>
								))}
							</div>
						</div>
						<div className="rounded-md border p-3">
							<p className="mb-2 text-xs font-semibold text-muted-foreground">Weakest 5 diseases</p>
							<div className="space-y-1 text-sm">
								{weakestDiseases.map((row) => (
									<div key={`weak-${row.disease}`} className="flex items-center justify-between">
										<span>{row.disease}</span>
										<span className="font-medium">{row.f1.toFixed(3)}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Most Common Misclassifications</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-xs text-muted-foreground">
						These are the most frequent wrong predictions. Use this list before reading the full matrix.
					</p>
					<div className="overflow-x-auto rounded-md border">
						<table className="w-full text-sm">
							<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
								<tr>
									<th className="p-2">Actual</th>
									<th className="p-2">Predicted as</th>
									<th className="p-2 text-right">Count</th>
								</tr>
							</thead>
							<tbody>
								{topConfusions.map((row, index) => (
									<tr key={`${row.actual}-${row.predicted}-${index}`} className="border-t">
										<td className="p-2">{row.actual}</td>
										<td className="p-2">{row.predicted}</td>
										<td className="p-2 text-right font-medium">{row.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<p className="text-xs font-semibold text-muted-foreground">Detailed matrix (10x10 sample)</p>
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-xs">
							<thead>
								<tr>
									<th className="border p-1 text-left">Actual \ Pred</th>
									{confusion10.labels.map((label) => (
										<th key={label} className="border p-1">{label.slice(0, 10)}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{confusion10.matrix.map((row, rIdx) => (
									<tr key={confusion10.labels[rIdx]}>
										<td className="border p-1 font-medium">{confusion10.labels[rIdx].slice(0, 10)}</td>
										{row.map((value, cIdx) => {
											const isDiag = rIdx === cIdx
											return (
												<td
													key={`${rIdx}-${cIdx}`}
													className={`border p-1 text-center ${getMatrixCellClass(isDiag, value)}`}
												>
													{value}
												</td>
											)
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

