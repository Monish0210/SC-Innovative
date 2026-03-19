from __future__ import annotations

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

