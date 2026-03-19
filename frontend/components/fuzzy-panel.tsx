"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

type FuzzyDetail = {
	symptom: string
	mu_low: number
	mu_medium: number
	mu_high: number
	mf_sum: number
}

type FuzzyPanelProps = {
	fuzzyDetails: FuzzyDetail[]
	clusterScores: Record<string, number>
}

export function FuzzyPanel({ fuzzyDetails, clusterScores }: FuzzyPanelProps) {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Fuzzy Memberships</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{fuzzyDetails.length === 0 ? (
						<p className="text-sm text-muted-foreground">Run diagnosis to view fuzzy details.</p>
					) : (
						fuzzyDetails.map((detail) => (
							<div key={detail.symptom} className="space-y-2">
								<div className="text-sm font-medium">{detail.symptom}</div>
								<Progress value={detail.mu_low * 100}>
									<ProgressLabel>LOW</ProgressLabel>
									<ProgressValue>{(detail.mu_low * 100).toFixed(1)}%</ProgressValue>
								</Progress>
								<Progress value={detail.mu_medium * 100}>
									<ProgressLabel>MEDIUM</ProgressLabel>
									<ProgressValue>{(detail.mu_medium * 100).toFixed(1)}%</ProgressValue>
								</Progress>
								<Progress value={detail.mu_high * 100}>
									<ProgressLabel>HIGH</ProgressLabel>
									<ProgressValue>{(detail.mu_high * 100).toFixed(1)}%</ProgressValue>
								</Progress>
								<div className="text-xs text-muted-foreground">mf_sum = {detail.mf_sum.toFixed(3)}</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Cluster Activation</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{Object.keys(clusterScores).length === 0 ? (
						<p className="text-sm text-muted-foreground">No cluster scores available yet.</p>
					) : (
						Object.entries(clusterScores)
							.sort((a, b) => b[1] - a[1])
							.map(([name, score]) => (
								<Progress key={name} value={Math.max(0, Math.min(score * 100, 100))}>
									<ProgressLabel>{name}</ProgressLabel>
									<ProgressValue>{score.toFixed(3)}</ProgressValue>
								</Progress>
							))
					)}
				</CardContent>
			</Card>
		</div>
	)
}

