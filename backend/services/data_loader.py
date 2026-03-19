from __future__ import annotations

import json
import logging
from pathlib import Path

import pandas as pd


LOGGER = logging.getLogger(__name__)


class DataLoader:
	def __init__(self, data_dir: str):
		self.data_dir = Path(data_dir)

		self.raw_dataframe: pd.DataFrame = pd.DataFrame()
		self.disease_symptom_map: dict[str, set[str]] = {}
		self.all_diseases: list[str] = []
		self.all_symptoms: list[str] = []

		self.severity_dict: dict[str, int] = {}
		self.descriptions: dict[str, str] = {}
		self.precautions: dict[str, list[str]] = {}

		self.cluster_map: dict[str, list[str]] = {}
		self.symptom_to_cluster: dict[str, str] = {}
		self.default_weight_symptoms: list[str] = []

		self._load_all()

	def _load_all(self) -> None:
		self._load_dataset()
		self._load_severity()
		self._load_descriptions()
		self._load_precautions()
		self._load_cluster_config_if_present()
		self._print_startup_summary()

	def _load_dataset(self) -> None:
		dataset_path = self.data_dir / "dataset.csv"
		df = pd.read_csv(dataset_path)

		symptom_cols = [col for col in df.columns if col.startswith("Symptom_")]
		if "Disease" not in df.columns:
			raise ValueError("dataset.csv is missing Disease column")

		# Strip outer whitespace only; internal spaces remain untouched.
		df["Disease"] = df["Disease"].astype(str).str.strip()
		for col in symptom_cols:
			df[col] = df[col].fillna("").astype(str).str.strip()

		self.raw_dataframe = df.copy()

		disease_symptom_map: dict[str, set[str]] = {}
		all_symptoms: set[str] = set()

		for _, row in df.iterrows():
			disease = row["Disease"]
			if not disease:
				continue

			symptoms = {
				row[col]
				for col in symptom_cols
				if isinstance(row[col], str) and row[col] != ""
			}

			all_symptoms.update(symptoms)
			if disease not in disease_symptom_map:
				disease_symptom_map[disease] = set()
			disease_symptom_map[disease].update(symptoms)

		self.disease_symptom_map = disease_symptom_map
		self.all_diseases = sorted(self.disease_symptom_map.keys())
		self.all_symptoms = sorted(all_symptoms)

	def _load_severity(self) -> None:
		severity_path = self.data_dir / "Symptom-severity.csv"
		severity_df = pd.read_csv(severity_path)

		if not {"Symptom", "weight"}.issubset(set(severity_df.columns)):
			raise ValueError("Symptom-severity.csv must contain Symptom and weight")

		severity_df["Symptom"] = severity_df["Symptom"].fillna("").astype(str).str.strip()
		severity_df["weight"] = pd.to_numeric(
			severity_df["weight"], errors="coerce"
		).fillna(3)

		self.severity_dict = {
			row["Symptom"]: int(row["weight"])
			for _, row in severity_df.iterrows()
			if row["Symptom"]
		}

		missing_symptoms: list[str] = []
		for symptom in self.all_symptoms:
			if symptom not in self.severity_dict:
				self.severity_dict[symptom] = 3
				missing_symptoms.append(symptom)
				LOGGER.warning(
					"Missing severity weight for symptom '%s'. Assigned default weight 3.",
					symptom,
				)

		self.default_weight_symptoms = sorted(missing_symptoms)

	def _load_descriptions(self) -> None:
		desc_path = self.data_dir / "symptom_Description.csv"
		desc_df = pd.read_csv(desc_path)

		if not {"Disease", "Description"}.issubset(set(desc_df.columns)):
			raise ValueError(
				"symptom_Description.csv must contain Disease and Description"
			)

		desc_df["Disease"] = desc_df["Disease"].fillna("").astype(str).str.strip()
		desc_df["Description"] = (
			desc_df["Description"].fillna("").astype(str).str.strip()
		)

		self.descriptions = {
			row["Disease"]: row["Description"]
			for _, row in desc_df.iterrows()
			if row["Disease"]
		}

	def _load_precautions(self) -> None:
		precaution_path = self.data_dir / "symptom_precaution.csv"
		precaution_df = pd.read_csv(precaution_path)

		precaution_cols = [col for col in precaution_df.columns if col.startswith("Precaution_")]
		if "Disease" not in precaution_df.columns:
			raise ValueError("symptom_precaution.csv must contain Disease")

		precaution_df["Disease"] = (
			precaution_df["Disease"].fillna("").astype(str).str.strip()
		)

		precautions: dict[str, list[str]] = {}
		for _, row in precaution_df.iterrows():
			disease = row["Disease"]
			if not disease:
				continue

			values: list[str] = []
			for col in precaution_cols:
				value = row.get(col, "")
				if pd.isna(value):
					continue

				value_str = str(value).strip()
				if value_str:
					values.append(value_str)

			precautions[disease] = values

		self.precautions = precautions

	def _load_cluster_config_if_present(self) -> None:
		cluster_path = self.data_dir / "cluster_config.json"
		if not cluster_path.exists():
			self.cluster_map = {}
			self.symptom_to_cluster = {}
			return

		with cluster_path.open("r", encoding="utf-8") as file:
			config_data = json.load(file)

		cluster_map: dict[str, list[str]] = {}
		dataset_symptoms = set(self.all_symptoms)

		for cluster_name, cluster_symptoms in config_data.items():
			if not isinstance(cluster_symptoms, list):
				LOGGER.warning(
					"Cluster '%s' has invalid value type and will be ignored.",
					cluster_name,
				)
				continue

			cleaned_symptoms: list[str] = []
			for symptom in cluster_symptoms:
				if not isinstance(symptom, str):
					continue
				clean_symptom = symptom.strip()
				if not clean_symptom:
					continue

				if clean_symptom not in dataset_symptoms:
					LOGGER.warning(
						"Extra symptom '%s' in cluster '%s' removed; not present in dataset.",
						clean_symptom,
						cluster_name,
					)
					continue

				cleaned_symptoms.append(clean_symptom)

			cluster_map[cluster_name] = cleaned_symptoms

		symptom_to_cluster: dict[str, str] = {}
		for cluster_name, cluster_symptoms in cluster_map.items():
			for symptom in cluster_symptoms:
				if symptom in symptom_to_cluster:
					LOGGER.warning(
						"Symptom '%s' appears in multiple clusters; keeping first assignment '%s'.",
						symptom,
						symptom_to_cluster[symptom],
					)
					continue
				symptom_to_cluster[symptom] = cluster_name

		fallback_cluster = "inflammatory_syndrome"
		fallback_symptoms = cluster_map.setdefault(fallback_cluster, [])
		for symptom in self.all_symptoms:
			if symptom not in symptom_to_cluster:
				LOGGER.warning(
					"Symptom '%s' missing cluster assignment. Auto-added to '%s'.",
					symptom,
					fallback_cluster,
				)
				fallback_symptoms.append(symptom)
				symptom_to_cluster[symptom] = fallback_cluster

		self.cluster_map = cluster_map
		self.symptom_to_cluster = symptom_to_cluster

	def _print_startup_summary(self) -> None:
		print(f"[DataLoader] Disease count: {len(self.all_diseases)}")
		print(f"[DataLoader] Symptom count: {len(self.all_symptoms)}")
		print(
			"[DataLoader] Default-weight symptoms (weight=3): "
			f"{self.default_weight_symptoms}"
		)

	def get_description(self, disease: str) -> str:
		return self.descriptions.get(disease, "")

