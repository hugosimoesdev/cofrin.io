INSERT INTO accounts (id, name, type, initial_balance)
VALUES ('11111111-1111-1111-1111-111111111111', 'Demo Wallet', 'cash', 250.0000);

INSERT INTO categories (id, name, type)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Salary', 'income'),
    ('33333333-3333-3333-3333-333333333333', 'Groceries', 'expense');

INSERT INTO transactions (id, transaction_date, description, amount, account_id, category_id, notes)
VALUES
    (
        '44444444-4444-4444-4444-444444444444',
        DATE '2026-01-05',
        'January salary',
        5000.0000,
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'Demo income transaction'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        DATE '2026-01-06',
        'Weekly groceries',
        -125.4500,
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'Demo expense transaction'
    );
