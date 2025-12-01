-- Script to fix orphaned chats (chats with user_id that doesn't exist)
-- Run this BEFORE running the migration if you have orphaned data

-- Step 1: Find orphaned chats
SELECT 
    c.id as chat_id,
    c.user_id,
    c.status,
    c.created_at,
    'ORPHANED - user does not exist' as issue
FROM public.chats c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Step 2: Option A - Delete orphaned chats (recommended if they're test data)
-- Uncomment the line below to delete orphaned chats
-- DELETE FROM public.chats WHERE user_id NOT IN (SELECT id FROM public.users);

-- Step 2: Option B - Close orphaned chats instead of deleting
-- UPDATE public.chats 
-- SET status = 'closed' 
-- WHERE user_id NOT IN (SELECT id FROM public.users);

-- Step 3: Verify no orphaned chats remain
SELECT 
    COUNT(*) as orphaned_chats_count
FROM public.chats c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- If count is 0, you're good to proceed with the migration!

