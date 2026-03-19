from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel


router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


class DiagnoseRequest(BaseModel):
	symptoms: list[str]


@router.get("/")
def diagnosis_placeholder() -> dict[str, str]:
	return {"message": "Diagnosis endpoint wiring ready."}


@router.get("/symptoms")
def list_symptoms(request: Request) -> list[str]:
	data_loader = request.app.state.data_loader
	return data_loader.all_symptoms


@router.post("/diagnose")
def diagnose(payload: DiagnoseRequest, request: Request) -> dict:
	data_loader = request.app.state.data_loader
	fuzzy_engine = request.app.state.fuzzy_engine
	bayesian_network = request.app.state.bayesian_network

	selected_symptoms = [symptom.strip() for symptom in payload.symptoms if symptom.strip()]
	if not selected_symptoms:
		raise HTTPException(status_code=400, detail="At least one symptom is required")

	unknown_symptoms = [
		symptom for symptom in selected_symptoms if symptom not in data_loader.all_symptoms
	]
	if unknown_symptoms:
		raise HTTPException(
			status_code=400,
			detail=f"Unknown symptoms: {unknown_symptoms}",
		)

	all_results = bayesian_network.infer(selected_symptoms)
	top5 = all_results[:5]
	top_disease = top5[0]["disease"] if top5 else ""

	cluster_scores = fuzzy_engine.compute_cluster_scores(
		selected_symptoms,
		data_loader.severity_dict,
		data_loader.cluster_map,
	)

	fuzzy_details = []
	for symptom in selected_symptoms:
		detail = fuzzy_engine.fuzzify_detail(symptom, data_loader.severity_dict)
		p_laplace = bayesian_network.symptom_cpt.get(top_disease, {}).get(symptom, 1 / 98)
		evidence_score = fuzzy_engine.compute_evidence(
			symptom=symptom,
			disease=top_disease,
			symptom_cpt=bayesian_network.symptom_cpt,
		)
		detail["p_laplace"] = p_laplace
		detail["evidence_score"] = evidence_score
		detail["top_disease"] = top_disease
		fuzzy_details.append(detail)

	graph_data = bayesian_network.get_graph_data(
		selected_symptoms=selected_symptoms,
		cluster_scores=cluster_scores,
		top_disease=top_disease,
	)

	return {
		"top5": top5,
		"all_results": all_results,
		"fuzzy_details": fuzzy_details,
		"cluster_scores": cluster_scores,
		"top_disease": top_disease,
		"graph_data": graph_data,
	}

