package io.cofrin.finance.application;

import io.cofrin.finance.domain.Category;
import io.cofrin.finance.domain.ImportCommitResult;
import io.cofrin.finance.domain.Transaction;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class ImportCommitService {

    private static final String EXPENSE = "expense";
    private static final String INCOME = "income";

    private final TransactionRepository transactionRepository;
    private final AccountLookup accountLookup;
    private final CategoryLookup categoryLookup;

    public ImportCommitService(
            TransactionRepository transactionRepository,
            AccountLookup accountLookup,
            CategoryLookup categoryLookup
    ) {
        this.transactionRepository = transactionRepository;
        this.accountLookup = accountLookup;
        this.categoryLookup = categoryLookup;
    }

    @Transactional
    public ImportCommitResult commit(List<CommitImportTransactionCommand> commands) {
        validateCommands(commands);

        List<Transaction> createdTransactions = new ArrayList<>();
        int skippedDuplicateCount = 0;

        for (CommitImportTransactionCommand command : commands) {
            if (transactionRepository.existsBySourceHash(command.sourceHash())) {
                skippedDuplicateCount++;
                continue;
            }

            createdTransactions.add(transactionRepository.create(new Transaction(
                    UUID.randomUUID(),
                    command.transactionDate(),
                    command.description().trim(),
                    command.amount(),
                    command.accountId(),
                    command.categoryId(),
                    normalizeNotes(command.notes()),
                    normalizeOptional(command.sourceType()),
                    normalizeOptional(command.institution()),
                    normalizeOptional(command.sourceFileName()),
                    command.sourceRowNumber(),
                    normalizeRequired(command.sourceHash(), "sourceHash")
            )));
        }

        return new ImportCommitResult(
                commands.size(),
                createdTransactions.size(),
                skippedDuplicateCount,
                createdTransactions
        );
    }

    private void validateCommands(List<CommitImportTransactionCommand> commands) {
        if (commands == null || commands.isEmpty()) {
            throw new TransactionValidationException("At least one transaction is required.");
        }

        Set<String> sourceHashes = new HashSet<>();

        for (int index = 0; index < commands.size(); index++) {
            CommitImportTransactionCommand command = commands.get(index);
            String label = "transactions[" + index + "]";

            validateCommand(command, label);

            if (!sourceHashes.add(command.sourceHash())) {
                throw new TransactionValidationException(label + ".sourceHash duplicates another request item.");
            }
        }
    }

    private void validateCommand(CommitImportTransactionCommand command, String label) {
        if (command == null) {
            throw new TransactionValidationException(label + " is required.");
        }
        if (command.transactionDate() == null) {
            throw new TransactionValidationException(label + ".transactionDate is required.");
        }
        if (command.description() == null || command.description().isBlank()) {
            throw new TransactionValidationException(label + ".description is required.");
        }
        if (command.amount() == null) {
            throw new TransactionValidationException(label + ".amount is required.");
        }
        if (BigDecimal.ZERO.compareTo(command.amount()) == 0) {
            throw new TransactionValidationException(label + ".amount must not be zero.");
        }
        if (command.accountId() == null) {
            throw new TransactionValidationException(label + ".accountId is required.");
        }
        if (!accountLookup.existsById(command.accountId())) {
            throw new TransactionValidationException(label + ".accountId does not reference an existing account.");
        }
        if (command.categoryId() == null) {
            throw new TransactionValidationException(label + ".categoryId is required.");
        }
        Category category = categoryLookup.findCategoryById(command.categoryId())
                .orElseThrow(() -> new TransactionValidationException(label + ".categoryId does not reference an existing category."));

        validateCategoryType(command.amount(), category, label);
        normalizeRequired(command.sourceHash(), label + ".sourceHash");
    }

    private void validateCategoryType(BigDecimal amount, Category category, String label) {
        if (amount.signum() < 0 && !EXPENSE.equals(category.type())) {
            throw new TransactionValidationException(label + ".categoryId must reference an expense category for negative amounts.");
        }
        if (amount.signum() > 0 && !INCOME.equals(category.type())) {
            throw new TransactionValidationException(label + ".categoryId must reference an income category for positive amounts.");
        }
    }

    private String normalizeNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }

        return notes.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizeRequired(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new TransactionValidationException(field + " is required.");
        }

        return value.trim();
    }
}
