# Quick Visual Guide: Where to Add Time-Based Escalation

## Your Current Workflow Structure

```
┌─────────────────────────────────────────────────────────────┐
│  JWT Authenticated Webhook                                   │
│  (Receives user message)                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Select Chat                                        │
│  (Gets active chat, including created_at timestamp)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Check if Chat Exists                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Insert into Messages                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ⭐ AI Agent ⭐                                               │
│  👈 EDIT THIS NODE - Add escalation rule to system prompt   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Response to User                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Exact Text to Add to AI Agent System Prompt

**Location**: AI Agent node → Options → System Message → **At the very end**

**Add this text:**

```
═══════════════════════════════════════════════════════════
TIME-BASED ESCALATION RULE
═══════════════════════════════════════════════════════════

IMPORTANT: Before finalizing your response, apply this escalation logic:

1. Check if the chat has been active for more than 5 minutes
2. Check if your response shows resolved = "no"
3. Check if your response doesn't already mention "create a ticket"

If ALL three conditions are true, append this message BEFORE the ###CONTROL block:

"It seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'."

Example of correct formatting:

[Your normal response here]

It seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'.

###CONTROL:
{
  "domain": "in-domain",
  "confidence": 0.3,
  "resolved": "no"
}

═══════════════════════════════════════════════════════════
```

---

## Step-by-Step Screenshots Guide

### Step 1: Open Your Workflow
1. Go to n8n
2. Open "chat workflow" or "chat workflow - FIXED"

### Step 2: Find the AI Agent Node
Look for the node named **"AI Agent"** - it should be one of the first nodes after the webhook

### Step 3: Edit the Node
1. Click on the "AI Agent" node
2. You'll see the node editor panel open on the right

### Step 4: Find System Message
1. Scroll down in the node editor
2. Look for "Options" section
3. Find "System Message" field (it's a large text area)

### Step 5: Add the Escalation Rule
1. Scroll to the **very bottom** of the existing system message
2. Press Enter a few times to add some space
3. **Paste** the escalation rule text from above
4. Make sure it's at the end, after all other instructions

### Step 6: Save
1. Click "Execute Node" to test (optional)
2. Click the back arrow or "Save" button
3. Make sure the workflow is **Active**

---

## What the AI Will Do

### Before (Without Escalation):
```
User: "How do I configure X?"
AI: "I don't have that information in my knowledge base."

###CONTROL:
{
  "domain": "out-of-domain",
  "confidence": 0.1,
  "resolved": "no"
}
```

### After (With Escalation, if > 5 minutes):
```
User: "How do I configure X?"
AI: "I don't have that information in my knowledge base.

It seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'."

###CONTROL:
{
  "domain": "out-of-domain",
  "confidence": 0.1,
  "resolved": "no"
}
```

---

## Troubleshooting

### "I don't see the AI Agent node"
- Look for a node with type `@n8n/n8n-nodes-langchain.agent`
- It might be named differently, but it's the LangChain AI Agent node
- It should be connected to "Supabase Vector Store"

### "The escalation isn't working"
1. Check that you added the text to the **System Message** field
2. Make sure the workflow is **saved** and **active**
3. Test with a chat that's been active for > 5 minutes
4. Check the browser console for logs

### "How do I know if it's working?"
1. Start a chat
2. Ask a question that won't be resolved
3. **Wait 6 minutes** (set a timer!)
4. Ask another question
5. The response should include the escalation prompt

---

## Alternative: Let Me Know If You Can't Find It

If you can't find the AI Agent node or the System Message field:

1. Export your workflow as JSON
2. Send me a screenshot of your n8n workflow
3. Or describe what nodes you see

I can give you more specific instructions!

---

## Summary

✅ **Edit**: AI Agent node
✅ **Field**: System Message (at the bottom)
✅ **Add**: Escalation rule text
✅ **Save**: Workflow
✅ **Test**: Wait 6 minutes in a chat

**Time required**: 2 minutes
**Difficulty**: Easy ⭐
