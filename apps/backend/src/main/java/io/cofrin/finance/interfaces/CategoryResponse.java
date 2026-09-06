package io.cofrin.finance.interfaces;

import io.cofrin.finance.domain.Category;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String type
) {

    public static CategoryResponse fromDomain(Category category) {
        return new CategoryResponse(
                category.id(),
                category.name(),
                category.type()
        );
    }
}
