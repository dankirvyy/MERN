-- Migration: Add google_id column to guests table for Google OAuth
-- Run this SQL in your MySQL database

ALTER TABLE guests 
ADD COLUMN google_id VARCHAR(191) NULL UNIQUE AFTER password;

-- Also make password nullable for Google OAuth users
ALTER TABLE guests 
MODIFY COLUMN password VARCHAR(255) NULL;
