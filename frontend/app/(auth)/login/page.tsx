"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
	const router = useRouter()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleLogin = async () => {
		setError(null)
		setIsLoading(true)

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			})

			if (result.error) {
				setError(result.error.message ?? "Login failed.")
				return
			}

			router.push("/dashboard")
		} catch {
			setError("Login failed. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
			<Card className="w-full max-w-95 rounded-xl border border-zinc-200 bg-white px-8 py-10 shadow-sm">
				<CardHeader className="p-0">
					<p className="mb-6 text-sm font-semibold text-zinc-900">MedDiagnose</p>
					<CardTitle className="text-xl font-semibold tracking-tight text-zinc-900">Welcome back</CardTitle>
					<CardDescription className="mt-1 mb-8 text-sm text-zinc-500">
						New here?
						<Link className="ml-1 font-medium text-zinc-900 hover:underline" href="/signup">
							Sign up
						</Link>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					{error ? (
						<Alert className="mt-4 text-sm">
							<AlertTitle>Could not login</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}

					<div className="space-y-4">
						<div>
							<Label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-700">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							disabled={isLoading}
							placeholder="john@example.com"
							className="h-9 rounded-md border-zinc-200 text-sm focus-visible:ring-1 focus-visible:ring-zinc-900"
						/>
						</div>

						<div>
							<Label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-700">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							disabled={isLoading}
							className="h-9 rounded-md border-zinc-200 text-sm focus-visible:ring-1 focus-visible:ring-zinc-900"
						/>
						</div>
					</div>

					<Button onClick={handleLogin} disabled={isLoading} className="mt-6 h-9 w-full rounded-md bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
						{isLoading ? (
							<>
								<Loader2 className="animate-spin" />
								Please wait...
							</>
						) : "Sign in"}
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
