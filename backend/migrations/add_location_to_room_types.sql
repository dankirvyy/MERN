-- Add location and coordinates to room_types table
ALTER TABLE room_types
ADD COLUMN location VARCHAR(255) DEFAULT NULL,
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL;

-- Example: Update some sample data with locations in Mindoro
-- UPDATE room_types SET location = 'White Beach, Puerto Galera', latitude = 13.5179, longitude = 120.9551 WHERE id = 1;
-- UPDATE room_types SET location = 'Sabang Beach, Puerto Galera', latitude = 13.5383, longitude = 120.9566 WHERE id = 2;
