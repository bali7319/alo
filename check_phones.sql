SELECT COUNT(*) as total_users, COUNT(phone) as users_with_phone, SUM(CASE WHEN phone LIKE '%:%' THEN 1 ELSE 0 END) as encrypted_count FROM User;

