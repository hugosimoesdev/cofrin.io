package io.cofrin.finance.domain;

import java.util.List;

public record ImportCommitResult(
        int requestedCount,
        int createdCount,
        int skippedDuplicateCount,
        List<Transaction> transactions
) {
}
