ALTER TABLE transactions
    ADD COLUMN source_type VARCHAR(30),
    ADD COLUMN institution VARCHAR(100),
    ADD COLUMN source_file_name VARCHAR(255),
    ADD COLUMN source_row_number INTEGER,
    ADD COLUMN source_hash VARCHAR(64);

CREATE UNIQUE INDEX ux_transactions_source_hash
    ON transactions(source_hash)
    WHERE source_hash IS NOT NULL;
