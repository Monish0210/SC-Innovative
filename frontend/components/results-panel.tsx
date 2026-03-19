"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

type DiseaseResult = {
	disease: string
	probability: number
	description?: string
	precautions?: string[]
}

type ResultsPanelProps = {
	results: DiseaseResult[]
}

export function ResultsPanel({ results }: ResultsPanelProps) {
	if (results.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Diagnosis Results</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">No results yet. Run diagnosis to see ranked diseases.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top 5 Diagnoses</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{results.map((item, index) => (
					<div key={`${item.disease}-${index}`} className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<div className="font-medium">{item.disease}</div>
							<Badge variant={index === 0 ? "default" : "secondary"}>
								{item.probability.toFixed(2)}%
							</Badge>
						</div>
						<Progress value={Math.max(0, Math.min(item.probability, 100))}>
							<ProgressLabel>Probability</ProgressLabel>
							<ProgressValue>{item.probability.toFixed(2)}%</ProgressValue>
						</Progress>
					</div>
				))}
			</CardContent>
		</Card>
	)
}

