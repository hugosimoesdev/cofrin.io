package io.cofrin.finance.application;

import java.math.BigDecimal;

public record CreateOrUpdateAccountCommand(
        String name,
        String type,
        BigDecimal initialBalance
) {
}
