package io.cofrin.finance.domain;

import java.math.BigDecimal;
import java.util.UUID;

public record Account(
        UUID id,
        String name,
        String type,
        BigDecimal initialBalance
) {
}
