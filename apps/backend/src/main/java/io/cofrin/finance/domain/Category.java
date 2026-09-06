package io.cofrin.finance.domain;

import java.util.UUID;

public record Category(
        UUID id,
        String name,
        String type
) {
}
