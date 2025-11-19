-- Add room_type_id column to bookings table
ALTER TABLE bookings ADD COLUMN room_type_id INT NULL AFTER guest_id;

-- Make room_id nullable
ALTER TABLE bookings MODIFY COLUMN room_id INT NULL;

-- Add foreign key constraint for room_type_id
ALTER TABLE bookings 
ADD CONSTRAINT fk_bookings_room_type 
FOREIGN KEY (room_type_id) REFERENCES room_types(id) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Update existing bookings to set room_type_id based on their room's room_type_id
UPDATE bookings b
INNER JOIN rooms r ON b.room_id = r.id
SET b.room_type_id = r.room_type_id
WHERE b.room_id IS NOT NULL;
