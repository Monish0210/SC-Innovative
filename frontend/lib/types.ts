export type FuzzyDetail = {
	symptom: string
	weight: number
	mu_low: number
	mu_medium: number
	mu_high: number
	mf_sum: number
	input_centroid: number
	dominant_set: "LOW" | "MEDIUM" | "HIGH"
	p_laplace?: number
	evidence_score?: number
	top_disease?: string
}

export type DiseaseResult = {
	disease: string
	probability: number
	description: string
	precautions: string[]
	cluster_contributions: Record<string, number>
}

export type GraphNode = {
	id: string
	type: "disease" | "cluster" | "symptom"
	label: string
	score: number
}

export type GraphEdge = {
	source: string
	target: string
	weight: number
	type?: string
}

export type DiagnosisResponse = {
	top5: DiseaseResult[]
	all_results: DiseaseResult[]
	fuzzy_details: FuzzyDetail[]
	cluster_scores: Record<string, number>
	top_disease?: string
	graph_data: {
		nodes: GraphNode[]
		edges: GraphEdge[]
	}
}

export type MetricsResponse = {
	top1_accuracy: number
	top5_accuracy: number
	macro_f1: number
	test_size?: number
	fuzzy_top1: number
	binary_top1: number
	per_disease_f1: Record<string, number>
	confusion_matrix: Record<string, Record<string, number>>
	split?: {
		training_rows: number
		test_rows: number
		evaluated_rows: number
	}
}
