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
class CategoryResourceTest {

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
                    (:groceriesId, 'Groceries', 'expense'),
                    (:salaryId, 'Salary', 'income')
                """)
                .setParameter("groceriesId", GROCERIES_CATEGORY_ID)
                .setParameter("salaryId", SALARY_CATEGORY_ID)
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
                .setParameter("accountId", DEMO_ACCOUNT_ID)
                .setParameter("categoryId", SALARY_CATEGORY_ID)
                .executeUpdate();
    }

    @Test
    void listsCategoriesOrderedByName() {
        given()
                .when().get("/api/categories")
                .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("[0].name", equalTo("Groceries"))
                .body("[1].name", equalTo("Salary"));
    }

    @Test
    void getsCategoryById() {
        given()
                .when().get("/api/categories/{id}", SALARY_CATEGORY_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(SALARY_CATEGORY_ID.toString()))
                .body("name", equalTo("Salary"))
                .body("type", equalTo("income"));
    }

    @Test
    void returnsNotFoundForMissingCategory() {
        given()
                .when().get("/api/categories/{id}", UNKNOWN_ID)
                .then()
                .statusCode(404)
                .body("message", containsString("Category not found"));
    }

    @Test
    void createsCategory() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "Transport",
                          "type": "expense"
                        }
                        """)
                .when().post("/api/categories")
                .then()
                .statusCode(201)
                .header("Location", containsString("/api/categories/"))
                .body("id", notNullValue())
                .body("name", equalTo("Transport"))
                .body("type", equalTo("expense"));
    }

    @Test
    void rejectsCreateWithBlankName() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": " ",
                          "type": "expense"
                        }
                        """)
                .when().post("/api/categories")
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
                          "name": "Transport",
                          "type": " "
                        }
                        """)
                .when().post("/api/categories")
                .then()
                .statusCode(400)
                .body("message", equalTo("type is required."));
    }

    @Test
    void updatesCategory() {
        given()
                .contentType(ContentType.JSON)
                .body("""
                        {
                          "name": "Food",
                          "type": "expense"
                        }
                        """)
                .when().put("/api/categories/{id}", GROCERIES_CATEGORY_ID)
                .then()
                .statusCode(200)
                .body("id", equalTo(GROCERIES_CATEGORY_ID.toString()))
                .body("name", equalTo("Food"))
                .body("type", equalTo("expense"));
    }

    @Test
    void deletesCategory() {
        given()
                .when().delete("/api/categories/{id}", GROCERIES_CATEGORY_ID)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/categories/{id}", GROCERIES_CATEGORY_ID)
                .then()
                .statusCode(404);
    }

    @Test
    void deletingCategoryCascadesTransactions() {
        given()
                .when().delete("/api/categories/{id}", SALARY_CATEGORY_ID)
                .then()
                .statusCode(204);

        given()
                .when().get("/api/transactions/{id}", SEEDED_TRANSACTION_ID)
                .then()
                .statusCode(404);
    }
}
