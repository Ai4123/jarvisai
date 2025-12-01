-- Check current foreign key constraint on chats.user_id
-- Run this in Supabase SQL Editor to verify the current state

SELECT 
    tc.constraint_name, 
    tc.table_schema,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'chats' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Expected result after migration:
-- foreign_table_schema should be 'public'
-- foreign_table_name should be 'users'
-- foreign_column_name should be 'id'

