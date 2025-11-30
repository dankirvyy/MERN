-- Rename total_quantity to quantity and keep available_quantity
-- Note: If columns already exist, drop them first
ALTER TABLE resources DROP COLUMN IF EXISTS total_quantity;

-- Make sure we have the right columns
-- quantity = total quantity owned
-- available_quantity = currently available (decrements when assigned)

-- Update existing resources
UPDATE resources SET quantity = available_quantity WHERE quantity != available_quantity;
