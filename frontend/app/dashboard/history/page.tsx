import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { HistoryList } from "@/components/history-list"
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

	const historyItems = diagnoses.map((entry) => ({
		id: entry.id,
		topDisease: entry.topDisease,
		topProbability: entry.topProbability,
		createdAt: entry.createdAt.toISOString(),
		symptoms: entry.symptoms,
		fullResults: entry.fullResults as unknown as DiagnosisResponse,
	}))

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-(--bg-page)">
			<div className="mx-auto w-full max-w-6xl px-6 py-8">
				<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-(--text-1)">History</h1>
				<p className="mb-6 mt-1 text-sm text-zinc-500 dark:text-(--text-2)">Your previous diagnoses</p>
				<HistoryList diagnoses={historyItems} />
			</div>
		</div>
	)
}
