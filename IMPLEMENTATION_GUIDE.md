# Implementation Guide: Workflow Improvements

## Overview
This guide provides step-by-step instructions to implement two critical features:
1. **Time-Based Ticket Escalation**: Automatically prompt for ticket creation after X minutes
2. **Conditional Feedback**: Only show feedback/survey for resolved chats

---

## Feature 1: Time-Based Ticket Escalation

### Implementation Steps

#### Step 1: Locate the Response Node
In your n8n workflow `chat workflow - FIXED.json`, find the node named **"Code in JavaScript7"** (around line 920).

This node currently builds the normal response when the query is in-domain.

#### Step 2: Replace the Code
Replace the existing `jsCode` content with the following enhanced version:

```javascript
// Extract values safely
const response = $('parse_control').item.json.ai_response || "";
const chat_id = $('insert into messages').first().json.chat_id || null;
const resolved = $('parse_control').item.json.resolved || "no";

// Get chat creation time from the chat record
const chatCreatedAt = new Date($('supabase select chat').first().json.created_at);
const now = new Date();
const durationMinutes = (now - chatCreatedAt) / (1000 * 60);

// Configuration: threshold in minutes (default 5)
const ESCALATION_THRESHOLD_MINUTES = 5;

// Check if we should append ticket prompt
const shouldPromptTicket = 
  durationMinutes > ESCALATION_THRESHOLD_MINUTES && 
  resolved !== "yes" &&
  !response.toLowerCase().includes("create a ticket"); // Don't duplicate if already mentioned

let finalResponse = response;

if (shouldPromptTicket) {
  finalResponse = response + "\n\nIt seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'.";
}

// Build final JSON
const data = {
  response: finalResponse,
  chat_id,
  duration_minutes: Math.round(durationMinutes * 10) / 10,
  escalation_prompted: shouldPromptTicket
};

// Return clean JSON object
return [
  {
    json: data
  }
];
```

#### Step 3: Test the Feature
1. Start a new chat
2. Ask a question
3. Wait for 5+ minutes
4. Ask another question
5. Verify that the response includes the ticket creation prompt

#### Step 4: Adjust Threshold (Optional)
To change the time threshold, modify the `ESCALATION_THRESHOLD_MINUTES` constant:
- For 3 minutes: `const ESCALATION_THRESHOLD_MINUTES = 3;`
- For 10 minutes: `const ESCALATION_THRESHOLD_MINUTES = 10;`

---

## Feature 2: Conditional Feedback (Skip if Not Resolved)

### Option A: Frontend Implementation (Recommended)

Modify your frontend code where the survey/feedback is triggered.

#### In `Chat.jsx` or `History.jsx`:

```javascript
const handleChatClose = async (chatId) => {
  // Get the last AI response to check if resolved
  const lastMessage = messages[messages.length - 1];
  
  // Only show survey if chat was marked as resolved
  const shouldShowSurvey = lastMessage?.resolved === "yes";
  
  // Close the chat
  await closeChatAPI(chatId);
  
  // Conditionally show survey
  if (shouldShowSurvey) {
    setShowSurveyModal(true);
  } else {
    // Just navigate away or show a simple "Chat closed" message
    navigate('/history');
  }
};
```

### Option B: Workflow Implementation

If you want to handle this in n8n:

#### Step 1: Add Resolution Check Before Survey Trigger

Create a new workflow or modify the existing survey workflow to include a check:

1. **Add IF Node**: "Check if Resolved"
   - Condition: `{{ $json.resolved }} == "yes"`
   - True path: Continue to survey
   - False path: Skip survey, just close chat

2. **Node Configuration**:
```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": false,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "leftValue": "={{ $json.resolved }}",
          "rightValue": "yes",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ]
    }
  },
  "type": "n8n-nodes-base.if",
  "name": "Check if Resolved"
}
```

### Option C: Database-Level Implementation

Add a `resolved` column to the `chats` table:

```sql
ALTER TABLE chats ADD COLUMN resolved BOOLEAN DEFAULT FALSE;
```

Then update the workflow to set this field when closing a chat:

```javascript
// In the "Update a row" node that closes the chat
{
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "status",
        "fieldValue": "closed"
      },
      {
        "fieldId": "resolved",
        "fieldValue": "={{ $('parse_control').item.json.resolved === 'yes' }}"
      }
    ]
  }
}
```

Then in your frontend or survey workflow, check:
```javascript
if (chat.status === 'closed' && chat.resolved === true) {
  // Show survey
}
```

---

## Testing Checklist

### Time-Based Escalation
- [ ] Chat duration calculated correctly
- [ ] Ticket prompt appears after 5 minutes
- [ ] Ticket prompt does NOT appear if resolved = "yes"
- [ ] Ticket prompt does NOT appear if response already mentions "create a ticket"
- [ ] Manual "create a ticket" command still works
- [ ] Prompt does NOT appear multiple times in same chat

### Conditional Feedback
- [ ] Feedback shown for resolved chats (resolved = "yes")
- [ ] Feedback skipped for unresolved chats (resolved = "no")
- [ ] Feedback skipped for out-of-domain queries
- [ ] Chat closes properly even when feedback is skipped

---

## Configuration Options

### Environment Variables (Optional)

Add to `.env`:
```env
# Time-based escalation
CHAT_ESCALATION_THRESHOLD_MINUTES=5
ENABLE_TIME_BASED_ESCALATION=true

# Feedback settings
ENABLE_FEEDBACK_FOR_UNRESOLVED=false
FEEDBACK_ONLY_FOR_RESOLVED=true
```

### Workflow Variables

In n8n, you can create workflow variables:
- `escalation_threshold`: Number (default: 5)
- `require_resolved_for_feedback`: Boolean (default: true)

---

## Troubleshooting

### Issue: Ticket prompt appears too early
**Solution**: Increase `ESCALATION_THRESHOLD_MINUTES`

### Issue: Ticket prompt appears even when resolved
**Solution**: Check that `parse_control` node is correctly extracting the `resolved` field

### Issue: Feedback still showing for unresolved chats
**Solution**: Verify the conditional check is in place before the survey trigger

### Issue: Chat creation time not found
**Solution**: Ensure `supabase select chat` node is executed and returns `created_at` field

---

## Manual Import Instructions

If you prefer to manually edit the JSON:

1. Open `chat workflow - FIXED.json` in a text editor
2. Find the node with `"name": "Code in JavaScript7"`
3. Replace the `jsCode` parameter with the code from Step 2 above
4. Save the file
5. Import into n8n
6. Test thoroughly

---

## Next Steps

1. Implement Feature 1 (Time-Based Escalation)
2. Test with various time scenarios
3. Implement Feature 2 (Conditional Feedback)
4. Test the complete flow
5. Monitor user feedback and adjust thresholds as needed

---

## Support

If you encounter issues:
1. Check n8n execution logs for errors
2. Verify all node references are correct
3. Test each feature independently
4. Review the console logs in your frontend

