"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const links = [
	{ href: "/dashboard", label: "Diagnose" },
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

	const initials = (userEmail?.trim()?.charAt(0) || "U").toUpperCase()

	return (
		<header className="sticky top-0 z-50 h-14 border-b border-zinc-200 bg-white">
			<div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-6 px-6">
				<div className="flex items-center gap-8">
					<p className="text-sm font-semibold text-zinc-900">MedDiagnose</p>
					<nav className="hidden items-center gap-1 md:flex">
						{links.map((link) => {
							const isActive = pathname === link.href
							return (
								<Link
									key={link.href}
									href={link.href}
									className={cn(
										"rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
										isActive
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
									)}
								>
									{link.label}
								</Link>
							)
						})}
					</nav>
				</div>

				<div className="flex items-center gap-1">
					<div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white md:flex">
						{initials}
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						className="ml-2 h-8 w-8 rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
						onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
						aria-label="Toggle theme"
					>
						{!mounted ? <Moon /> : resolvedTheme === "dark" ? <Sun /> : <Moon />}
					</Button>
					<Button variant="ghost" size="sm" className="ml-1 hidden rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:inline-flex" onClick={handleLogout}>
						Logout
					</Button>

					<Sheet>
						<SheetTrigger
							render={
								<Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open navigation" />
							}
						>
							<Menu className="size-4 text-zinc-500" />
						</SheetTrigger>
						<SheetContent side="left" className="w-80 border-r border-zinc-200 bg-white p-0">
							<div className="border-b border-zinc-100 px-5 py-4">
								<SheetTitle className="text-sm font-semibold text-zinc-900">MedDiagnose</SheetTitle>
							</div>
							<nav className="space-y-1 px-3 py-3">
								{links.map((link) => {
									const isActive = pathname === link.href
									return (
										<Link
											key={`mobile-${link.href}`}
											href={link.href}
											className={cn(
												"block rounded-lg px-3 py-2 text-sm transition-colors",
												isActive
													? "bg-zinc-900 text-white"
													: "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
											)}
										>
											{link.label}
										</Link>
									)
								})}
							</nav>
							<div className="border-t border-zinc-100 px-5 py-4">
								<Button variant="ghost" size="sm" className="w-full justify-start text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900" onClick={handleLogout}>
									<LogOut />
									Logout
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}
