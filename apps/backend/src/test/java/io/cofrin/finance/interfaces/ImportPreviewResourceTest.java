package io.cofrin.finance.interfaces;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.builder.MultiPartSpecBuilder;
import io.restassured.specification.MultiPartSpecification;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.containsString;

@QuarkusTest
class ImportPreviewResourceTest {

    @Test
    void previewsValidCsv() throws IOException {
        File csv = csvFile("""
                Data;Histórico;Valor;Identificador
                05/09/2026;PIX RECEBIDO;1.234,56;abc-1
                06/09/2026;SUPERMERCADO;-450,00;abc-2
                """);

        given()
                .multiPart(upload("inter.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("fileName", equalTo("inter.csv"))
                .body("sourceType", equalTo("csv"))
                .body("institution", equalTo("inter"))
                .body("rowCount", equalTo(2))
                .body("validCount", equalTo(2))
                .body("warningCount", equalTo(0))
                .body("transactions[0].transactionDate", equalTo("2026-09-05"))
                .body("transactions[0].description", equalTo("PIX RECEBIDO"))
                .body("transactions[0].amount", equalTo("1234.56"))
                .body("transactions[0].externalId", equalTo("abc-1"))
                .body("transactions[0].sourceHash", notNullValue())
                .body("transactions[0].status", equalTo("VALID"))
                .body("transactions[1].amount", equalTo("-450.00"));
    }

    @Test
    void supportsCommaDelimiterAndQuotedDescriptions() throws IOException {
        File csv = csvFile("""
                Date,Description,Amount
                2026-09-05,"Mercado, Padaria e Cafe",-123.40
                """);

        given()
                .multiPart(upload("statement.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("rowCount", equalTo(1))
                .body("validCount", equalTo(1))
                .body("transactions[0].description", equalTo("Mercado, Padaria e Cafe"))
                .body("transactions[0].amount", equalTo("-123.40"));
    }

    @Test
    void findsInterHeadersAfterStatementMetadata() throws IOException {
        File csv = csvFile("""
                Banco Inter
                Conta Corrente
                Periodo;01/08/2026 a 12/08/2026

                Data Lançamento;Descrição do Lançamento;Valor (R$)
                01/08/2026;Compra no debito;-32,50
                02/08/2026;Pix recebido;100,00
                """);

        given()
                .multiPart(upload("inter.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("rowCount", equalTo(2))
                .body("validCount", equalTo(2))
                .body("transactions[0].rowNumber", equalTo(6))
                .body("transactions[0].transactionDate", equalTo("2026-08-01"))
                .body("transactions[0].description", equalTo("Compra no debito"))
                .body("transactions[0].amount", equalTo("-32.50"));
    }

    @Test
    void normalizesBrazilianMoneyValues() throws IOException {
        File csv = csvFile("""
                Data;Descrição;Valor
                05/09/2026;Com currency;R$ 1.234,56
                06/09/2026;Plain comma;450,00
                """);

        given()
                .multiPart(upload("statement.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("transactions[0].amount", equalTo("1234.56"))
                .body("transactions[1].amount", equalTo("450.00"));
    }

    @Test
    void returnsWarningsForInvalidRowsAndBlankRows() throws IOException {
        File csv = csvFile("""
                Data;Histórico;Valor
                99/09/2026;Bad date;10,00
                06/09/2026;Bad amount;nope
                ;;
                """);

        given()
                .multiPart(upload("inter.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("rowCount", equalTo(2))
                .body("validCount", equalTo(0))
                .body("warningCount", equalTo(3))
                .body("transactions[0].status", equalTo("INVALID"))
                .body("transactions[1].status", equalTo("INVALID"))
                .body("warnings.find { it.code == 'invalid_date' }.rowNumber", equalTo(2))
                .body("warnings.find { it.code == 'invalid_amount' }.rowNumber", equalTo(3))
                .body("warnings.find { it.code == 'empty_row' }.rowNumber", equalTo(4));
    }

    @Test
    void returnsWarningForMissingRequiredHeaders() throws IOException {
        File csv = csvFile("""
                Quando;Texto;Total
                05/09/2026;PIX;10,00
                """);

        given()
                .multiPart(upload("inter.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("rowCount", equalTo(0))
                .body("validCount", equalTo(0))
                .body("warningCount", equalTo(1))
                .body("warnings[0].code", equalTo("unsupported_headers"))
                .body("warnings[0].message", containsString("date"));
    }

    @Test
    void rejectsEmptyUpload() throws IOException {
        File csv = csvFile("");

        given()
                .multiPart(upload("empty.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(400)
                .body("message", equalTo("File is empty."));
    }

    @Test
    void rejectsNonCsvUpload() throws IOException {
        File txt = csvFile("hello");

        given()
                .multiPart(upload("statement.txt", txt, "text/plain"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(400)
                .body("message", equalTo("Only CSV uploads are supported."));
    }

    @Test
    void generatesStableSourceHashesAndFlagsDuplicates() throws IOException {
        File csv = csvFile("""
                Data;Histórico;Valor;Identificador
                05/09/2026;PIX RECEBIDO;1.234,56;abc-1
                05/09/2026;PIX   RECEBIDO;1234.56;abc-1
                """);

        given()
                .multiPart(upload("inter.csv", csv, "text/csv"))
                .when().post("/api/imports/preview")
                .then()
                .statusCode(200)
                .body("rowCount", equalTo(2))
                .body("validCount", equalTo(1))
                .body("warningCount", equalTo(1))
                .body("transactions.collect { it.sourceHash }.unique().size()", equalTo(1))
                .body("transactions[0].status", equalTo("VALID"))
                .body("transactions[1].status", equalTo("DUPLICATE"))
                .body("warnings[0].code", equalTo("duplicate_row"));
    }

    private MultiPartSpecification upload(String fileName, File file, String mimeType) {
        return new MultiPartSpecBuilder(file)
                .controlName("file")
                .fileName(fileName)
                .mimeType(mimeType)
                .build();
    }

    private File csvFile(String content) throws IOException {
        File file = File.createTempFile("import-preview", ".csv");
        Files.writeString(file.toPath(), content.strip(), StandardCharsets.UTF_8);

        return file;
    }
}
