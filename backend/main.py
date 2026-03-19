from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
	from backend.routers import diagnosis, metrics
	from backend.services.bayesian_network import BayesianNetwork
	from backend.services.data_loader import DataLoader
	from backend.services.evaluator import Evaluator
	from backend.services.fuzzy_engine import FuzzyEngine
except ModuleNotFoundError:
	from routers import diagnosis, metrics
	from services.bayesian_network import BayesianNetwork
	from services.data_loader import DataLoader
	from services.evaluator import Evaluator
	from services.fuzzy_engine import FuzzyEngine


@asynccontextmanager
async def lifespan(app: FastAPI):
	data_dir = Path(__file__).resolve().parent / "data"

	data_loader = DataLoader(data_dir=str(data_dir))
	fuzzy_engine = FuzzyEngine(data_loader=data_loader)
	bayesian_network = BayesianNetwork(data_loader=data_loader)
	evaluator = Evaluator(
		data_loader=data_loader,
		fuzzy_engine=fuzzy_engine,
		bayesian_network=bayesian_network,
	)

	app.state.data_loader = data_loader
	app.state.fuzzy_engine = fuzzy_engine
	app.state.bayesian_network = bayesian_network
	app.state.evaluator = evaluator

	yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}


app.include_router(diagnosis.router, prefix="/api")
app.include_router(metrics.router, prefix="/api")

