package io.cofrin.finance.application;

import io.cofrin.finance.domain.Category;

import java.util.Optional;
import java.util.UUID;

public interface CategoryLookup {

    boolean existsById(UUID id);

    Optional<Category> findCategoryById(UUID id);
}
