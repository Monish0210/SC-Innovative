from fastapi import APIRouter


router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/")
def metrics_placeholder() -> dict[str, str]:
	return {"message": "Metrics endpoint wiring ready."}

