package io.cofrin.finance.interfaces;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.equalTo;

@QuarkusTest
class ImportCommitResourceTest {

    private static final UUID DEMO_ACCOUNT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID SALARY_CATEGORY_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID GROCERIES_CATEGORY_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    @Inject
    EntityManager entityManager;

    @BeforeEach
    @Transactional
    void seedData() {
        entityManager.createNativeQuery("DELETE FROM transactions").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM categories").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM accounts").executeUpdate();

        entityManager.createNativeQuery("""
                INSERT INTO accounts (id, name, type, initial_balance)
                VALUES (:id, 'Demo Wallet', 'cash', 250.0000)
                """)
                .setParameter("id", DEMO_ACCOUNT_ID)
                .executeUpdate();

        entityManager.createNativeQuery("""
                INSERT INTO categories (id, name, type)
                VALUES
                    (:salaryId, 'Salary', 'income'),
                    (:groceriesId, 'Groceries', 'expense')
                """)
                .setParameter("salaryId", SALARY_CATEGORY_ID)
                .setParameter("groceriesId", GROCERIES_CATEGORY_ID)
                .executeUpdate();
    }

    @Test
    void commitsSelectedImportTransactions() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactions": [
                            {
                              "transactionDate": "2026-09-05",
                              "description": "Pix recebido",
                              "amount": 100.00,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "notes": "Importado",
                              "sourceType": "csv",
                              "institution": "inter",
                              "sourceFileName": "inter.csv",
                              "sourceRowNumber": 2,
                              "sourceHash": "hash-income"
                            },
                            {
                              "transactionDate": "2026-09-06",
                              "description": "Mercado",
                              "amount": -45.90,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "sourceType": "csv",
                              "institution": "inter",
                              "sourceFileName": "inter.csv",
                              "sourceRowNumber": 3,
                              "sourceHash": "hash-expense"
                            }
                          ]
                        }
                        """.formatted(DEMO_ACCOUNT_ID, SALARY_CATEGORY_ID, DEMO_ACCOUNT_ID, GROCERIES_CATEGORY_ID))
                .when().post("/api/imports/commit")
                .then()
                .statusCode(200)
                .body("requestedCount", equalTo(2))
                .body("createdCount", equalTo(2))
                .body("skippedDuplicateCount", equalTo(0))
                .body("transactions[0].sourceHash", equalTo("hash-income"))
                .body("transactions[1].sourceFileName", equalTo("inter.csv"));
    }

    @Test
    void skipsRowsAlreadyImportedBySourceHash() {
        insertImportedTransaction("existing-hash");

        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactions": [
                            {
                              "transactionDate": "2026-09-05",
                              "description": "Pix recebido",
                              "amount": 100.00,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "sourceType": "csv",
                              "institution": "inter",
                              "sourceFileName": "inter.csv",
                              "sourceRowNumber": 2,
                              "sourceHash": "existing-hash"
                            }
                          ]
                        }
                        """.formatted(DEMO_ACCOUNT_ID, SALARY_CATEGORY_ID))
                .when().post("/api/imports/commit")
                .then()
                .statusCode(200)
                .body("requestedCount", equalTo(1))
                .body("createdCount", equalTo(0))
                .body("skippedDuplicateCount", equalTo(1));
    }

    @Test
    void rejectsNegativeAmountWithIncomeCategory() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactions": [
                            {
                              "transactionDate": "2026-09-06",
                              "description": "Mercado",
                              "amount": -45.90,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "sourceHash": "bad-category"
                            }
                          ]
                        }
                        """.formatted(DEMO_ACCOUNT_ID, SALARY_CATEGORY_ID))
                .when().post("/api/imports/commit")
                .then()
                .statusCode(400)
                .body("message", equalTo("transactions[0].categoryId must reference an expense category for negative amounts."));
    }

    @Test
    void rollsBackWholeBatchWhenAnyRowIsInvalid() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactions": [
                            {
                              "transactionDate": "2026-09-05",
                              "description": "Pix recebido",
                              "amount": 100.00,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "sourceHash": "valid-hash"
                            },
                            {
                              "transactionDate": "2026-09-06",
                              "description": "",
                              "amount": -45.90,
                              "accountId": "%s",
                              "categoryId": "%s",
                              "sourceHash": "invalid-hash"
                            }
                          ]
                        }
                        """.formatted(DEMO_ACCOUNT_ID, SALARY_CATEGORY_ID, DEMO_ACCOUNT_ID, GROCERIES_CATEGORY_ID))
                .when().post("/api/imports/commit")
                .then()
                .statusCode(400)
                .body("message", equalTo("transactions[1].description is required."));

        given()
                .when().get("/api/transactions")
                .then()
                .statusCode(200)
                .body("size()", equalTo(0));
    }

    @Transactional
    void insertImportedTransaction(String sourceHash) {
        entityManager.createNativeQuery("""
                INSERT INTO transactions (
                    id,
                    transaction_date,
                    description,
                    amount,
                    account_id,
                    category_id,
                    source_hash
                )
                VALUES (
                    :id,
                    DATE '2026-09-01',
                    'Existing imported transaction',
                    100.0000,
                    :accountId,
                    :categoryId,
                    :sourceHash
                )
                """)
                .setParameter("id", UUID.fromString("44444444-4444-4444-4444-444444444444"))
                .setParameter("accountId", DEMO_ACCOUNT_ID)
                .setParameter("categoryId", SALARY_CATEGORY_ID)
                .setParameter("sourceHash", sourceHash)
                .executeUpdate();
    }
}
