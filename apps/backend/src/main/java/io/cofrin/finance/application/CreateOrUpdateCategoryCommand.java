package io.cofrin.finance.application;

public record CreateOrUpdateCategoryCommand(
        String name,
        String type
) {
}
