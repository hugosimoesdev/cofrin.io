package io.cofrin.finance.interfaces;

import java.math.BigDecimal;

public record AccountRequest(
        String name,
        String type,
        BigDecimal initialBalance
) {
}
