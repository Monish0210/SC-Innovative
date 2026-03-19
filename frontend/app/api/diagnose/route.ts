import { NextResponse } from "next/server"

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const backendResponse = await fetch("http://127.0.0.1:8000/api/diagnosis/diagnose", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		const payload = await backendResponse.json()
		return NextResponse.json(payload, { status: backendResponse.status })
	} catch {
		return NextResponse.json({ error: "Failed to reach diagnosis service." }, { status: 500 })
	}
}
