from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_serializer


class ImportWarning(BaseModel):
    rowNumber: Optional[int] = None
    field: Optional[str] = None
    code: str
    message: str


class PreviewTransaction(BaseModel):
    transactionDate: str
    description: str
    amount: Decimal
    rawDescription: str
    externalId: Optional[str] = None
    sourceHash: str
    rowNumber: int

    @field_serializer("amount")
    def serialize_amount(self, amount: Decimal) -> str:
        return format(amount, "f")


class ImportPreviewResponse(BaseModel):
    institution: str
    sourceType: str
    fileName: str
    rowCount: int
    validCount: int
    warningCount: int
    transactions: list[PreviewTransaction]
    warnings: list[ImportWarning]
