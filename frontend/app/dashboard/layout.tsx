import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Navbar } from "@/components/navbar"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
	try {
		session = await auth.api.getSession({ headers: await headers() })
	} catch {
		session = null
	}
	if (!session?.user) {
		redirect("/login")
	}

	return (
		<div className="min-h-screen bg-(--bg-page) text-(--text-1)">
			<Navbar userEmail={session.user.email} />
			<main>{children}</main>
		</div>
	)
}
