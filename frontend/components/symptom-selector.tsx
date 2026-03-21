"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SymptomSelectorProps = {
	selectedSymptoms: string[]
	onChange: (s: string[]) => void
}

export function SymptomSelector({ selectedSymptoms, onChange }: SymptomSelectorProps) {
	const [allSymptoms, setAllSymptoms] = useState<string[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		let mounted = true
		const fetchSymptoms = async () => {
			setLoading(true)
			try {
				const response = await fetch("/api/symptoms")
				if (!response.ok) {
					throw new Error("Failed to fetch symptoms")
				}
				const data = (await response.json()) as string[]
				if (mounted) {
					setAllSymptoms(data)
				}
			} catch {
				if (mounted) {
					setAllSymptoms([])
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		void fetchSymptoms()
		return () => {
			mounted = false
		}
	}, [])

	const selectedSet = useMemo(() => new Set(selectedSymptoms), [selectedSymptoms])

	const toggleSymptom = (symptom: string) => {
		if (selectedSet.has(symptom)) {
			onChange(selectedSymptoms.filter((s) => s !== symptom))
			return
		}
		onChange([...selectedSymptoms, symptom])
	}

	const removeSymptom = (symptom: string) => {
		onChange(selectedSymptoms.filter((s) => s !== symptom))
	}

	return (
		<Card className="rounded-xl border border-zinc-200 bg-white p-4 shadow-none">
			<CardHeader className="mb-3 flex-row items-center justify-between space-y-0 p-0">
				<CardTitle className="text-sm font-semibold text-zinc-900">Symptoms</CardTitle>
				{selectedSymptoms.length > 0 ? (
					<span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{selectedSymptoms.length} selected</span>
				) : null}
			</CardHeader>
			<CardContent className="space-y-3 p-0">

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-9 w-full justify-between rounded-md border-zinc-200 bg-white text-sm text-zinc-600 hover:border-zinc-300 hover:bg-white"
						)}
					>
						<span>{loading ? "Loading symptoms..." : "Search and select symptoms"}</span>
						<ChevronsUpDown className="opacity-60" />
					</PopoverTrigger>
					<PopoverContent className="w-(--anchor-width) p-0">
						<Command>
							<CommandInput placeholder="Search symptom..." />
							<CommandList>
								<CommandEmpty>No symptom found.</CommandEmpty>
								<CommandGroup heading="Symptoms">
									{allSymptoms.map((symptom) => {
										const selected = selectedSet.has(symptom)
										return (
											<CommandItem
												key={symptom}
												value={symptom}
												onSelect={() => toggleSymptom(symptom)}
												data-checked={selected}
											>
												<Check className={cn("mr-1", selected ? "opacity-100" : "opacity-0")} />
												<span>{symptom}</span>
											</CommandItem>
										)
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<div className="mt-2 flex flex-wrap gap-1.5">
					{selectedSymptoms.map((symptom) => (
						<Badge key={symptom} variant="outline" className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-800">
							<span>{symptom}</span>
							<Button
								variant="ghost"
								size="icon-xs"
								className="ml-0.5 size-4 rounded-full text-zinc-400 hover:text-zinc-700"
								onClick={() => removeSymptom(symptom)}
							>
								<X className="size-3" />
							</Button>
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

