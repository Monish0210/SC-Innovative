from __future__ import annotations

try:
	from backend.services.data_loader import DataLoader
except ModuleNotFoundError:
	from services.data_loader import DataLoader


class BayesianNetwork:
	def __init__(self, data_loader: DataLoader):
		self.data_loader = data_loader

