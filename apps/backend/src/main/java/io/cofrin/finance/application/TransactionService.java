package io.cofrin.finance.application;

import io.cofrin.finance.domain.Transaction;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountLookup accountLookup;
    private final CategoryLookup categoryLookup;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountLookup accountLookup,
            CategoryLookup categoryLookup
    ) {
        this.transactionRepository = transactionRepository;
        this.accountLookup = accountLookup;
        this.categoryLookup = categoryLookup;
    }

    public List<Transaction> listTransactions() {
        return transactionRepository.listAllOrderedByTransactionDateDesc();
    }

    public Transaction getTransaction(UUID id) {
        return transactionRepository.findTransactionById(id)
                .orElseThrow(() -> new TransactionNotFoundException(id));
    }

    public Transaction createTransaction(CreateOrUpdateTransactionCommand command) {
        validate(command);

        return transactionRepository.create(new Transaction(
                UUID.randomUUID(),
                command.transactionDate(),
                command.description().trim(),
                command.amount(),
                command.accountId(),
                command.categoryId(),
                normalizeNotes(command.notes())
        ));
    }

    public Transaction updateTransaction(UUID id, CreateOrUpdateTransactionCommand command) {
        validate(command);

        if (transactionRepository.findTransactionById(id).isEmpty()) {
            throw new TransactionNotFoundException(id);
        }

        return transactionRepository.update(new Transaction(
                id,
                command.transactionDate(),
                command.description().trim(),
                command.amount(),
                command.accountId(),
                command.categoryId(),
                normalizeNotes(command.notes())
        ));
    }

    public void deleteTransaction(UUID id) {
        if (!transactionRepository.deleteTransactionById(id)) {
            throw new TransactionNotFoundException(id);
        }
    }

    private void validate(CreateOrUpdateTransactionCommand command) {
        if (command == null) {
            throw new TransactionValidationException("Request body is required.");
        }
        if (command.transactionDate() == null) {
            throw new TransactionValidationException("transactionDate is required.");
        }
        if (command.description() == null || command.description().isBlank()) {
            throw new TransactionValidationException("description is required.");
        }
        if (command.amount() == null) {
            throw new TransactionValidationException("amount is required.");
        }
        if (command.accountId() == null) {
            throw new TransactionValidationException("accountId is required.");
        }
        if (command.categoryId() == null) {
            throw new TransactionValidationException("categoryId is required.");
        }
        if (!accountLookup.existsById(command.accountId())) {
            throw new TransactionValidationException("accountId does not reference an existing account.");
        }
        if (!categoryLookup.existsById(command.categoryId())) {
            throw new TransactionValidationException("categoryId does not reference an existing category.");
        }
    }

    private String normalizeNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }

        return notes.trim();
    }
}
