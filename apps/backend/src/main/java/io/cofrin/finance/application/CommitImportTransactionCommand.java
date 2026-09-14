package io.cofrin.finance.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CommitImportTransactionCommand(
        LocalDate transactionDate,
        String description,
        BigDecimal amount,
        UUID accountId,
        UUID categoryId,
        String notes,
        String sourceType,
        String institution,
        String sourceFileName,
        Integer sourceRowNumber,
        String sourceHash
) {
}
