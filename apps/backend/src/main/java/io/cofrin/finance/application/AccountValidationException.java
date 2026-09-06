package io.cofrin.finance.application;

public class AccountValidationException extends RuntimeException {

    public AccountValidationException(String message) {
        super(message);
    }
}
