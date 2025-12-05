# Workflow Flow Diagrams

## Feature 1: Time-Based Escalation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Sends Message                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Insert Message into Database                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI Processes Query                           │
│            (Retrieves from Vector Store)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Parse Control Block                             │
│         Extract: domain, confidence, resolved                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          ⭐ NEW: Calculate Chat Duration                     │
│                                                               │
│  chatCreatedAt = chat.created_at                             │
│  now = current time                                          │
│  durationMinutes = (now - chatCreatedAt) / 60000            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│     ⭐ NEW: Check Escalation Conditions                      │
│                                                               │
│  IF (durationMinutes > 5 AND                                 │
│      resolved !== "yes" AND                                  │
│      !response.includes("create a ticket"))                  │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
         TRUE  │                      │  FALSE
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  Append Ticket Prompt    │  │  Use Original Response   │
│                          │  │                          │
│  response + "\n\n..."    │  │  response (unchanged)    │
└──────────────┬───────────┘  └──────────┬───────────────┘
               │                         │
               └─────────┬───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Return Response to User                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 2: Conditional Feedback Flow

### Current Flow (Without Fix)
```
┌─────────────────────────────────────────────────────────────┐
│                  User Closes Chat                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Update Chat Status to "closed"                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          ❌ ALWAYS Show Survey Modal                         │
│         (Even for unresolved queries!)                       │
└─────────────────────────────────────────────────────────────┘
```

### New Flow (With Fix)
```
┌─────────────────────────────────────────────────────────────┐
│                  User Closes Chat                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│       ⭐ NEW: Check Last AI Response                         │
│                                                               │
│  Parse control block from last AI message                    │
│  Extract: resolved = "yes" or "no"                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Update Chat Status to "closed"                    │
│       ⭐ NEW: Also save resolved status                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│       ⭐ NEW: Check if Resolved                              │
│                                                               │
│  IF (resolved === "yes")                                     │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
         TRUE  │                      │  FALSE
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  ✅ Show Survey Modal    │  │  ⏭️  Skip Survey         │
│                          │  │                          │
│  Ask for feedback        │  │  Navigate to history     │
│  and rating              │  │  or show simple message  │
└──────────────────────────┘  └──────────────────────────┘
```

---

## Complete User Journey

### Scenario 1: Quick Resolution (< 5 minutes)
```
1. User: "What is KB?"
   ↓
2. AI: "KB stands for Knowledge Base..." 
   [resolved: yes, confidence: 0.9]
   ↓
3. User closes chat
   ↓
4. ✅ Survey shown (because resolved)
```

### Scenario 2: Long Unresolved Chat (> 5 minutes)
```
1. User: "How do I configure X?"
   ↓
2. AI: "I don't have that info..." 
   [resolved: no, confidence: 0.2]
   ↓
3. [5 minutes pass]
   ↓
4. User: "Can you help with Y?"
   ↓
5. AI: "Here's what I found... 
   
   ⭐ It seems this is taking longer than expected. 
   Would you like me to create a ticket?"
   [resolved: no, confidence: 0.3]
   ↓
6. User closes chat
   ↓
7. ⏭️  Survey skipped (because not resolved)
```

### Scenario 3: Manual Ticket Creation
```
1. User: "This isn't working"
   ↓
2. AI: "Let me help..." 
   [resolved: no, confidence: 0.4]
   ↓
3. User: "create a ticket"
   ↓
4. Workflow creates ticket
   ↓
5. Chat closed automatically
   ↓
6. ⏭️  Survey skipped (ticket created, not resolved by AI)
```

### Scenario 4: Resolved After Long Chat
```
1. User: "I need help with Z"
   ↓
2. AI: "Here's some info..." 
   [resolved: no, confidence: 0.5]
   ↓
3. [6 minutes pass]
   ↓
4. User: "Thanks, that worked!"
   ↓
5. AI: "Great! Is your query resolved?"
   [resolved: yes, confidence: 0.9]
   ↓
6. User closes chat
   ↓
7. ✅ Survey shown (because resolved)
```

---

## Decision Tree

```
                    ┌─────────────────┐
                    │  Message Sent   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AI Processes   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │  In-Domain   │          │ Out-Domain   │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │ Duration > 5?│          │ Create Ticket│
        └──────┬───────┘          │   Workflow   │
               │                  └──────────────┘
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ Resolved?    │  │ Normal       │
└──────┬───────┘  │ Response     │
       │          └──────────────┘
  ┌────┴────┐
  │         │
 YES       NO
  │         │
  ▼         ▼
┌────┐  ┌──────────────┐
│Skip│  │ Add Ticket   │
│    │  │ Prompt       │
└────┘  └──────────────┘
```

---

## Key Decision Points

### Time-Based Escalation
| Condition | Duration | Resolved | Action |
|-----------|----------|----------|--------|
| 1 | < 5 min | yes | Normal response |
| 2 | < 5 min | no | Normal response |
| 3 | > 5 min | yes | Normal response |
| 4 | > 5 min | no | ⭐ Add ticket prompt |

### Feedback Display
| Chat Status | Resolved | Show Survey? |
|-------------|----------|--------------|
| active | - | ❌ No |
| closed | yes | ✅ Yes |
| closed | no | ❌ No |
| closed | (ticket created) | ❌ No |

---

## Implementation Checklist

### Phase 1: Time-Based Escalation
- [ ] Copy code to n8n node
- [ ] Test with 5+ minute chat
- [ ] Verify prompt appears
- [ ] Verify prompt doesn't duplicate
- [ ] Verify resolved chats skip prompt

### Phase 2: Conditional Feedback
- [ ] Choose implementation option (A, B, or C)
- [ ] Add conditional check
- [ ] Test with resolved chat
- [ ] Test with unresolved chat
- [ ] Verify survey only shows when appropriate

### Phase 3: Integration Testing
- [ ] Test complete user journey
- [ ] Verify both features work together
- [ ] Check edge cases
- [ ] Monitor for any errors

