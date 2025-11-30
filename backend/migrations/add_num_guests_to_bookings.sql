-- Add num_guests field to bookings table
ALTER TABLE bookings ADD COLUMN num_guests INT DEFAULT 1;

-- Update existing records to have a default value
UPDATE bookings SET num_guests = 1 WHERE num_guests IS NULL;
