package io.cofrin.finance.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record Transaction(
        UUID id,
        LocalDate transactionDate,
        String description,
        BigDecimal amount,
        UUID accountId,
        UUID categoryId,
        String notes
) {
}
