package io.cofrin.finance.infrastructure;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class AccountEntity extends PanacheEntityBase {

    @Id
    public UUID id;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(nullable = false, length = 30)
    public String type;

    @Column(name = "initial_balance", nullable = false, precision = 19, scale = 4)
    public BigDecimal initialBalance;
}
