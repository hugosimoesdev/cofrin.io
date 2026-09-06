from datetime import datetime
from typing import Optional


SUPPORTED_DATE_FORMATS = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y")


def normalize_date(value: str) -> Optional[str]:
    text = value.strip()
    if not text:
        return None

    for date_format in SUPPORTED_DATE_FORMATS:
        try:
            return datetime.strptime(text, date_format).date().isoformat()
        except ValueError:
            pass

    return None
