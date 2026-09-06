package io.cofrin.finance.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateOrUpdateTransactionCommand(
        LocalDate transactionDate,
        String description,
        BigDecimal amount,
        UUID accountId,
        UUID categoryId,
        String notes
) {
}
