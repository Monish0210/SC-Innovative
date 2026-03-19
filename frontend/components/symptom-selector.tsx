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
				const response = await fetch("http://localhost:8000/api/symptoms")
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
		<Card>
			<CardHeader>
				<CardTitle>Symptoms</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="text-sm text-muted-foreground">
					{selectedSymptoms.length} symptoms selected
				</div>

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger
						className={cn(
							buttonVariants({ variant: "outline" }),
							"w-full justify-between"
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

				<div className="flex flex-wrap gap-2">
					{selectedSymptoms.map((symptom) => (
						<Badge key={symptom} variant="secondary" className="h-7 gap-1 px-2">
							<span>{symptom}</span>
							<Button
								variant="ghost"
								size="icon-xs"
								className="size-4 rounded-full"
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

