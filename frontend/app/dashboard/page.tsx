"use client"

import { useState } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { DiseaseInfoCard } from "@/components/disease-info-card"
import { SymptomSelector } from "@/components/symptom-selector"
import { FuzzyPanel } from "@/components/fuzzy-panel"
import { ResultsPanel } from "@/components/results-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { DiagnosisResponse } from "@/lib/types"

export default function DashboardPage() {
	const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
	const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [leftInfoOpen, setLeftInfoOpen] = useState(false)
	const [rightInfoOpen, setRightInfoOpen] = useState(false)

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
			toast.success("Analysis complete", {
				description: `Top prediction: ${(payload as DiagnosisResponse).top5[0]?.disease ?? "N/A"}`,
			})
		} catch (err) {
			setDiagnosisResult(null)
			setError(err instanceof Error ? err.message : "Unexpected error")
			toast.error("Backend unreachable — check port 8000", {
				description: err instanceof Error ? err.message : "Unexpected error",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="h-[calc(100vh-3.5rem)] overflow-hidden bg-zinc-50 dark:bg-(--bg-page)">
			<div className="mx-auto h-full w-full max-w-6xl px-6 py-5">
				{error ? (
					<Alert className="mb-4">
						<AlertTitle>Diagnosis Failed</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				<div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-5">
					<div className="flex h-full flex-col gap-4 overflow-y-auto pb-4 lg:col-span-2">
						<SymptomSelector selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />
						<Button
							className="h-9 w-full rounded-md bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
							onClick={runDiagnosis}
							disabled={selectedSymptoms.length === 0 || isLoading}
						>
							{isLoading ? <Loader2 className="animate-spin" /> : null}
							{isLoading ? "Analysing..." : "Run Analysis"}
						</Button>

						{isLoading ? (
							<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
								<CardContent className="space-y-3 p-0">
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-28 w-full" />
								</CardContent>
							</Card>
						) : diagnosisResult ? (
							<>
								<div className="md:hidden rounded-xl border border-zinc-200 bg-white px-4 py-2 dark:border-border dark:bg-(--bg-card)">
									<Accordion>
										<AccordionItem value="fuzzy" className="border-none">
											<AccordionTrigger className="py-1 text-sm font-semibold text-zinc-900 no-underline hover:no-underline dark:text-(--text-1)">
												Fuzzy Analysis
											</AccordionTrigger>
											<AccordionContent className="pt-3 pb-0">
												<FuzzyPanel
													fuzzyDetails={diagnosisResult.fuzzy_details ?? []}
													clusterScores={diagnosisResult.cluster_scores ?? {}}
												/>
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</div>

								<div className="hidden md:block">
									<FuzzyPanel
										fuzzyDetails={diagnosisResult.fuzzy_details ?? []}
										clusterScores={diagnosisResult.cluster_scores ?? {}}
									/>
								</div>

								<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
									<Collapsible open={leftInfoOpen} onOpenChange={setLeftInfoOpen}>
										<CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
											<ChevronDown className={`h-4 w-4 transition-transform ${leftInfoOpen ? "rotate-180" : ""}`} />
											About this diagnosis
										</CollapsibleTrigger>
										<CollapsibleContent className="mt-3">
											<DiseaseInfoCard
												disease={diagnosisResult.top5[0]?.disease ?? ""}
												probability={diagnosisResult.top5[0]?.probability ?? 0}
												description={diagnosisResult.top5[0]?.description ?? "No description available."}
												precautions={diagnosisResult.top5[0]?.precautions ?? []}
											/>
										</CollapsibleContent>
									</Collapsible>
								</Card>
							</>
						) : null}
					</div>

					<div className="flex h-full flex-col gap-4 overflow-y-auto pb-4 lg:col-span-3">
						{isLoading ? (
							<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
								<CardContent className="space-y-3 p-0">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-36 w-full" />
								</CardContent>
							</Card>
						) : (
							<ResultsPanel results={diagnosisResult?.all_results ?? []} topResult={diagnosisResult?.top5?.[0]} />
						)}

						{diagnosisResult?.top5?.[0] ? (
							<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
								<Collapsible open={rightInfoOpen} onOpenChange={setRightInfoOpen}>
									<CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
										<ChevronDown className={`h-4 w-4 transition-transform ${rightInfoOpen ? "rotate-180" : ""}`} />
										About this diagnosis
									</CollapsibleTrigger>
									<CollapsibleContent className="mt-3">
										<DiseaseInfoCard
											disease={diagnosisResult.top5[0].disease}
											probability={diagnosisResult.top5[0].probability}
											description={diagnosisResult.top5[0].description}
											precautions={diagnosisResult.top5[0].precautions}
										/>
									</CollapsibleContent>
								</Collapsible>
							</Card>
						) : null}
					</div>
				</div>
			</div>
		</div>
	)
}
