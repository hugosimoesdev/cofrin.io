package io.cofrin.finance.application;

import java.util.UUID;

public interface CategoryLookup {

    boolean existsById(UUID id);
}
