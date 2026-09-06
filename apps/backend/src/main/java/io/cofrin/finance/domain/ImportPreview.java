package io.cofrin.finance.domain;

import java.util.List;

public record ImportPreview(
        String fileName,
        String sourceType,
        String institution,
        int rowCount,
        int validCount,
        int warningCount,
        List<PreviewTransaction> transactions,
        List<ImportWarning> warnings
) {
}
