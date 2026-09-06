package io.cofrin.finance.interfaces;

import io.cofrin.finance.domain.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        LocalDate transactionDate,
        String description,
        BigDecimal amount,
        UUID accountId,
        UUID categoryId,
        String notes
) {

    public static TransactionResponse fromDomain(Transaction transaction) {
        return new TransactionResponse(
                transaction.id(),
                transaction.transactionDate(),
                transaction.description(),
                transaction.amount(),
                transaction.accountId(),
                transaction.categoryId(),
                transaction.notes()
        );
    }
}
