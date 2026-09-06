package io.cofrin.finance.domain;

public record PreviewTransaction(
        String transactionDate,
        String description,
        String amount,
        String rawDescription,
        String externalId,
        String sourceHash,
        int rowNumber,
        ImportRowStatus status
) {
}
