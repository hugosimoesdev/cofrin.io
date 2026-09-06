package io.cofrin.finance.application;

import io.cofrin.finance.domain.Category;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> listCategories() {
        return categoryRepository.listAllOrderedByNameAsc();
    }

    public Category getCategory(UUID id) {
        return categoryRepository.findCategoryById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    public Category createCategory(CreateOrUpdateCategoryCommand command) {
        validate(command);

        return categoryRepository.create(new Category(
                UUID.randomUUID(),
                command.name().trim(),
                command.type().trim()
        ));
    }

    public Category updateCategory(UUID id, CreateOrUpdateCategoryCommand command) {
        validate(command);

        if (categoryRepository.findCategoryById(id).isEmpty()) {
            throw new CategoryNotFoundException(id);
        }

        return categoryRepository.update(new Category(
                id,
                command.name().trim(),
                command.type().trim()
        ));
    }

    public void deleteCategory(UUID id) {
        if (!categoryRepository.deleteCategoryById(id)) {
            throw new CategoryNotFoundException(id);
        }
    }

    private void validate(CreateOrUpdateCategoryCommand command) {
        if (command == null) {
            throw new CategoryValidationException("Request body is required.");
        }
        if (command.name() == null || command.name().isBlank()) {
            throw new CategoryValidationException("name is required.");
        }
        if (command.type() == null || command.type().isBlank()) {
            throw new CategoryValidationException("type is required.");
        }
    }
}
