package io.cofrin;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class GreetingResourceTest {

    @Test
    void returnsGreeting() {
        given()
                .when().get("/api/hello")
                .then()
                .statusCode(200)
                .body("message", is("Hello from Quarkus"));
    }
}
