"use client"

import { useMemo, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
	Background,
	Controls,
	Edge,
	MarkerType,
	Node,
	Position,
	ReactFlow,
} from "@xyflow/react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FuzzyDetail, GraphEdge, GraphNode } from "@/lib/types"

type BayesianGraphProps = {
	graphData: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	} | null
	fuzzyDetails: FuzzyDetail[]
	topProbability?: number
	heightClass?: string
}

const formatLabel = (value: string, max = 26) => {
	const pretty = value
		.replaceAll("_", " ")
		.replaceAll("  ", " ")
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase())
	return pretty.length > max ? `${pretty.slice(0, max - 1)}...` : pretty
}

export function BayesianGraph({ graphData, fuzzyDetails, topProbability, heightClass = "h-112.5" }: BayesianGraphProps) {
	const { resolvedTheme } = useTheme()
	const mounted = useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false
	)
	const isDark = mounted && resolvedTheme === "dark"

	const graphSummary = useMemo(() => {
		if (!graphData) {
			return null
		}

		const diseaseNode = graphData.nodes.find((node) => node.type === "disease")
		const activeClusters = graphData.nodes
			.filter((node) => node.type === "cluster" && Number(node.score ?? 0) > 0)
			.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
			.slice(0, 2)
			.map((node) => formatLabel(node.label, 24))

		const strongestEdge = graphData.edges
			.filter((edge) => edge.type === "cluster_to_disease")
			.sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0))[0]

		const strongestSymptom = [...fuzzyDetails].sort(
			(a, b) => b.input_centroid - a.input_centroid
		)[0]

		return {
			disease: diseaseNode ? formatLabel(diseaseNode.label, 32) : "Unknown",
			activeClusters,
			strongestEdge,
			symptomCount: graphData.nodes.filter((node) => node.type === "symptom").length,
			strongestSymptom,
		}
	}, [graphData, fuzzyDetails])

	const icBySymptom = useMemo(() => {
		return Object.fromEntries(
			fuzzyDetails.map((detail) => [detail.symptom, detail.input_centroid])
		)
	}, [fuzzyDetails])

	const clusterScoreById = useMemo(() => {
		if (!graphData) {
			return {}
		}
		return Object.fromEntries(
			graphData.nodes
				.filter((n) => n.type === "cluster")
				.map((node) => [node.id, Number(node.score ?? 0)])
		)
	}, [graphData])

	const flowNodes = useMemo<Node[]>(() => {
		if (!graphData) {
			return []
		}

		const diseaseNodes = graphData.nodes.filter((n) => n.type === "disease")
		const clusterNodes = graphData.nodes.filter((n) => n.type === "cluster")
		const symptomNodes = graphData.nodes.filter((n) => n.type === "symptom")

		const clusterCount = Math.max(clusterNodes.length, 1)
		const width = Math.max(1400, clusterCount * 220)
		const diseaseY = 40
		const clusterY = 240
		const symptomStartY = 430

		const diseaseLayer = diseaseNodes.map((node) => ({
			id: node.id,
			position: { x: width / 2 - 130, y: diseaseY },
			data: {
				label: `${formatLabel(node.label, 32)}${topProbability !== undefined ? ` (${topProbability.toFixed(1)}%)` : ""}`,
			},
			type: "default",
			style: {
				width: 260,
				textAlign: "center",
				background: "#dc2626",
				color: "#ffffff",
				border: "1px solid #b91c1c",
				fontSize: 12,
				fontWeight: 600,
				padding: "10px 12px",
				borderRadius: 10,
			},
			draggable: false,
			selectable: false,
			targetPosition: Position.Bottom,
		}))

		const clusterSpacing = clusterNodes.length > 1 ? (width - 180) / (clusterNodes.length - 1) : 0
		const clusterLayer = clusterNodes.map((node, index) => {
			const score = Number(clusterScoreById[node.id] ?? 0)
			const active = score > 0
			return {
				id: node.id,
				position: { x: 40 + index * clusterSpacing, y: clusterY },
				data: { label: formatLabel(node.label) },
				type: "default",
				style: {
					width: 180,
					textAlign: "center",
					background: active ? "#0f766e" : "#475569",
					color: "#ffffff",
					border: active ? "1px solid #0d9488" : "1px solid #64748b",
					fontSize: 12,
					fontWeight: 600,
					padding: "8px 10px",
					borderRadius: 10,
				},
				draggable: false,
				selectable: false,
				sourcePosition: Position.Top,
				targetPosition: Position.Bottom,
			}
		})

		const symptomsByCluster: Record<string, GraphNode[]> = {}
		for (const symptomNode of symptomNodes) {
			const parentEdge = graphData.edges.find(
				(edge) => edge.source === symptomNode.id && edge.target !== symptomNode.id
			)
			const clusterId = parentEdge?.target ?? "unassigned"
			if (!symptomsByCluster[clusterId]) {
				symptomsByCluster[clusterId] = []
			}
			symptomsByCluster[clusterId].push(symptomNode)
		}

		const clusterXById = Object.fromEntries(
			clusterLayer.map((node) => [node.id, Number(node.position.x)])
		)

		const symptomLayer = Object.entries(symptomsByCluster).flatMap(([clusterId, nodes]) => {
			const centerX = clusterXById[clusterId] ?? width / 2
			const columns = 2
			const xOffset = 115
			const rowGap = 92
			return nodes.map((node, index) => {
				const ic = icBySymptom[node.id]
				const col = index % columns
				const row = Math.floor(index / columns)
				const x = centerX + (col === 0 ? -xOffset : xOffset)
				return {
					id: node.id,
					position: { x, y: symptomStartY + row * rowGap },
					data: {
						label: `${formatLabel(node.label)}${ic !== undefined ? ` (IC ${ic.toFixed(3)})` : ""}`,
					},
					type: "default",
					style: {
						width: 190,
						textAlign: "center",
						background: "#2563eb",
						color: "#ffffff",
						border: "1px solid #1d4ed8",
						fontSize: 12,
						padding: "8px 10px",
						borderRadius: 10,
					},
					draggable: false,
					selectable: false,
					sourcePosition: Position.Top,
				}
			})
		})

		return [...diseaseLayer, ...clusterLayer, ...symptomLayer]
	}, [graphData, topProbability, clusterScoreById, icBySymptom])

	const flowEdges = useMemo<Edge[]>(() => {
		if (!graphData) {
			return []
		}

		const MIN_CLUSTER_EDGE_WEIGHT = 0.05
		const strongestClusterEdgeIds = new Set(
			graphData.edges
				.filter((edge) => edge.type === "cluster_to_disease")
				.filter((edge) => Number(clusterScoreById[edge.source] ?? 0) > 0)
				.sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0))
				.slice(0, 2)
				.map((edge) => `${edge.source}->${edge.target}`)
		)

		return graphData.edges.map((edge, index) => {
			const weight = Number.isFinite(edge.weight) ? edge.weight : 0
			const isClusterToDisease =
				graphData.nodes.some((n) => n.id === edge.source && n.type === "cluster") &&
				graphData.nodes.some((n) => n.id === edge.target && n.type === "disease")
			const sourceClusterScore = Number(clusterScoreById[edge.source] ?? 0)
			const sourceClusterActive = sourceClusterScore > 0

			if (isClusterToDisease && weight < MIN_CLUSTER_EDGE_WEIGHT) {
				return null
			}

			// Keep only active cluster-to-disease links to avoid arc clutter.
			if (isClusterToDisease && !sourceClusterActive) {
				return null
			}

			const strokeWidth = isClusterToDisease ? Math.max(1.25, weight * 5.5) : 1
			const stroke = isClusterToDisease
				? sourceClusterActive
					? "#0f766e"
					: "#0f766e"
				: isDark
					? "#64748b"
					: "#94a3b8"
			const showEdgeLabel =
				isClusterToDisease &&
				sourceClusterActive &&
				strongestClusterEdgeIds.has(`${edge.source}->${edge.target}`)

			return {
				id: `${edge.source}-${edge.target}-${index}`,
				source: edge.source,
				target: edge.target,
				type: isClusterToDisease ? "bezier" : "smoothstep",
				animated: false,
				label: showEdgeLabel ? weight.toFixed(2) : undefined,
				style: {
					stroke,
					strokeWidth,
					opacity: isClusterToDisease ? 0.95 : 0.65,
				},
				labelStyle: {
					fontSize: 12,
					fontWeight: 700,
					fill: isDark ? "#f8fafc" : "#0f172a",
				},
				labelBgStyle: {
					fill: isDark ? "#0f172a" : "#ffffff",
					fillOpacity: 0.98,
				},
				labelBgPadding: [7, 4],
				labelBgBorderRadius: 4,
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: stroke,
				},
			}
		}).filter((edge): edge is Edge => edge !== null)
	}, [graphData, isDark, clusterScoreById])

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
						<div className="rounded-md border p-3 text-sm">
							<p className="font-medium">How to read this graph (for current result)</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Predicted disease node: {graphSummary?.disease ?? "-"}
								{topProbability !== undefined ? ` (${topProbability.toFixed(2)}%)` : ""}.
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								This graph includes {graphSummary?.symptomCount ?? 0} selected symptom node(s).
								{graphSummary?.strongestSymptom
									? ` Highest-severity evidence symptom is ${formatLabel(graphSummary.strongestSymptom.symptom, 26)} (IC ${graphSummary.strongestSymptom.input_centroid.toFixed(3)}).`
									: ""}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Top active cluster(s): {graphSummary?.activeClusters?.length ? graphSummary.activeClusters.join(", ") : "none"}.
								{graphSummary?.strongestEdge
									? ` Strongest cluster->disease edge is ${formatLabel(graphSummary.strongestEdge.source, 24)} -> ${graphSummary.disease} (weight ${Number(graphSummary.strongestEdge.weight).toFixed(2)}).`
									: ""}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Cluster box color = activated by selected symptoms. Only active clusters are connected to the disease node. Edge thickness = learned relationship P(cluster|disease).
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">Nodes: {graphData.nodes.length}</Badge>
							<Badge variant="outline">Edges: {flowEdges.length}</Badge>
						</div>
						<div className={`${heightClass} rounded-lg border bg-slate-50 dark:bg-slate-900`}>
							<ReactFlow
								nodes={flowNodes}
								edges={flowEdges}
								fitView
								fitViewOptions={{ padding: 0.28 }}
								defaultEdgeOptions={{ type: "smoothstep" }}
								proOptions={{ hideAttribution: true }}
							>
								<Background gap={20} color={isDark ? "#334155" : "#e2e8f0"} />
								<Controls />
							</ReactFlow>
						</div>
						<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
							<Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">Disease</Badge>
							<Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-100">Active Cluster</Badge>
							<Badge className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100">Inactive Cluster</Badge>
							<Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">Symptom</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							Edge thickness = P(cluster|disease) learned from training data
						</p>
					</>
				)}
			</CardContent>
		</Card>
	)
}

