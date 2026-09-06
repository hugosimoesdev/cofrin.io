package io.cofrin.finance.application;

import io.cofrin.finance.domain.Account;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> listAccounts() {
        return accountRepository.listAllOrderedByNameAsc();
    }

    public Account getAccount(UUID id) {
        return accountRepository.findAccountById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));
    }

    public Account createAccount(CreateOrUpdateAccountCommand command) {
        validate(command);

        return accountRepository.create(new Account(
                UUID.randomUUID(),
                command.name().trim(),
                command.type().trim(),
                command.initialBalance()
        ));
    }

    public Account updateAccount(UUID id, CreateOrUpdateAccountCommand command) {
        validate(command);

        if (accountRepository.findAccountById(id).isEmpty()) {
            throw new AccountNotFoundException(id);
        }

        return accountRepository.update(new Account(
                id,
                command.name().trim(),
                command.type().trim(),
                command.initialBalance()
        ));
    }

    public void deleteAccount(UUID id) {
        if (!accountRepository.deleteAccountById(id)) {
            throw new AccountNotFoundException(id);
        }
    }

    private void validate(CreateOrUpdateAccountCommand command) {
        if (command == null) {
            throw new AccountValidationException("Request body is required.");
        }
        if (command.name() == null || command.name().isBlank()) {
            throw new AccountValidationException("name is required.");
        }
        if (command.type() == null || command.type().isBlank()) {
            throw new AccountValidationException("type is required.");
        }
        if (command.initialBalance() == null) {
            throw new AccountValidationException("initialBalance is required.");
        }
    }
}
