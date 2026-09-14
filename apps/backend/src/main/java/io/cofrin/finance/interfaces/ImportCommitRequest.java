package io.cofrin.finance.interfaces;

import java.util.List;

public record ImportCommitRequest(
        List<ImportCommitItemRequest> transactions
) {
}
