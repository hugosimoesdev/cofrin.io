from decimal import Decimal, InvalidOperation
import re
from typing import Optional


def normalize_money(value: str) -> Optional[Decimal]:
    text = value.strip()
    if not text:
        return None

    is_parenthesized_negative = text.startswith("(") and text.endswith(")")
    cleaned = re.sub(r"[^\d,.\-]", "", text)

    if not cleaned:
        return None

    if "," in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")

    if is_parenthesized_negative and not cleaned.startswith("-"):
        cleaned = f"-{cleaned}"

    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None
