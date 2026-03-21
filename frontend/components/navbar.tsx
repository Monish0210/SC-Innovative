"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Moon, Stethoscope, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const links = [
	{ href: "/dashboard", label: "Diagnosis" },
	{ href: "/dashboard/history", label: "History" },
]

export function Navbar({ userEmail }: { userEmail: string }) {
	const pathname = usePathname()
	const router = useRouter()
	const { resolvedTheme, setTheme } = useTheme()
	const mounted = useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false
	)

	const handleLogout = async () => {
		await authClient.signOut()
		router.push("/login")
	}

	return (
		<header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-3 md:px-6">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-sm font-semibold">
						<Stethoscope className="size-4" />
						<span>Fuzzy-Bayesian Dx</span>
					</div>
					<nav className="flex items-center gap-1">
						{links.map((link) => {
							const isActive = pathname === link.href
							return (
								<Link
									key={link.href}
									href={link.href}
									className={cn(
										"rounded-md px-2.5 py-1.5 text-sm transition-colors",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									)}
								>
									{link.label}
								</Link>
							)
						})}
					</nav>
				</div>

				<div className="flex items-center gap-2">
					<span className="hidden max-w-55 truncate text-xs text-muted-foreground md:inline">
						{userEmail}
					</span>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
						aria-label="Toggle theme"
					>
						{!mounted ? <Moon /> : resolvedTheme === "dark" ? <Sun /> : <Moon />}
					</Button>
					<Button variant="destructive" size="sm" onClick={handleLogout}>
						<LogOut />
						Logout
					</Button>
				</div>
			</div>
		</header>
	)
}
