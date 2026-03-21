import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DiagnosisResponse } from "@/lib/types"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardHistoryPage() {
	let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
	try {
		session = await auth.api.getSession({ headers: await headers() })
	} catch {
		session = null
	}
	if (!session?.user?.id) {
		redirect("/login")
	}

	const diagnoses = await prisma.diagnosis.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
		take: 50,
	})

	return (
		<div className="mx-auto w-full max-w-6xl p-4 md:p-6">
			<Card>
				<CardHeader>
					<CardTitle>Diagnosis History</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{diagnoses.length === 0 ? (
						<p className="text-sm text-muted-foreground">No diagnosis records yet.</p>
					) : (
						diagnoses.map((entry) => {
							const payload = entry.fullResults as unknown as DiagnosisResponse
							return (
								<details key={entry.id} className="rounded-lg border bg-card p-3">
									<summary className="cursor-pointer list-none">
										<div className="flex flex-wrap items-center justify-between gap-2">
											<div>
												<p className="text-sm font-semibold">{entry.topDisease}</p>
												<p className="text-xs text-muted-foreground">
													{new Date(entry.createdAt).toLocaleString()}
												</p>
											</div>
											<Badge>{entry.topProbability.toFixed(2)}%</Badge>
										</div>
									</summary>

									<div className="mt-3 space-y-3 border-t pt-3">
										<div>
											<p className="mb-1 text-xs font-medium text-muted-foreground">Symptoms</p>
											<div className="flex flex-wrap gap-1.5">
												{entry.symptoms.map((symptom) => (
													<Badge key={`${entry.id}-${symptom}`} variant="secondary">
														{symptom}
													</Badge>
												))}
											</div>
										</div>

										<div className="overflow-x-auto rounded-md border">
											<table className="w-full text-sm">
												<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
													<tr>
														<th className="p-2">Rank</th>
														<th className="p-2">Disease</th>
														<th className="p-2">Probability</th>
													</tr>
												</thead>
												<tbody>
													{payload.top5?.map((result, index) => (
														<tr key={`${entry.id}-${result.disease}`} className="border-t">
															<td className="p-2">{index + 1}</td>
															<td className="p-2">{result.disease}</td>
															<td className="p-2">{result.probability.toFixed(2)}%</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</details>
							)
						})
					)}
				</CardContent>
			</Card>
		</div>
	)
}
