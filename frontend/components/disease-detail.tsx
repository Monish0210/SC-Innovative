"use client"

import { Badge } from "@/components/ui/badge"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import type { DiseaseResult } from "@/lib/types"

type DiseaseDetailProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	result: DiseaseResult | null
}

export function DiseaseDetail({ open, onOpenChange, result }: DiseaseDetailProps) {
	if (!result) {
		return null
	}

	const activeClusters = Object.entries(result.cluster_contributions || {})
		.filter(([, score]) => score > 0)
		.sort((a, b) => b[1] - a[1])

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{result.disease}</SheetTitle>
					<SheetDescription>
						Probability: {result.probability.toFixed(2)}%
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6 px-4 pb-6 text-sm">
					<section className="space-y-2">
						<h4 className="font-medium">Description</h4>
						<p className="text-muted-foreground">{result.description || "No description available."}</p>
					</section>

					<section className="space-y-2">
						<h4 className="font-medium">Precautions</h4>
						{result.precautions?.length ? (
							<ol className="list-inside list-decimal space-y-1 text-muted-foreground">
								{result.precautions.map((item, idx) => (
									<li key={`${item}-${idx}`}>{item}</li>
								))}
							</ol>
						) : (
							<p className="text-muted-foreground">No precautions listed.</p>
						)}
					</section>

					<section className="space-y-2">
						<h4 className="font-medium">Active Cluster Contributions</h4>
						{activeClusters.length ? (
							<div className="flex flex-wrap gap-2">
								{activeClusters.map(([cluster, score]) => (
									<Badge key={cluster} variant="outline">
										{cluster}: {score.toFixed(3)}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">No active clusters.</p>
						)}
					</section>
				</div>
			</SheetContent>
		</Sheet>
	)
}

