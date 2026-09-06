package io.cofrin.finance.application;

import io.cofrin.finance.domain.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository {

    List<Category> listAllOrderedByNameAsc();

    Optional<Category> findCategoryById(UUID id);

    Category create(Category category);

    Category update(Category category);

    boolean deleteCategoryById(UUID id);
}
