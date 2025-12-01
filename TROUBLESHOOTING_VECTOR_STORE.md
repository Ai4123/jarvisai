# Troubleshooting: AI Agent Not Accessing Documents

## Common Issues and Solutions

### 1. **No Documents in Database**

**Check:**
```sql
SELECT COUNT(*) FROM public.documents;
```

**Solution:**
- Ensure your document ingestion workflow is running
- Check if documents are being uploaded to the `documents` table
- Verify the Google Drive ingestion workflow is active

### 2. **Documents Missing Embeddings**

**Check:**
```sql
SELECT 
    COUNT(*) as total,
    COUNT(embedding) as with_embeddings
FROM public.documents;
```

**Solution:**
- Embeddings must be generated and stored in the `embedding` column
- Check your document ingestion workflow to ensure embeddings are being created
- The embedding column should be of type `vector`

### 3. **Row Level Security (RLS) Blocking Access**

**Check:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'documents';
```

**Solution:**
- If RLS is enabled, create a policy that allows the N8N service role to read documents:
```sql
-- Allow service role to read all documents
CREATE POLICY "Allow service role read access" 
ON public.documents
FOR SELECT
TO service_role
USING (true);
```

### 4. **Supabase Credentials Issues**

**Check:**
- Verify the Supabase credentials in N8N have proper permissions
- Ensure the credentials have access to the `documents` table
- Check if using the correct Supabase project

### 5. **Vector Store Node Configuration**

**Verify in N8N:**
- Table name is set to `documents`
- Embedding column name matches your schema (usually `embedding`)
- Supabase credentials are correctly configured
- The node is connected as an `ai_tool` to the AI Agent

### 6. **Embedding Model Mismatch**

**Issue:** If you're using different embedding models for:
- Document ingestion (when storing)
- Vector retrieval (when querying)

They must match! The embeddings must be generated with the same model.

**Check:**
- Document ingestion workflow uses: `Embeddings OpenAI` (or Cohere)
- Vector Store node uses: Same embedding model

### 7. **Table Schema Issues**

**Verify the documents table has:**
- `id` (UUID)
- `content` (text)
- `embedding` (vector type)
- `metadata` (JSON, optional)

**Check:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents';
```

### 8. **Test Vector Search Directly**

Test if vector search works in Supabase:

```sql
-- This should return results if documents exist
SELECT 
    id,
    content,
    embedding <-> (SELECT embedding FROM documents LIMIT 1) as distance
FROM documents
WHERE embedding IS NOT NULL
ORDER BY distance
LIMIT 5;
```

## Quick Diagnostic Steps

1. **Run the check-documents.sql script** to see if documents exist
2. **Check N8N execution logs** for the AI Agent node - look for errors
3. **Verify Supabase credentials** in N8N are working
4. **Test the Vector Store node** separately to see if it can retrieve documents
5. **Check if embeddings are being generated** during document ingestion

## Expected Workflow Behavior

When the AI Agent runs:
1. User message is received
2. Message is embedded using the embedding model
3. Vector Store searches for similar documents using the embedding
4. Top matching documents are retrieved
5. Documents are passed to the AI Agent as context
6. AI Agent generates response based on retrieved documents

If step 3-4 fail, the AI Agent won't have document context.

