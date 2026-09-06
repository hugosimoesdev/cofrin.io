package io.cofrin.finance.infrastructure;

import io.cofrin.finance.application.CategoryLookup;
import io.cofrin.finance.application.CategoryRepository;
import io.cofrin.finance.domain.Category;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CategoryPanacheRepository implements PanacheRepositoryBase<CategoryEntity, UUID>, CategoryLookup, CategoryRepository {

    @Override
    public boolean existsById(UUID id) {
        return findByIdOptional(id).isPresent();
    }

    @Override
    public List<Category> listAllOrderedByNameAsc() {
        return list("ORDER BY name ASC, id ASC").stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Category> findCategoryById(UUID id) {
        return findByIdOptional(id).map(this::toDomain);
    }

    @Override
    @Transactional
    public Category create(Category category) {
        CategoryEntity entity = new CategoryEntity();
        copyToEntity(category, entity);
        persist(entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public Category update(Category category) {
        CategoryEntity entity = findByIdOptional(category.id())
                .orElseThrow(() -> new IllegalStateException("Category should exist before update."));
        copyToEntity(category, entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public boolean deleteCategoryById(UUID id) {
        return deleteById(id);
    }

    private void copyToEntity(Category category, CategoryEntity entity) {
        entity.id = category.id();
        entity.name = category.name();
        entity.type = category.type();
    }

    private Category toDomain(CategoryEntity entity) {
        return new Category(
                entity.id,
                entity.name,
                entity.type
        );
    }
}
