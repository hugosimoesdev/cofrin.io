package io.cofrin.finance.infrastructure;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class TransactionEntity extends PanacheEntityBase {

    @Id
    public UUID id;

    @Column(name = "transaction_date", nullable = false)
    public LocalDate transactionDate;

    @Column(nullable = false, length = 255)
    public String description;

    @Column(nullable = false, precision = 19, scale = 4)
    public BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    public AccountEntity account;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    public CategoryEntity category;

    @Column
    public String notes;

    @Column(name = "source_type", length = 30)
    public String sourceType;

    @Column(length = 100)
    public String institution;

    @Column(name = "source_file_name", length = 255)
    public String sourceFileName;

    @Column(name = "source_row_number")
    public Integer sourceRowNumber;

    @Column(name = "source_hash", length = 64)
    public String sourceHash;
}
