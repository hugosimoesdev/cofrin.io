import re
import unicodedata
from typing import Optional


def normalize_description(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_header(value: Optional[str]) -> str:
    if value is None:
        return ""

    without_accents = "".join(
        character
        for character in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(character)
    )
    return re.sub(r"[^a-z0-9]+", " ", without_accents.casefold()).strip()
