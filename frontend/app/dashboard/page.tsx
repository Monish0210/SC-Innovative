"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { SymptomSelector } from "@/components/symptom-selector"
import { FuzzyPanel } from "@/components/fuzzy-panel"
import { ResultsPanel } from "@/components/results-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DiagnosisResponse } from "@/lib/types"

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
			toast.success("Diagnosis complete", {
				description: `Top prediction: ${(payload as DiagnosisResponse).top5[0]?.disease ?? "N/A"}`,
			})
		} catch (err) {
			setDiagnosisResult(null)
			setError(err instanceof Error ? err.message : "Unexpected error")
			toast.error("Diagnosis failed", {
				description: err instanceof Error ? err.message : "Unexpected error",
			})
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
					{isLoading ? (
						<Card>
							<CardContent className="space-y-3 py-4">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
							</CardContent>
						</Card>
					) : (
						<FuzzyPanel
							fuzzyDetails={diagnosisResult?.fuzzy_details ?? []}
							clusterScores={diagnosisResult?.cluster_scores ?? {}}
						/>
					)}
				</div>

				<div className="space-y-4 md:col-span-3">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-52 w-full" />
						</div>
					) : diagnosisResult ? (
						<>
							<ResultsPanel results={diagnosisResult.top5} />
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
