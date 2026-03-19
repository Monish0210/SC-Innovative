from __future__ import annotations

from typing import Any

try:
	from backend.services.data_loader import DataLoader
except ModuleNotFoundError:
	from services.data_loader import DataLoader


EPSILON = 1e-3


def triangular_mf(x: float, a: float, peak: float, c: float) -> float:
	if x == peak:
		return 1.0
	if x < a or x > c:
		return 0.0
	if x < peak:
		return (x - a) / (peak - a)
	return (c - x) / (c - peak)


def input_centroid(weight: float) -> float:
	mu_low = triangular_mf(weight, 1, 1, 4)
	mu_medium = triangular_mf(weight, 1, 4, 7)
	mu_high = triangular_mf(weight, 4, 7, 7)
	return mu_low * 0.2 + mu_medium * 0.5 + mu_high * 0.9


def rule_strength(p: float) -> float:
	return p


def compute_evidence(
	symptom: str,
	disease: str,
	severity_dict: dict[str, int],
	symptom_cpt: dict[str, dict[str, float]],
) -> float:
	weight = severity_dict.get(symptom, 3)
	ic = input_centroid(weight)
	probability = symptom_cpt.get(disease, {}).get(symptom, 1 / 98)
	return ic * probability


def compute_cluster_scores(
	selected_symptoms: list[str],
	severity_dict: dict[str, int],
	cluster_map: dict[str, list[str]],
) -> dict[str, float]:
	scores: dict[str, float] = {}

	for cluster_name, cluster_symptoms in cluster_map.items():
		cluster_symptom_set = set(cluster_symptoms)
		members = [symptom for symptom in selected_symptoms if symptom in cluster_symptom_set]

		if not members:
			scores[cluster_name] = 0.0
		else:
			contributions = [
				input_centroid(severity_dict.get(symptom, 3)) for symptom in members
			]
			scores[cluster_name] = sum(contributions) / len(contributions)

	return scores


def fuzzify_detail(symptom: str, severity_dict: dict[str, int]) -> dict[str, Any]:
	weight = severity_dict.get(symptom, 3)

	mu_low = triangular_mf(weight, 1, 1, 4)
	mu_medium = triangular_mf(weight, 1, 4, 7)
	mu_high = triangular_mf(weight, 4, 7, 7)

	ic = mu_low * 0.2 + mu_medium * 0.5 + mu_high * 0.9
	dominant_set = max(
		[("LOW", mu_low), ("MEDIUM", mu_medium), ("HIGH", mu_high)],
		key=lambda item: item[1],
	)[0]

	return {
		"symptom": symptom,
		"weight": weight,
		"mu_low": mu_low,
		"mu_medium": mu_medium,
		"mu_high": mu_high,
		"mf_sum": mu_low + mu_medium + mu_high,
		"input_centroid": ic,
		"dominant_set": dominant_set,
	}


class FuzzyEngine:
	def __init__(self, data_loader: DataLoader):
		self.data_loader = data_loader

	def triangular_mf(self, x: float, a: float, peak: float, c: float) -> float:
		return triangular_mf(x, a, peak, c)

	def input_centroid(self, weight: float) -> float:
		return input_centroid(weight)

	def rule_strength(self, p: float) -> float:
		return rule_strength(p)

	def compute_evidence(
		self,
		symptom: str,
		disease: str,
		symptom_cpt: dict[str, dict[str, float]],
	) -> float:
		return compute_evidence(
			symptom=symptom,
			disease=disease,
			severity_dict=self.data_loader.severity_dict,
			symptom_cpt=symptom_cpt,
		)

	def compute_cluster_scores(self, selected_symptoms: list[str]) -> dict[str, float]:
		return compute_cluster_scores(
			selected_symptoms=selected_symptoms,
			severity_dict=self.data_loader.severity_dict,
			cluster_map=self.data_loader.cluster_map,
		)

	def fuzzify_detail(self, symptom: str) -> dict[str, Any]:
		return fuzzify_detail(symptom=symptom, severity_dict=self.data_loader.severity_dict)

