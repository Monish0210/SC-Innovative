from fastapi import APIRouter


router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.get("/")
def diagnosis_placeholder() -> dict[str, str]:
	return {"message": "Diagnosis endpoint wiring ready."}

