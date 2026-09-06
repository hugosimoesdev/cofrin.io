CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    initial_balance NUMERIC(19, 4) NOT NULL DEFAULT 0
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    account_id UUID NOT NULL,
    category_id UUID,
    notes TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_account_id_transaction_date ON transactions(account_id, transaction_date);
