package io.cofrin.finance.infrastructure;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "categories")
public class CategoryEntity extends PanacheEntityBase {

    @Id
    public UUID id;

    @Column(nullable = false, length = 100)
    public String name;

    @Column(nullable = false, length = 20)
    public String type;
}
