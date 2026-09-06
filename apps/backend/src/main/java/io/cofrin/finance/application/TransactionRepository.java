package io.cofrin.finance.application;

import io.cofrin.finance.domain.Transaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository {

    List<Transaction> listAllOrderedByTransactionDateDesc();

    Optional<Transaction> findTransactionById(UUID id);

    Transaction create(Transaction transaction);

    Transaction update(Transaction transaction);

    boolean deleteTransactionById(UUID id);
}
