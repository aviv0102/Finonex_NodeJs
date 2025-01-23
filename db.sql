CREATE TABLE users_revenue
(
    user_id VARCHAR(255) PRIMARY KEY,
    revenue DECIMAL(10, 2) NOT NULL
);

-- Add an index on the revenue column for faster queries
CREATE INDEX idx_revenue ON users_revenue (revenue);
