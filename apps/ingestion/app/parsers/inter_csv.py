import csv
from io import StringIO
from typing import Dict, Optional

from app.hashing.source_hash import build_source_hash
from app.models.imports import ImportPreviewResponse, ImportWarning, PreviewTransaction
from app.normalizers.dates import normalize_date
from app.normalizers.money import normalize_money
from app.normalizers.text import normalize_description, normalize_header

INSTITUTION = "inter"
SOURCE_TYPE = "csv"

DATE_HEADERS = {"data", "data lancamento", "data movimento", "data transacao"}
DESCRIPTION_HEADERS = {
    "historico",
    "descricao",
    "lancamento",
    "estabelecimento",
    "detalhes",
}
AMOUNT_HEADERS = {"valor", "valor r", "valor lancamento", "valor transacao"}
EXTERNAL_ID_HEADERS = {"id", "identificador", "codigo", "codigo transacao", "nsu"}


def preview_inter_csv(content: bytes, file_name: str) -> ImportPreviewResponse:
    warnings: list[ImportWarning] = []
    text = _decode_content(content)

    if not text.strip():
        warnings.append(
            ImportWarning(code="empty_file", message="CSV file is empty.")
        )
        return _response(file_name, 0, [], warnings)

    dialect = _sniff_dialect(text)
    reader = csv.DictReader(StringIO(text), dialect=dialect)

    if not reader.fieldnames:
        warnings.append(
            ImportWarning(code="missing_header", message="CSV header row is required.")
        )
        return _response(file_name, 0, [], warnings)

    header_map = _build_header_map(reader.fieldnames)
    missing_fields = _missing_required_fields(header_map)
    if missing_fields:
        warnings.append(
            ImportWarning(
                code="unsupported_headers",
                message=(
                    "CSV headers are not supported. Missing required fields: "
                    + ", ".join(missing_fields)
                    + "."
                ),
            )
        )
        return _response(file_name, 0, [], warnings)

    transactions: list[PreviewTransaction] = []
    row_count = 0

    for row_number, row in enumerate(reader, start=2):
        if _is_blank_row(row):
            warnings.append(
                ImportWarning(
                    rowNumber=row_number,
                    code="empty_row",
                    message="CSV row is empty and was skipped.",
                )
            )
            continue

        row_count += 1
        transaction = _parse_row(row, row_number, header_map, warnings)
        if transaction is not None:
            transactions.append(transaction)

    return _response(file_name, row_count, transactions, warnings)


def _decode_content(content: bytes) -> str:
    for encoding in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            pass

    return content.decode("utf-8", errors="replace")


def _sniff_dialect(text: str) -> csv.Dialect:
    sample = text[:2048]
    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        return csv.excel


def _build_header_map(fieldnames: list[str]) -> dict[str, str]:
    header_map: dict[str, str] = {}

    for fieldname in fieldnames:
        normalized = normalize_header(fieldname)
        if normalized in DATE_HEADERS:
            header_map.setdefault("date", fieldname)
        elif normalized in DESCRIPTION_HEADERS:
            header_map.setdefault("description", fieldname)
        elif normalized in AMOUNT_HEADERS:
            header_map.setdefault("amount", fieldname)
        elif normalized in EXTERNAL_ID_HEADERS:
            header_map.setdefault("external_id", fieldname)

    return header_map


def _missing_required_fields(header_map: dict[str, str]) -> list[str]:
    return [
        field
        for field in ("date", "description", "amount")
        if field not in header_map
    ]


def _is_blank_row(row: Dict[str, Optional[str]]) -> bool:
    return all((value or "").strip() == "" for value in row.values())


def _parse_row(
    row: Dict[str, Optional[str]],
    row_number: int,
    header_map: dict[str, str],
    warnings: list[ImportWarning],
) -> Optional[PreviewTransaction]:
    raw_date = _get(row, header_map["date"])
    raw_description = _get(row, header_map["description"])
    raw_amount = _get(row, header_map["amount"])
    external_id = _get(row, header_map.get("external_id"))

    transaction_date = normalize_date(raw_date)
    description = normalize_description(raw_description)
    amount = normalize_money(raw_amount)
    row_is_valid = True

    if not raw_date.strip():
        _warn(warnings, row_number, "transactionDate", "missing_date", "Transaction date is required.")
        row_is_valid = False
    elif transaction_date is None:
        _warn(warnings, row_number, "transactionDate", "invalid_date", "Transaction date is invalid.")
        row_is_valid = False

    if not description:
        _warn(warnings, row_number, "description", "missing_description", "Description is required.")
        row_is_valid = False

    if not raw_amount.strip():
        _warn(warnings, row_number, "amount", "missing_amount", "Amount is required.")
        row_is_valid = False
    elif amount is None:
        _warn(warnings, row_number, "amount", "invalid_amount", "Amount is invalid.")
        row_is_valid = False

    if not row_is_valid or transaction_date is None or amount is None:
        return None

    normalized_external_id = normalize_description(external_id) or None
    source_hash = build_source_hash(
        INSTITUTION,
        transaction_date,
        description,
        amount,
        normalized_external_id,
    )

    return PreviewTransaction(
        transactionDate=transaction_date,
        description=description,
        amount=amount,
        rawDescription=raw_description,
        externalId=normalized_external_id,
        sourceHash=source_hash,
        rowNumber=row_number,
    )


def _get(row: Dict[str, Optional[str]], key: Optional[str]) -> str:
    if key is None:
        return ""

    return row.get(key) or ""


def _warn(
    warnings: list[ImportWarning],
    row_number: int,
    field: str,
    code: str,
    message: str,
) -> None:
    warnings.append(
        ImportWarning(rowNumber=row_number, field=field, code=code, message=message)
    )


def _response(
    file_name: str,
    row_count: int,
    transactions: list[PreviewTransaction],
    warnings: list[ImportWarning],
) -> ImportPreviewResponse:
    return ImportPreviewResponse(
        institution=INSTITUTION,
        sourceType=SOURCE_TYPE,
        fileName=file_name,
        rowCount=row_count,
        validCount=len(transactions),
        warningCount=len(warnings),
        transactions=transactions,
        warnings=warnings,
    )
