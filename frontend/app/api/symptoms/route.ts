import { NextResponse } from "next/server"

export async function GET() {
	try {
		const response = await fetch("http://127.0.0.1:8000/api/symptoms", {
			method: "GET",
		})
		const payload = await response.json()
		return NextResponse.json(payload, { status: response.status })
	} catch {
		return NextResponse.json({ error: "Failed to reach symptom service." }, { status: 500 })
	}
}
