from decimal import Decimal

from app.parsers.inter_csv import preview_inter_csv


def test_previews_valid_inter_csv():
    content = """
Data;Histórico;Valor;Identificador
05/09/2026;PIX RECEBIDO;1.234,56;abc-1
06/09/2026;SUPERMERCADO;-450,00;abc-2
""".strip().encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert preview.rowCount == 2
    assert preview.validCount == 2
    assert preview.warningCount == 0
    assert preview.transactions[0].transactionDate == "2026-09-05"
    assert preview.transactions[0].description == "PIX RECEBIDO"
    assert preview.transactions[0].amount == Decimal("1234.56")
    assert preview.transactions[0].externalId == "abc-1"
    assert preview.transactions[1].amount == Decimal("-450.00")


def test_keeps_quoted_descriptions_with_commas():
    content = '''
Data,Descrição,Valor
2026-09-05,"Mercado, Padaria e Cafe",-123.40
'''.strip().encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert preview.validCount == 1
    assert preview.transactions[0].description == "Mercado, Padaria e Cafe"
    assert preview.transactions[0].amount == Decimal("-123.40")


def test_normalizes_brazilian_money_values():
    content = """
Data;Histórico;Valor
05/09/2026;Com currency;R$ 1.234,56
06/09/2026;Plain comma;450,00
07/09/2026;Negative;-450,00
""".strip().encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert [transaction.amount for transaction in preview.transactions] == [
        Decimal("1234.56"),
        Decimal("450.00"),
        Decimal("-450.00"),
    ]


def test_warns_for_invalid_dates():
    content = """
Data;Histórico;Valor
99/09/2026;Bad date;10,00
""".strip().encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert preview.validCount == 0
    assert preview.warnings[0].code == "invalid_date"
    assert preview.warnings[0].rowNumber == 2


def test_warns_for_missing_required_columns():
    content = """
Quando;Texto;Total
05/09/2026;PIX;10,00
""".strip().encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert preview.rowCount == 0
    assert preview.validCount == 0
    assert preview.warnings[0].code == "unsupported_headers"
    assert "date" in preview.warnings[0].message


def test_warns_for_blank_rows():
    content = "Data;Histórico;Valor\n05/09/2026;PIX;10,00\n;;\n".encode()

    preview = preview_inter_csv(content, "inter.csv")

    assert preview.rowCount == 1
    assert preview.validCount == 1
    assert preview.warnings[0].code == "empty_row"
    assert preview.warnings[0].rowNumber == 3


def test_source_hash_is_deterministic():
    content = """
Data;Histórico;Valor;Identificador
05/09/2026;PIX RECEBIDO;1.234,56;abc-1
""".strip().encode()

    first = preview_inter_csv(content, "first.csv")
    second = preview_inter_csv(content, "second.csv")

    assert first.transactions[0].sourceHash == second.transactions[0].sourceHash
