package io.cofrin.finance.infrastructure;

import io.cofrin.finance.application.TransactionRepository;
import io.cofrin.finance.domain.Transaction;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TransactionPanacheRepository implements PanacheRepositoryBase<TransactionEntity, UUID>, TransactionRepository {

    @Override
    public List<Transaction> listAllOrderedByTransactionDateDesc() {
        return list("ORDER BY transactionDate DESC, id DESC").stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Transaction> findTransactionById(UUID id) {
        return Optional.ofNullable(findByIdOptional(id).orElse(null))
                .map(this::toDomain);
    }

    @Override
    public boolean existsBySourceHash(String sourceHash) {
        if (sourceHash == null || sourceHash.isBlank()) {
            return false;
        }

        return count("sourceHash", sourceHash) > 0;
    }

    @Override
    @Transactional
    public Transaction create(Transaction transaction) {
        TransactionEntity entity = new TransactionEntity();
        copyToEntity(transaction, entity);
        persist(entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public Transaction update(Transaction transaction) {
        TransactionEntity entity = findByIdOptional(transaction.id())
                .orElseThrow(() -> new IllegalStateException("Transaction should exist before update."));
        copyToEntity(transaction, entity);

        return toDomain(entity);
    }

    @Override
    @Transactional
    public boolean deleteTransactionById(UUID id) {
        return deleteById(id);
    }

    private void copyToEntity(Transaction transaction, TransactionEntity entity) {
        entity.id = transaction.id();
        entity.transactionDate = transaction.transactionDate();
        entity.description = transaction.description();
        entity.amount = transaction.amount();
        entity.account = getEntityManager().getReference(AccountEntity.class, transaction.accountId());
        entity.category = getEntityManager().getReference(CategoryEntity.class, transaction.categoryId());
        entity.notes = transaction.notes();
        entity.sourceType = transaction.sourceType();
        entity.institution = transaction.institution();
        entity.sourceFileName = transaction.sourceFileName();
        entity.sourceRowNumber = transaction.sourceRowNumber();
        entity.sourceHash = transaction.sourceHash();
    }

    private Transaction toDomain(TransactionEntity entity) {
        return new Transaction(
                entity.id,
                entity.transactionDate,
                entity.description,
                entity.amount,
                entity.account.id,
                entity.category.id,
                entity.notes,
                entity.sourceType,
                entity.institution,
                entity.sourceFileName,
                entity.sourceRowNumber,
                entity.sourceHash
        );
    }
}
