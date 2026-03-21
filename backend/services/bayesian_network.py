from __future__ import annotations

import math
from typing import Any

import pandas as pd

try:
	from backend.services.data_loader import DataLoader
	from backend.services.fuzzy_engine import FuzzyEngine
except ModuleNotFoundError:
	from services.data_loader import DataLoader
	from services.fuzzy_engine import FuzzyEngine


class BayesianNetwork:
	def __init__(self, data_loader: DataLoader, fuzzy_engine: FuzzyEngine):
		self.data_loader = data_loader
		self.fuzzy_engine = fuzzy_engine
		self._cpt = ({}, {})

	@property
	def symptom_cpt(self) -> dict[str, dict[str, float]]:
		return self._cpt[0]

	@property
	def cluster_cpt(self) -> dict[str, dict[str, float]]:
		return self._cpt[1]

	def build_cpt(self, training_df: pd.DataFrame) -> None:
		symptom_cols = [f"Symptom_{i}" for i in range(1, 18)]
		trimmed = training_df.copy()
		trimmed["Disease"] = trimmed["Disease"].astype(str).str.strip()
		trimmed[symptom_cols] = trimmed[symptom_cols].astype(str).apply(
			lambda col: col.str.strip()
		)

		new_symptom_cpt: dict[str, dict[str, float]] = {}
		new_cluster_cpt: dict[str, dict[str, float]] = {}

		for disease in self.data_loader.all_diseases:
			rows_d = trimmed[trimmed["Disease"] == disease]
			n = len(rows_d)
			rows_symptoms = rows_d[symptom_cols]

			new_symptom_cpt[disease] = {}
			for symptom in self.data_loader.all_symptoms:
				count = int(
					rows_symptoms.apply(
						lambda row: row.eq(symptom).any(),
						axis=1,
					).sum()
				)
				new_symptom_cpt[disease][symptom] = (count + 1) / (n + 2)

			new_cluster_cpt[disease] = {}
			for cluster_name, cluster_symptoms in self.data_loader.cluster_map.items():
				symptom_set = set(cluster_symptoms)
				count = int(
					rows_symptoms.apply(
						lambda row: bool(set(row) & symptom_set),
						axis=1,
					).sum()
				)
				new_cluster_cpt[disease][cluster_name] = count / n if n > 0 else 0.0

		self._cpt = (new_symptom_cpt, new_cluster_cpt)

	def infer(
		self,
		selected_symptoms: list[str],
		binary_mode: bool = False,
		cpt_snapshot: tuple[dict[str, dict[str, float]], dict[str, dict[str, float]]] | None = None,
	) -> list[dict[str, Any]]:
		if not self.data_loader.all_diseases:
			return []
		EPSILON = 1e-3
		symptom_cpt, cluster_cpt = cpt_snapshot if cpt_snapshot is not None else self._cpt
		selected_symptoms = list(dict.fromkeys(selected_symptoms))

		cluster_scores = self.fuzzy_engine.compute_cluster_scores(
			selected_symptoms,
			self.data_loader.severity_dict,
			self.data_loader.cluster_map,
		)

		log_likelihoods: dict[str, float] = {}
		for disease in self.data_loader.all_diseases:
			log_ll = 0.0
			for symptom in selected_symptoms:
				ev = self.fuzzy_engine.compute_evidence(
					symptom,
					disease,
					symptom_cpt,
					binary_mode=binary_mode,
				)
				log_ll += math.log(ev + EPSILON)
			log_likelihoods[disease] = log_ll

		max_ll = max(log_likelihoods.values())
		raw = {d: math.exp(ll - max_ll) for d, ll in log_likelihoods.items()}
		total = sum(raw.values())

		if total > 0:
			posterior = {d: (raw[d] / total) * 100 for d in raw}
		else:
			n_diseases = len(self.data_loader.all_diseases)
			uniform_probability = 100 / max(n_diseases, 1)
			posterior = {d: uniform_probability for d in self.data_loader.all_diseases}

		results: list[dict[str, Any]] = []
		for disease in self.data_loader.all_diseases:
			disease_cluster_contributions = {
				cluster: round(
					score * cluster_cpt.get(disease, {}).get(cluster, 0.0),
					4,
				)
				for cluster, score in cluster_scores.items()
				if score > 0
			}
			results.append(
				{
					"disease": disease,
					"probability": posterior[disease],
					"description": self.data_loader.descriptions.get(disease, ""),
					"precautions": self.data_loader.precautions.get(disease, []),
					"cluster_contributions": disease_cluster_contributions,
				}
			)

		results.sort(key=lambda item: item["probability"], reverse=True)
		return results

	def get_graph_data(
		self,
		selected_symptoms: list[str],
		cluster_scores: dict[str, float],
		top_disease: str,
		cpt_snapshot: tuple[dict[str, dict[str, float]], dict[str, dict[str, float]]] | None = None,
	) -> dict[str, list[dict[str, Any]]]:
		symptom_cpt, cluster_cpt = cpt_snapshot if cpt_snapshot is not None else self._cpt
		nodes: list[dict[str, Any]] = []
		edges: list[dict[str, Any]] = []

		nodes.append({"id": top_disease, "label": top_disease, "type": "disease"})

		for cluster_name in self.data_loader.cluster_map.keys():
			nodes.append(
				{
					"id": cluster_name,
					"label": cluster_name,
					"type": "cluster",
					"score": cluster_scores.get(cluster_name, 0.0),
				}
			)

		for symptom in selected_symptoms:
			nodes.append({"id": symptom, "label": symptom, "type": "symptom"})

		for symptom in selected_symptoms:
			cluster_name = self.data_loader.symptom_to_cluster.get(
				symptom, "inflammatory_syndrome"
			)
			edges.append(
				{
					"source": symptom,
					"target": cluster_name,
					"weight": 1.0,
					"type": "symptom_to_cluster",
				}
			)

		for cluster_name in self.data_loader.cluster_map.keys():
			weight = cluster_cpt.get(top_disease, {}).get(cluster_name, 0.0)
			edges.append(
				{
					"source": cluster_name,
					"target": top_disease,
					"weight": weight,
					"type": "cluster_to_disease",
				}
			)

		return {"nodes": nodes, "edges": edges}

