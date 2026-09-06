package io.cofrin.finance.application;

import io.cofrin.finance.domain.Account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository {

    List<Account> listAllOrderedByNameAsc();

    Optional<Account> findAccountById(UUID id);

    Account create(Account account);

    Account update(Account account);

    boolean deleteAccountById(UUID id);
}
