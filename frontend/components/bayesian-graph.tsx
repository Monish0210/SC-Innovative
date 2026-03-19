"use client"

import { useMemo } from "react"
import {
	Background,
	Controls,
	Edge,
	MarkerType,
	MiniMap,
	Node,
	ReactFlow,
} from "@xyflow/react"

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
	const flowNodes = useMemo<Node[]>(() => {
		if (!graphData) {
			return []
		}

		const diseaseNodes = graphData.nodes.filter((n) => n.type === "disease")
		const clusterNodes = graphData.nodes.filter((n) => n.type === "cluster")
		const symptomNodes = graphData.nodes.filter((n) => n.type === "symptom")

		const spacingY = 70
		const startY = 20

		const mapWithPosition = (
			nodes: GraphNode[],
			x: number,
			bgClass: string
		): Node[] =>
			nodes.map((node, index) => ({
				id: node.id,
				position: { x, y: startY + index * spacingY },
				data: { label: node.label },
				type: "default",
				className: `rounded-md border px-2 py-1 text-xs shadow-sm ${bgClass}`,
				draggable: false,
				selectable: false,
			}))

		return [
			...mapWithPosition(symptomNodes, 0, "bg-blue-50 border-blue-200"),
			...mapWithPosition(clusterNodes, 280, "bg-violet-50 border-violet-200"),
			...mapWithPosition(diseaseNodes, 560, "bg-rose-50 border-rose-200"),
		]
	}, [graphData])

	const flowEdges = useMemo<Edge[]>(() => {
		if (!graphData) {
			return []
		}

		return graphData.edges.map((edge, index) => {
			const weight = Number.isFinite(edge.weight) ? edge.weight : 0
			const strokeWidth = Math.max(1, 1 + weight * 4)
			const stroke = edge.type === "cluster_to_disease" ? "#7c3aed" : "#2563eb"

			return {
				id: `${edge.source}-${edge.target}-${index}`,
				source: edge.source,
				target: edge.target,
				type: "smoothstep",
				animated: edge.type === "cluster_to_disease" && weight > 0.25,
				label: edge.type === "cluster_to_disease" ? weight.toFixed(2) : undefined,
				style: { stroke, strokeWidth },
				labelStyle: { fontSize: 10, fill: "#475569" },
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: stroke,
				},
			}
		})
	}, [graphData])

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
						<div className="h-95 rounded-lg border">
							<ReactFlow
								nodes={flowNodes}
								edges={flowEdges}
								fitView
								fitViewOptions={{ padding: 0.2 }}
								proOptions={{ hideAttribution: true }}
							>
								<Background gap={20} color="#e2e8f0" />
								<MiniMap pannable zoomable />
								<Controls showInteractive={false} />
							</ReactFlow>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}

