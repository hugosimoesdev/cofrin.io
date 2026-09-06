package io.cofrin.finance.application;

import java.util.UUID;

public interface AccountLookup {

    boolean existsById(UUID id);
}
