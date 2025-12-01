# Diagnostic Steps for Vector Store Access Issues

## Step 1: Check if Documents Exist

Run this in Supabase SQL Editor:
```sql
SELECT COUNT(*) as total_documents FROM public.documents;
```

**Expected:** Should return a number > 0

## Step 2: Check if Documents Have Embeddings

```sql
SELECT 
    COUNT(*) as total,
    COUNT(embedding) as with_embeddings
FROM public.documents;
```

**Expected:** `with_embeddings` should equal `total` (all documents should have embeddings)

## Step 3: Check RLS Policies

```sql
SELECT * FROM pg_policies WHERE tablename = 'documents';
```

**If RLS is enabled**, you need to allow service role access:
```sql
-- Allow service role to read documents
CREATE POLICY "Allow service role read access" 
ON public.documents
FOR SELECT
TO service_role
USING (true);
```

## Step 4: Verify Supabase Credentials in N8N

1. Go to N8N credentials
2. Check "Supabase account 2" credentials
3. Verify:
   - Supabase URL is correct
   - API Key has proper permissions (should use service_role key for RLS bypass)

## Step 5: Test Vector Search Manually

```sql
-- Test if vector search works
SELECT 
    id,
    LEFT(content, 50) as content_preview,
    embedding IS NOT NULL as has_embedding
FROM documents
WHERE embedding IS NOT NULL
LIMIT 5;
```

## Step 6: Check N8N Execution Logs

1. Run the workflow
2. Check the execution logs for the "Supabase Vector Store" node
3. Look for errors like:
   - "No documents found"
   - "Permission denied"
   - "Table not found"
   - "Embedding column not found"

## Step 7: Verify Document Ingestion Workflow

Ensure your document ingestion workflow:
1. Downloads documents from Google Drive
2. Extracts text
3. Generates embeddings (using same model as Vector Store)
4. Stores in `documents` table with:
   - `content` (text)
   - `embedding` (vector)
   - `metadata` (optional JSON)

## Common Issues

### Issue 1: No Documents
**Solution:** Run your document ingestion workflow to populate the database

### Issue 2: Documents Without Embeddings
**Solution:** Re-run the ingestion workflow to generate embeddings

### Issue 3: RLS Blocking Access
**Solution:** Create a policy allowing service_role to read documents

### Issue 4: Wrong Embedding Model
**Solution:** Ensure the same embedding model is used for:
- Document ingestion (when storing)
- Vector Store retrieval (when querying)

### Issue 5: Wrong Column Names
**Solution:** Verify the Vector Store node is configured with:
- Table: `documents`
- Embedding column: `embedding` (default)
- Content column: `content` (default)

