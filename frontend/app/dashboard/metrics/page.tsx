import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { BayesianGraph } from "@/components/bayesian-graph"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { DiagnosisResponse } from "@/lib/types"

export default async function DashboardMetricsPage() {
	let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
	try {
		session = await auth.api.getSession({ headers: await headers() })
	} catch {
		session = null
	}

	if (!session?.user?.id) {
		redirect("/login")
	}

	const latest = await prisma.diagnosis.findFirst({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
	})

	if (!latest) {
		return (
			<div className="p-4 md:p-6">
				<Card>
					<CardHeader>
						<CardTitle>Graph Explorer</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Run at least one diagnosis from the Diagnosis page to generate a graph.
					</CardContent>
				</Card>
			</div>
		)
	}

	const payload = latest.fullResults as unknown as DiagnosisResponse

	return (
		<div className="p-4 md:p-6">
			<BayesianGraph
				graphData={payload.graph_data}
				fuzzyDetails={payload.fuzzy_details}
				topProbability={payload.top5?.[0]?.probability}
				heightClass="h-160"
			/>
		</div>
	)
}
