package io.cofrin.finance.infrastructure;

import io.cofrin.finance.application.AccountLookup;
import io.cofrin.finance.application.AccountRepository;
import io.cofrin.finance.domain.Account;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class AccountPanacheRepository implements PanacheRepositoryBase<AccountEntity, UUID>, AccountLookup, AccountRepository {

    @Override
    public boolean existsById(UUID id) {
        return findByIdOptional(id).isPresent();
    }

    @Override
    public List<Account> listAllOrderedByNameAsc() {
        return list("ORDER BY name ASC, id ASC").stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Account> findAccountById(UUID id) {
        return findByIdOptional(id).map(this::toDomain);
    }

    @Override
    @Transactional
    public Account create(Account account) {
        AccountEntity entity = new AccountEntity();
        copyToEntity(account, entity);
        persist(entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public Account update(Account account) {
        AccountEntity entity = findByIdOptional(account.id())
                .orElseThrow(() -> new IllegalStateException("Account should exist before update."));
        copyToEntity(account, entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public boolean deleteAccountById(UUID id) {
        return deleteById(id);
    }

    private void copyToEntity(Account account, AccountEntity entity) {
        entity.id = account.id();
        entity.name = account.name();
        entity.type = account.type();
        entity.initialBalance = account.initialBalance();
    }

    private Account toDomain(AccountEntity entity) {
        return new Account(
                entity.id,
                entity.name,
                entity.type,
                entity.initialBalance
        );
    }
}
