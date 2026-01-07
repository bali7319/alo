SELECT id, name, substr(phone, 1, 80) as phone_preview FROM User WHERE phone IS NOT NULL AND phone != '' LIMIT 5;

