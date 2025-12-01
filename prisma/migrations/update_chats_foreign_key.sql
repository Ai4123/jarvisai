-- Migration: Update chats.user_id foreign key to reference public.users instead of auth.users
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraint (for debugging)
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
WHERE tc.table_name = 'chats' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Step 2: Check for orphaned chats (chats with user_id that doesn't exist in public.users)
-- This will show any data that needs to be cleaned up
SELECT 
    c.id as chat_id,
    c.user_id,
    c.status,
    c.created_at
FROM public.chats c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Step 3: Optionally delete orphaned chats (uncomment if you want to clean up)
-- DELETE FROM public.chats 
-- WHERE user_id NOT IN (SELECT id FROM public.users);

-- Step 4: Drop ALL foreign key constraints on chats.user_id (in case there are multiple)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'chats'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name IN (
              SELECT constraint_name
              FROM information_schema.key_column_usage
              WHERE table_schema = 'public'
                AND table_name = 'chats'
                AND column_name = 'user_id'
          )
    ) LOOP
        EXECUTE 'ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Step 5: Add new foreign key constraint pointing to public.users
ALTER TABLE public.chats 
ADD CONSTRAINT chats_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- Step 6: Verify the change
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
WHERE tc.table_name = 'chats' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Expected result:
-- foreign_table_schema should be 'public'
-- foreign_table_name should be 'users'
-- foreign_column_name should be 'id'
