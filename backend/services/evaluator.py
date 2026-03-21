from __future__ import annotations

import threading
from statistics import mean

import pandas as pd

try:
	from backend.services.bayesian_network import BayesianNetwork
	from backend.services.data_loader import DataLoader
	from backend.services.fuzzy_engine import FuzzyEngine
except ModuleNotFoundError:
	from services.bayesian_network import BayesianNetwork
	from services.data_loader import DataLoader
	from services.fuzzy_engine import FuzzyEngine


class Evaluator:
	def __init__(
		self,
		data_loader: DataLoader,
		fuzzy_engine: FuzzyEngine,
		bayesian_network: BayesianNetwork,
	):
		self.data_loader = data_loader
		self.fuzzy_engine = fuzzy_engine
		self.bayesian_network = bayesian_network
		self._cache: dict | None = None
		self._lock = threading.Lock()

	def run_evaluation(self) -> dict:
		symptom_cols = [f"Symptom_{i}" for i in range(1, 18)]

		training_df = (
			self.data_loader.raw_dataframe.groupby("Disease", as_index=False, group_keys=False)
			.head(96)
			.reset_index(drop=True)
		)
		test_df = (
			self.data_loader.raw_dataframe.groupby("Disease", as_index=False, group_keys=False)
			.tail(24)
			.reset_index(drop=True)
		)

		self.bayesian_network.build_cpt(training_df=training_df)

		all_diseases = self.data_loader.all_diseases
		confusion: dict[str, dict[str, int]] = {
			actual: {pred: 0 for pred in all_diseases} for actual in all_diseases
		}

		top1_hits = 0
		top5_hits = 0
		total_test_rows = len(test_df)
		evaluated_rows = 0

		def evaluate_loop(binary_mode: bool = False) -> tuple[int, int]:
			local_top1 = 0
			local_top5 = 0
			for _, row in test_df.iterrows():
				syms = [
					str(row[col]).strip()
					for col in symptom_cols
					if str(row[col]).strip() != ""
				]
				filtered = [s for s in syms if s in self.data_loader.all_symptoms]
				if not filtered:
					continue

				result = self.bayesian_network.infer(filtered, binary_mode=binary_mode)
				actual = str(row["Disease"]).strip()
				rank1 = result[0]["disease"]
				top5 = [r["disease"] for r in result[:5]]

				if rank1 == actual:
					local_top1 += 1
				if actual in top5:
					local_top5 += 1

				if not binary_mode and actual in confusion and rank1 in confusion[actual]:
					confusion[actual][rank1] += 1
			return local_top1, local_top5

		top1_hits, top5_hits = evaluate_loop(binary_mode=False)
		evaluated_rows = int(sum(sum(row.values()) for row in confusion.values()))

		top1_accuracy = (top1_hits / total_test_rows) * 100 if total_test_rows else 0.0
		top5_accuracy = (top5_hits / total_test_rows) * 100 if total_test_rows else 0.0

		f1_scores: dict[str, float] = {}
		for disease in all_diseases:
			tp = confusion[disease][disease]
			fp = sum(confusion[other][disease] for other in all_diseases if other != disease)
			fn = sum(confusion[disease][other] for other in all_diseases if other != disease)

			precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
			recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
			f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
			f1_scores[disease] = f1

		macro_f1 = mean(f1_scores.values()) if f1_scores else 0.0

		binary_top1_hits, _ = evaluate_loop(binary_mode=True)
		binary_top1 = (
			(binary_top1_hits / total_test_rows) * 100 if total_test_rows else 0.0
		)

		return {
			"split": {
				"training_rows": len(training_df),
				"test_rows": len(test_df),
				"evaluated_rows": evaluated_rows,
			},
			"test_size": len(test_df),
			"fuzzy_top1": top1_accuracy,
			"top1_accuracy": top1_accuracy,
			"top5_accuracy": top5_accuracy,
			"macro_f1": macro_f1,
			"binary_top1": binary_top1,
			"confusion_matrix": confusion,
			"per_disease_f1": f1_scores,
		}

	def get_results(self) -> dict:
		with self._lock:
			if self._cache is None:
				self._cache = self.run_evaluation()
			return self._cache

