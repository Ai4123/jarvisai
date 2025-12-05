# Workflow Improvements Implementation

## Feature 1: Time-Based Ticket Creation Prompt

### Objective
When the agent cannot resolve a query within X minutes, automatically ask: "Shall I create a ticket?"

### Implementation Strategy
1. **Add time tracking**: When a chat is created, store the `created_at` timestamp
2. **Calculate duration**: On each message, calculate time elapsed since chat creation
3. **Add conditional check**: If duration > X minutes AND query not resolved, append ticket prompt to response

### New Nodes Required
- **Calculate Chat Duration** (Code node): Calculate minutes elapsed since chat creation
- **Check Time Threshold** (IF node): Check if duration > threshold (e.g., 5 minutes)
- **Append Ticket Prompt** (Code node): Add "Shall I create a ticket?" to the AI response

### Configuration
- Default threshold: **5 minutes** (configurable)
- Only trigger if:
  - Chat duration > threshold
  - Query not marked as resolved
  - No ticket already created for this chat

---

## Feature 2: Skip Feedback if Not Resolved

### Objective
Do NOT ask for feedback if the chat status is not "resolved"

### Implementation Strategy
1. **Check resolution status**: Before showing feedback, check if `resolved = "yes"` from parse_control
2. **Conditional routing**: 
   - If resolved → Show feedback/survey
   - If not resolved → Skip feedback, just respond normally

### Modified Flow
Currently, the workflow doesn't have a feedback node in the main chat flow. This needs to be added to the frontend or as a separate workflow trigger.

### Where to Implement
Since feedback is typically collected when a chat is closed:
- **Option A**: Add to the chat close workflow (when status changes to "closed")
- **Option B**: Add conditional check in the Survey Response Workflow
- **Option C**: Add to frontend logic (check chat status before showing survey)

**Recommended**: Implement in both workflow AND frontend for redundancy.

---

## Database Schema Additions (Optional)

To better track time-based escalation, consider adding to `chats` table:
```sql
ALTER TABLE chats ADD COLUMN escalation_prompted BOOLEAN DEFAULT FALSE;
ALTER TABLE chats ADD COLUMN escalation_prompted_at TIMESTAMP;
```

This prevents asking multiple times in the same chat session.

---

## Implementation Steps

### Step 1: Add Time-Based Ticket Prompt to Chat Workflow

**Insert after "insert into messages" node:**

1. **Get Chat Creation Time** (Supabase node)
   - Query: Get chat by chat_id
   - Extract: created_at timestamp

2. **Calculate Duration** (Code node)
   ```javascript
   const chatCreatedAt = new Date($('Get Chat Details').item.json.created_at);
   const now = new Date();
   const durationMinutes = (now - chatCreatedAt) / (1000 * 60);
   
   return [{
     json: {
       ...json,
       duration_minutes: durationMinutes,
       threshold_exceeded: durationMinutes > 5 // 5 minutes threshold
     }
   }];
   ```

3. **Check Time + Resolution** (IF node)
   - Condition: `duration_minutes > 5 AND resolved != "yes"`
   - True path: Append ticket prompt
   - False path: Normal response

4. **Append Ticket Prompt** (Code node)
   ```javascript
   const response = $json.ai_response;
   const modifiedResponse = response + "\n\nIt seems this is taking longer than expected. Would you like me to create a ticket for human support?";
   
   return [{
     json: {
       ...$json,
       ai_response: modifiedResponse
     }
   }];
   ```

### Step 2: Add Resolution Check Before Feedback

**In the workflow that triggers feedback/survey:**

1. **Check Resolution Status** (IF node)
   - Get the `resolved` field from the last AI response
   - Condition: `resolved == "yes"`
   - True path: Show feedback/survey
   - False path: Skip feedback

2. **Alternative: Frontend Implementation**
   ```javascript
   // In Chat.jsx or wherever survey is triggered
   const shouldShowSurvey = (chat) => {
     // Only show survey if chat is closed AND was marked as resolved
     return chat.status === 'closed' && chat.resolved === true;
   };
   ```

---

## Testing Checklist

- [ ] Chat duration calculated correctly
- [ ] Ticket prompt appears after X minutes
- [ ] Ticket prompt does NOT appear if resolved
- [ ] Ticket prompt does NOT appear multiple times
- [ ] Feedback skipped for unresolved chats
- [ ] Feedback shown for resolved chats
- [ ] Manual "create a ticket" command still works

---

## Configuration Variables

Add to `.env`:
```
CHAT_ESCALATION_THRESHOLD_MINUTES=5
ENABLE_TIME_BASED_ESCALATION=true
ENABLE_FEEDBACK_FOR_UNRESOLVED=false
```
