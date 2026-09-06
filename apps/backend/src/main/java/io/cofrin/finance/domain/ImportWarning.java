package io.cofrin.finance.domain;

public record ImportWarning(
        Integer rowNumber,
        String field,
        String code,
        String message
) {
}
