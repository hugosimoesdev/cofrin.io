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

@QuarkusTest
class AccountResourceTest {

    private static final UUID WALLET_ACCOUNT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID BANK_ACCOUNT_ID = UUID.fromString("66666666-6666-6666-6666-666666666666");
    private static final UUID SALARY_CATEGORY_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
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
                VALUES
                    (:bankId, 'Bank Account', 'checking', 1000.0000),
                    (:walletId, 'Wallet', 'cash', 250.0000)
                """)
                .setParameter("bankId", BANK_ACCOUNT_ID)
                .setParameter("walletId", WALLET_ACCOUNT_ID)
                .executeUpdate();

        entityManager.createNativeQuery("""
                INSERT INTO categories (id, name, type)
                VALUES (:categoryId, 'Salary', 'income')
                """)
                .setParameter("categoryId", SALARY_CATEGORY_ID)
                .executeUpdate();

        entityManager.createNativeQuery("""
                INSERT INTO transactions (id, transaction_date, description, amount, account_id, category_id, notes)
                VALUES (
                    :transactionId,
                    DATE '2026-01-05',
                    'January salary',
                    5000.0000,
                    :accountId,
                    :categoryId,
                    'Demo income transaction'
                )
                """)
                .setParameter("transactionId", SEEDED_TRANSACTION_ID)
                .setParameter("accountId", WALLET_ACCOUNT_ID)
                .setParameter("categoryId", SALARY_CATEGORY_ID)
                .executeUpdate();
    }

    @Test
    void listsAccountsOrderedByName() {
        given()
                .when().get("/api/accounts")
                .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("[0].name", equalTo("Bank Account"))
                .body("[1].name", equalTo("Wallet"));
    }

    @Test
    void getsAccountById() {
        given()
                .when().get("/api/accounts/{id}", WALLET_ACCOUNT_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(WALLET_ACCOUNT_ID.toString()))
                .body("name", equalTo("Wallet"))
                .body("type", equalTo("cash"))
                .body("initialBalance", equalTo(250.0000F));
    }

    @Test
    void returnsNotFoundForMissingAccount() {
        given()
                .when().get("/api/accounts/{id}", UNKNOWN_ID)
                .then()
                .statusCode(404)
                .body("message", containsString("Account not found"));
    }

    @Test
    void createsAccount() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "PIX",
                          "type": "pix",
                          "initialBalance": 50.1234
                        }
                        """)
                .when().post("/api/accounts")
                .then()
                .statusCode(201)
                .header("Location", containsString("/api/accounts/"))
                .body("id", notNullValue())
                .body("name", equalTo("PIX"))
                .body("type", equalTo("pix"))
                .body("initialBalance", equalTo(50.1234F));
    }

    @Test
    void rejectsCreateWithBlankName() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": " ",
                          "type": "cash",
                          "initialBalance": 0.0000
                        }
                        """)
                .when().post("/api/accounts")
                .then()
                .statusCode(400)
                .body("message", equalTo("name is required."));
    }

    @Test
    void rejectsCreateWithBlankType() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "Wallet",
                          "type": " ",
                          "initialBalance": 0.0000
                        }
                        """)
                .when().post("/api/accounts")
                .then()
                .statusCode(400)
                .body("message", equalTo("type is required."));
    }

    @Test
    void rejectsCreateWithoutInitialBalance() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "Wallet",
                          "type": "cash"
                        }
                        """)
                .when().post("/api/accounts")
                .then()
                .statusCode(400)
                .body("message", equalTo("initialBalance is required."));
    }

    @Test
    void updatesAccount() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "Main Wallet",
                          "type": "cash",
                          "initialBalance": 300.0000
                        }
                        """)
                .when().put("/api/accounts/{id}", WALLET_ACCOUNT_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(WALLET_ACCOUNT_ID.toString()))
                .body("name", equalTo("Main Wallet"))
                .body("type", equalTo("cash"))
                .body("initialBalance", equalTo(300.0000F));
    }

    @Test
    void deletesAccount() {
        given()
                .when().delete("/api/accounts/{id}", BANK_ACCOUNT_ID)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/accounts/{id}", BANK_ACCOUNT_ID)
                .then()
                .statusCode(404);
    }

    @Test
    void deletingAccountCascadesTransactions() {
        given()
                .when().delete("/api/accounts/{id}", WALLET_ACCOUNT_ID)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/transactions/{id}", SEEDED_TRANSACTION_ID)
                .then()
                .statusCode(404);
    }
}
