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
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
class TransactionResourceTest {

    private static final UUID DEMO_ACCOUNT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID SALARY_CATEGORY_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID GROCERIES_CATEGORY_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private static final UUID SEEDED_TRANSACTION_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID UNKNOWN_ID = UUID.fromString("99999999-9999-9999-9999-999999999999");

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

        entityManager.createNativeQuery("""
                INSERT INTO transactions (id, transaction_date, description, amount, account_id, category_id, notes)
                VALUES
                    (
                        :salaryTransactionId,
                        DATE '2026-01-05',
                        'January salary',
                        5000.0000,
                        :accountId,
                        :salaryCategoryId,
                        'Demo income transaction'
                    ),
                    (
                        :groceriesTransactionId,
                        DATE '2026-01-06',
                        'Weekly groceries',
                        -125.4500,
                        :accountId,
                        :groceriesCategoryId,
                        'Demo expense transaction'
                    )
                """)
                .setParameter("salaryTransactionId", SEEDED_TRANSACTION_ID)
                .setParameter("groceriesTransactionId", UUID.fromString("55555555-5555-5555-5555-555555555555"))
                .setParameter("accountId", DEMO_ACCOUNT_ID)
                .setParameter("salaryCategoryId", SALARY_CATEGORY_ID)
                .setParameter("groceriesCategoryId", GROCERIES_CATEGORY_ID)
                .executeUpdate();
    }

    @Test
    void listsSeededTransactions() {
        given()
                .when().get("/api/transactions")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(2))
                .body("find { it.id == '" + SEEDED_TRANSACTION_ID + "' }.description", equalTo("January salary"))
                .body("find { it.id == '55555555-5555-5555-5555-555555555555' }.description", equalTo("Weekly groceries"));
    }

    @Test
    void getsTransactionById() {
        given()
                .when().get("/api/transactions/{id}", SEEDED_TRANSACTION_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(SEEDED_TRANSACTION_ID.toString()))
                .body("transactionDate", equalTo("2026-01-05"))
                .body("description", equalTo("January salary"))
                .body("accountId", equalTo(DEMO_ACCOUNT_ID.toString()))
                .body("categoryId", equalTo(SALARY_CATEGORY_ID.toString()));
    }

    @Test
    void returnsNotFoundForMissingTransaction() {
        given()
                .when().get("/api/transactions/{id}", UNKNOWN_ID)
                .then()
                .statusCode(404)
                .body("message", containsString("Transaction not found"));
    }

    @Test
    void createsTransaction() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-02-01",
                          "description": "Freelance payment",
                          "amount": 875.1234,
                          "accountId": "%s",
                          "categoryId": "%s",
                          "notes": "Paid by PIX"
                        }
                        """.formatted(DEMO_ACCOUNT_ID, SALARY_CATEGORY_ID))
                .when().post("/api/transactions")
                .then()
                .statusCode(201)
                .header("Location", containsString("/api/transactions/"))
                .body("id", notNullValue())
                .body("transactionDate", equalTo("2026-02-01"))
                .body("description", equalTo("Freelance payment"))
                .body("amount", equalTo(875.1234F))
                .body("accountId", equalTo(DEMO_ACCOUNT_ID.toString()))
                .body("categoryId", equalTo(SALARY_CATEGORY_ID.toString()))
                .body("notes", equalTo("Paid by PIX"));
    }

    @Test
    void rejectsCreateWithoutCategoryId() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-02-01",
                          "description": "Missing category",
                          "amount": 10.0000,
                          "accountId": "%s"
                        }
                        """.formatted(DEMO_ACCOUNT_ID))
                .when().post("/api/transactions")
                .then()
                .statusCode(400)
                .body("message", equalTo("categoryId is required."));
    }

    @Test
    void rejectsCreateWithUnknownAccount() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-02-01",
                          "description": "Unknown account",
                          "amount": 10.0000,
                          "accountId": "%s",
                          "categoryId": "%s"
                        }
                        """.formatted(UNKNOWN_ID, SALARY_CATEGORY_ID))
                .when().post("/api/transactions")
                .then()
                .statusCode(400)
                .body("message", equalTo("accountId does not reference an existing account."));
    }

    @Test
    void rejectsCreateWithUnknownCategory() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-02-01",
                          "description": "Unknown category",
                          "amount": 10.0000,
                          "accountId": "%s",
                          "categoryId": "%s"
                        }
                        """.formatted(DEMO_ACCOUNT_ID, UNKNOWN_ID))
                .when().post("/api/transactions")
                .then()
                .statusCode(400)
                .body("message", equalTo("categoryId does not reference an existing category."));
    }

    @Test
    void updatesTransaction() {
        String id = createTransaction();

        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-03-02",
                          "description": "Updated groceries",
                          "amount": -45.9000,
                          "accountId": "%s",
                          "categoryId": "%s",
                          "notes": "Updated note"
                        }
                        """.formatted(DEMO_ACCOUNT_ID, GROCERIES_CATEGORY_ID))
                .when().put("/api/transactions/{id}", id)
                .then()
                .statusCode(200)
                .body("id", equalTo(id))
                .body("transactionDate", equalTo("2026-03-02"))
                .body("description", equalTo("Updated groceries"))
                .body("amount", equalTo(-45.9F))
                .body("categoryId", equalTo(GROCERIES_CATEGORY_ID.toString()))
                .body("notes", equalTo("Updated note"));
    }

    @Test
    void deletesTransaction() {
        String id = createTransaction();

        given()
                .when().delete("/api/transactions/{id}", id)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/transactions/{id}", id)
                .then()
                .statusCode(404);
    }

    private String createTransaction() {
        return given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "transactionDate": "2026-03-01",
                          "description": "Temporary transaction",
                          "amount": -20.0000,
                          "accountId": "%s",
                          "categoryId": "%s",
                          "notes": "Temporary"
                        }
                        """.formatted(DEMO_ACCOUNT_ID, GROCERIES_CATEGORY_ID))
                .when().post("/api/transactions")
                .then()
                .statusCode(201)
                .extract()
                .path("id");
    }
}
