package io.cofrin.finance.interfaces;

import io.cofrin.finance.domain.ImportCommitResult;

import java.util.List;

public record ImportCommitResponse(
        int requestedCount,
        int createdCount,
        int skippedDuplicateCount,
        List<TransactionResponse> transactions
) {

    public static ImportCommitResponse fromDomain(ImportCommitResult result) {
        return new ImportCommitResponse(
                result.requestedCount(),
                result.createdCount(),
                result.skippedDuplicateCount(),
                result.transactions().stream()
                        .map(TransactionResponse::fromDomain)
                        .toList()
        );
    }
}
