package io.cofrin.finance.infrastructure;

import io.cofrin.finance.application.CategoryLookup;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class CategoryPanacheRepository implements PanacheRepositoryBase<CategoryEntity, UUID>, CategoryLookup {

    @Override
    public boolean existsById(UUID id) {
        return findByIdOptional(id).isPresent();
    }
}
