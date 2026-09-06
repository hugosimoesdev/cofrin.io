from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_previews_csv_upload():
    response = client.post(
        "/imports/preview",
        files={
            "file": (
                "inter.csv",
                "Data;Histórico;Valor\n05/09/2026;PIX;10,00\n",
                "text/csv",
            )
        },
    )

    payload = response.json()

    assert response.status_code == 200
    assert payload["institution"] == "inter"
    assert payload["sourceType"] == "csv"
    assert payload["fileName"] == "inter.csv"
    assert payload["validCount"] == 1
    assert payload["transactions"][0]["amount"] == "10.00"


def test_rejects_unsupported_institution():
    response = client.post(
        "/imports/preview",
        data={"institution": "nubank"},
        files={"file": ("inter.csv", "Data;Histórico;Valor\n", "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only institution=inter is supported."


def test_rejects_unsupported_source_type():
    response = client.post(
        "/imports/preview",
        data={"sourceType": "pdf"},
        files={"file": ("inter.csv", "Data;Histórico;Valor\n", "text/csv")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only sourceType=csv is supported."


def test_rejects_non_csv_upload():
    response = client.post(
        "/imports/preview",
        files={"file": ("statement.pdf", "%PDF-1.7", "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only CSV uploads are supported."


def test_malformed_csv_returns_warnings():
    response = client.post(
        "/imports/preview",
        files={"file": ("inter.csv", "Quando;Texto;Total\nx;y;z\n", "text/csv")},
    )

    payload = response.json()

    assert response.status_code == 200
    assert payload["validCount"] == 0
    assert payload["warningCount"] == 1
    assert payload["warnings"][0]["code"] == "unsupported_headers"
