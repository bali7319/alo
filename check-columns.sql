-- Kolonları kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Listing' 
AND column_name IN ('moderatorId', 'moderatedAt', 'moderatorNotes');

