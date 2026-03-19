"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type GraphNode = {
	id: string
	label: string
	type: string
}

type GraphEdge = {
	source: string
	target: string
	weight: number
	type: string
}

type BayesianGraphProps = {
	graphData: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	} | null
}

export function BayesianGraph({ graphData }: BayesianGraphProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Bayesian Network Graph</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{!graphData ? (
					<p className="text-sm text-muted-foreground">Run diagnosis to build the graph view.</p>
				) : (
					<>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">Nodes: {graphData.nodes.length}</Badge>
							<Badge variant="outline">Edges: {graphData.edges.length}</Badge>
						</div>
						<div className="rounded-lg border p-3">
							<p className="text-sm text-muted-foreground">
								Graph data is available and ready for React Flow rendering.
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}

