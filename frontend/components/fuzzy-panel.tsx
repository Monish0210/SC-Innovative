"use client"

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type FuzzyDetail = {
	symptom: string
	weight: number
	mu_low: number
	mu_medium: number
	mu_high: number
	mf_sum: number
	input_centroid: number
	dominant_set: "LOW" | "MEDIUM" | "HIGH"
	p_laplace: number
	evidence_score: number
	top_disease: string
}

type FuzzyPanelProps = {
	fuzzyDetails: FuzzyDetail[]
	clusterScores: Record<string, number>
}

export function FuzzyPanel({ fuzzyDetails, clusterScores }: FuzzyPanelProps) {
	if (fuzzyDetails.length === 0) {
		return null
	}

	const chartData = Object.entries(clusterScores)
		.map(([cluster, score]) => ({
			cluster,
			score,
		}))
		.sort((a, b) => b.score - a.score)

	const topDisease = fuzzyDetails[0]?.top_disease ?? ""

	const getClusterColor = (score: number) => {
		if (score === 0) {
			return "#9ca3af"
		}
		if (score < 0.4) {
			return "#2563eb"
		}
		return "#7c3aed"
	}

	const MembershipBar = ({
		label,
		value,
		indicatorClass,
	}: {
		label: string
		value: number
		indicatorClass: string
	}) => (
		<Progress value={Math.max(0, Math.min(value * 100, 100))} indicatorClassName={indicatorClass}>
			<ProgressLabel>{label}</ProgressLabel>
			<ProgressValue>{value.toFixed(3)}</ProgressValue>
		</Progress>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Fuzzy Inference Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-8">
				<section className="space-y-4">
					<h3 className="text-sm font-semibold">Fuzzification (Step 1 + 2)</h3>
					<div className="space-y-5">
						{fuzzyDetails.map((detail) => (
							<div key={detail.symptom} className="space-y-3 rounded-lg border p-3">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline">{detail.symptom}</Badge>
									<Badge variant="secondary">w={detail.weight}</Badge>
									<Badge>{detail.dominant_set}</Badge>
								</div>

								<MembershipBar label="LOW" value={detail.mu_low} indicatorClass="bg-blue-500" />
								<MembershipBar
									label="MEDIUM"
									value={detail.mu_medium}
									indicatorClass="bg-purple-500"
								/>
								<MembershipBar label="HIGH" value={detail.mu_high} indicatorClass="bg-red-500" />

								<div
									className={cn(
										"text-xs font-medium",
										Math.abs(detail.mf_sum - 1) < 1e-6 ? "text-green-600" : "text-red-600"
									)}
								>
									Partition of Unity check: {detail.mf_sum.toFixed(3)}
								</div>
								<div className="text-xs text-muted-foreground">
									Severity weight: {detail.input_centroid.toFixed(3)}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="text-sm font-semibold">Syndrome Cluster Activation Scores</h3>
					<div className="h-72 w-full rounded-lg border p-2">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 12, left: 40, bottom: 8 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis type="number" domain={[0, 1]} />
								<YAxis
									dataKey="cluster"
									type="category"
									width={150}
									tick={{ fontSize: 11 }}
								/>
								<Tooltip formatter={(value: number) => value.toFixed(3)} />
								<Bar dataKey="score" radius={[0, 4, 4, 0]}>
									{chartData.map((entry) => (
										<Cell key={entry.cluster} fill={getClusterColor(entry.score)} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</section>

				<section className="space-y-4">
					<h3 className="text-sm font-semibold">
						Fuzzy-Bayesian Evidence Scores (evidence = ic × P(S|D))
					</h3>
					{topDisease ? (
						<div className="text-xs text-muted-foreground">Top disease reference: {topDisease}</div>
					) : null}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Symptom</TableHead>
								<TableHead>P_laplace(S|TopDisease)</TableHead>
								<TableHead>Severity Score (ic)</TableHead>
								<TableHead>Evidence Score</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fuzzyDetails.map((detail) => (
								<TableRow key={`${detail.symptom}-evidence`}>
									<TableCell>{detail.symptom}</TableCell>
									<TableCell>{detail.p_laplace.toFixed(6)}</TableCell>
									<TableCell>{detail.input_centroid.toFixed(3)}</TableCell>
									<TableCell>{detail.evidence_score.toFixed(6)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<p className="text-xs text-muted-foreground">
						All selected symptoms contribute. P values use Laplace smoothing — minimum ≈ 0.010
					</p>
				</section>
			</CardContent>
		</Card>
	)
}

