SELECT id, name, email, phone FROM User WHERE phone IS NOT NULL AND phone != '' AND phone LIKE '%:%' LIMIT 5;

