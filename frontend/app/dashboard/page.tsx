"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { SymptomSelector } from "@/components/symptom-selector"
import { FuzzyPanel } from "@/components/fuzzy-panel"
import { ResultsPanel } from "@/components/results-panel"
import { BayesianGraph } from "@/components/bayesian-graph"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type DiseaseResult = {
	disease: string
	probability: number
	description?: string
	precautions?: string[]
}

type FuzzyDetail = {
	symptom: string
	mu_low: number
	mu_medium: number
	mu_high: number
	mf_sum: number
}

type DiagnosisResponse = {
	top5: DiseaseResult[]
	all_results: DiseaseResult[]
	fuzzy_details: FuzzyDetail[]
	cluster_scores: Record<string, number>
	graph_data: {
		nodes: Array<{ id: string; label: string; type: string }>
		edges: Array<{ source: string; target: string; weight: number; type: string }>
	}
}

export default function DashboardPage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
	const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const runDiagnosis = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch("/api/diagnose", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symptoms: selectedSymptoms }),
			})

			const payload = (await response.json()) as DiagnosisResponse | { detail?: string; error?: string }
			if (!response.ok) {
				throw new Error(payload && "detail" in payload ? payload.detail || "Diagnosis failed" : "Diagnosis failed")
			}
			setDiagnosisResult(payload as DiagnosisResponse)
		} catch (err) {
			setDiagnosisResult(null)
			setError(err instanceof Error ? err.message : "Unexpected error")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="space-y-4 p-4 md:p-6">
			{error ? (
				<Alert>
					<AlertTitle>Diagnosis Failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid grid-cols-1 gap-4 md:grid-cols-5">
				<div className="space-y-4 md:col-span-2">
					<SymptomSelector selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />
					<Button
						className="w-full"
						onClick={runDiagnosis}
						disabled={selectedSymptoms.length === 0 || isLoading}
					>
						{isLoading ? <Loader2 className="animate-spin" /> : null}
						{isLoading ? "Running Diagnosis..." : "Run Diagnosis"}
					</Button>
					<FuzzyPanel
						fuzzyDetails={diagnosisResult?.fuzzy_details ?? []}
						clusterScores={diagnosisResult?.cluster_scores ?? {}}
					/>
				</div>

				<div className="space-y-4 md:col-span-3">
					{diagnosisResult ? (
						<>
							<ResultsPanel results={diagnosisResult.top5} />
							<BayesianGraph graphData={diagnosisResult.graph_data} />
						</>
					) : (
						<Card>
							<CardContent className="py-8 text-center text-sm text-muted-foreground">
								Select symptoms and run diagnosis to view results.
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}
