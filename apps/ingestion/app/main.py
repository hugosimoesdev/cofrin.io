from fastapi import FastAPI

from app.api.imports import router as imports_router

app = FastAPI(title="Cofrin Ingestion", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(imports_router)
