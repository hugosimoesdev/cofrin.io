from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.parsers.inter_csv import preview_inter_csv

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/preview")
async def preview_import(
    file: UploadFile = File(...),
    institution: str = Form("inter"),
    sourceType: str = Form("csv"),
):
    normalized_institution = institution.strip().lower()
    normalized_source_type = sourceType.strip().lower()

    if normalized_institution != "inter":
        raise HTTPException(status_code=400, detail="Only institution=inter is supported.")
    if normalized_source_type != "csv":
        raise HTTPException(status_code=400, detail="Only sourceType=csv is supported.")
    if not _looks_like_csv(file):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

    content = await file.read()
    return preview_inter_csv(content, file.filename or "upload.csv")


def _looks_like_csv(file: UploadFile) -> bool:
    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    return (
        filename.endswith(".csv")
        or content_type in {"text/csv", "application/csv", "application/vnd.ms-excel"}
    )
