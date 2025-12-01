-- Check if documents exist in the documents table
-- Run this in Supabase SQL Editor

-- Step 1: Check total document count
SELECT COUNT(*) as total_documents
FROM public.documents;

-- Step 2: Check if documents have embeddings
SELECT 
    COUNT(*) as total_documents,
    COUNT(embedding) as documents_with_embeddings,
    COUNT(*) - COUNT(embedding) as documents_without_embeddings
FROM public.documents;

-- Step 3: View sample documents (if any)
SELECT 
    id,
    LEFT(content, 100) as content_preview,
    CASE 
        WHEN embedding IS NULL THEN 'No embedding'
        ELSE 'Has embedding'
    END as embedding_status,
    created_at
FROM public.documents
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- Step 5: Check RLS policies (if any)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'documents';

