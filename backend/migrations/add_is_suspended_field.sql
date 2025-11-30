-- Add is_suspended field to guests table for account suspension functionality
-- Run this migration to enable guest account suspension feature

ALTER TABLE guests ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE;

-- Update existing records to ensure they have the default value
UPDATE guests SET is_suspended = FALSE WHERE is_suspended IS NULL;
