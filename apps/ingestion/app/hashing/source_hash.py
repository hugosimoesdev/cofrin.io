from decimal import Decimal
from hashlib import sha256
from typing import Optional


def build_source_hash(
    institution: str,
    transaction_date: str,
    description: str,
    amount: Decimal,
    external_id: Optional[str],
) -> str:
    canonical = "|".join(
        [
            institution.strip().lower(),
            transaction_date,
            description.strip().casefold(),
            format(amount, "f"),
            (external_id or "").strip().casefold(),
        ]
    )
    return sha256(canonical.encode("utf-8")).hexdigest()
