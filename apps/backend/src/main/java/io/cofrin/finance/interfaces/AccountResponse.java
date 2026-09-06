package io.cofrin.finance.interfaces;

import io.cofrin.finance.domain.Account;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        String type,
        BigDecimal initialBalance
) {

    public static AccountResponse fromDomain(Account account) {
        return new AccountResponse(
                account.id(),
                account.name(),
                account.type(),
                account.initialBalance()
        );
    }
}
