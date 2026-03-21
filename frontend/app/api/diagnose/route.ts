import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { DiagnosisResponse } from "@/lib/types"

export async function POST(request: Request) {
	try {
		let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
		try {
			session = await auth.api.getSession({ headers: await headers() })
		} catch {
			session = null
		}
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await request.json()
		const backendResponse = await fetch("http://127.0.0.1:8000/api/diagnosis/diagnose", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		const result = (await backendResponse.json()) as DiagnosisResponse
		if (!backendResponse.ok) {
			return NextResponse.json(result, { status: backendResponse.status })
		}

		if (result.top5.length > 0) {
			await prisma.diagnosis.create({
				data: {
					userId: session.user.id,
					symptoms: body.symptoms,
					topDisease: result.top5[0].disease,
					topProbability: result.top5[0].probability,
					fullResults: result,
				},
			})
		}

		return NextResponse.json(result)
	} catch {
		return NextResponse.json({ error: "Failed to reach diagnosis service." }, { status: 500 })
	}
}
