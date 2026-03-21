"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { DiseaseDetail } from "@/components/disease-detail"
import { DiseaseInfoCard } from "@/components/disease-info-card"
import type { DiseaseResult } from "@/lib/types"

type ResultsPanelProps = {
	results: DiseaseResult[]
	topResult?: DiseaseResult
}

export function ResultsPanel({ results, topResult }: ResultsPanelProps) {
	const [selectedDisease, setSelectedDisease] = useState<DiseaseResult | null>(null)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [infoOpen, setInfoOpen] = useState(false)

	const top5 = useMemo(() => results.slice(0, 5), [results])

	const getConfidence = (p: number) => {
		if (p > 40) {
			return { label: "High", className: "bg-green-100 text-green-700" }
		}
		if (p >= 20) {
			return { label: "Moderate", className: "bg-yellow-100 text-yellow-700" }
		}
		return { label: "Low", className: "bg-slate-100 text-slate-700" }
	}

	const openDisease = (result: DiseaseResult) => {
		setSelectedDisease(result)
		setSheetOpen(true)
	}

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
		<>
			<Card>
				<CardHeader>
					<CardTitle>Top 5 Diagnoses</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{top5.map((item, index) => {
						const confidence = getConfidence(item.probability)
						return (
							<button
								type="button"
								key={`${item.disease}-${index}`}
								onClick={() => openDisease(item)}
								className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
							>
								<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<Badge variant="outline">#{index + 1}</Badge>
										<span className="font-medium">{item.disease}</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">{item.probability.toFixed(2)}%</Badge>
										<Badge className={confidence.className}>{confidence.label}</Badge>
									</div>
								</div>
								<Progress value={Math.max(0, Math.min(item.probability, 100))}>
									<ProgressLabel>Probability</ProgressLabel>
									<ProgressValue>{() => `${item.probability.toFixed(2)}%`}</ProgressValue>
								</Progress>
							</button>
						)
					})}
					{topResult ? (
						<Collapsible open={infoOpen} onOpenChange={setInfoOpen} className="pt-1">
							<CollapsibleTrigger className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
								<ChevronDown className={`h-4 w-4 transition-transform ${infoOpen ? "rotate-180" : ""}`} />
								{infoOpen ? "Hide disease information" : "Show disease information"}
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-2">
								<DiseaseInfoCard
									disease={topResult.disease}
									probability={topResult.probability}
									description={topResult.description}
									precautions={topResult.precautions}
								/>
							</CollapsibleContent>
						</Collapsible>
					) : null}
					<p className="text-xs text-muted-foreground">
						Educational only. Consult a doctor.
					</p>
				</CardContent>
			</Card>

			<DiseaseDetail open={sheetOpen} onOpenChange={setSheetOpen} result={selectedDisease} />
		</>
	)
}

