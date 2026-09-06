package io.cofrin.finance.infrastructure;

import io.cofrin.finance.application.AccountLookup;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class AccountPanacheRepository implements PanacheRepositoryBase<AccountEntity, UUID>, AccountLookup {

    @Override
    public boolean existsById(UUID id) {
        return findByIdOptional(id).isPresent();
    }
}
