# Complete Implementation: All Three Fixes

## Summary of Changes

1. ✅ **Satisfied/Close Chat** - Auto-close and show survey
2. ✅ **Escalation after 5 USER messages** - Not every query
3. ✅ **No survey if user clicked "Need Help"**

---

## Changes to Make in `src/pages/Chat.jsx`

### Change 1: Update State Variables (Line ~31)

**Find this:**
```javascript
const [aiMessageCount, setAiMessageCount] = useState(0);
```

**Replace with:**
```javascript
const [userMessageCount, setUserMessageCount] = useState(0); // Track USER messages
const [userWasSatisfied, setUserWasSatisfied] = useState(false); // Track satisfaction
```

---

### Change 2: Reset Counters in createNewChat (Line ~191)

**Find this:**
```javascript
setAiMessageCount(0);
```

**Replace with:**
```javascript
setUserMessageCount(0); // Reset user message count
setUserWasSatisfied(false); // Reset satisfaction flag
```

---

### Change 3: Update triggerChatClosed Function (Line ~290)

**Find this:**
```javascript
const triggerChatClosed = async () => {
  if (chatLocked) return;

  setChatLocked(true);

  // ⭐ NEW: Check if chat was resolved before showing survey
  let wasResolved = false;

  // Find the last AI message to check resolution status
  const lastAIMessage = messages
    .filter(m => m.role === 'assistant')
    .pop();

  if (lastAIMessage?.content) {
    // Try to parse the control block from the AI response
    const controlMatch = lastAIMessage.content.match(/###CONTROL:\s*({[\s\S]*?})/);
    if (controlMatch) {
      try {
        const control = JSON.parse(controlMatch[1]);
        wasResolved = control.resolved === "yes";
        console.log("📊 Chat resolution status:", wasResolved ? "RESOLVED" : "NOT RESOLVED");
      } catch (e) {
        console.error("Failed to parse control block:", e);
      }
    }
  }

  if (chatId) {
    await closeChat(chatId);
  }

  localStorage.removeItem("chat_id");
  setChatId(null);

  toast.success("Chat closed ✔");

  // ⭐ NEW: Only show survey if chat was resolved
  if (wasResolved) {
    console.log("✅ Showing survey for resolved chat");
    setTimeout(() => {
      setSurveyVisible(true);
    }, 2000);
  } else {
    console.log("⏭️  Skipping survey for unresolved chat");
    toast.info("Thank you! No feedback needed for unresolved queries.");
    setTimeout(() => {
      navigate("/history");
    }, 2000);
  }
};
```

**Replace with:**
```javascript
const triggerChatClosed = async (satisfiedFlag = false) => {
  if (chatLocked) return;

  setChatLocked(true);

  // ⭐ Check if chat was resolved OR user was satisfied
  let wasResolved = false;

  // Find the last AI message to check resolution status
  const lastAIMessage = messages
    .filter(m => m.role === 'assistant')
    .pop();

  if (lastAIMessage?.content) {
    // Try to parse the control block from the AI response
    const controlMatch = lastAIMessage.content.match(/###CONTROL:\s*({[\s\S]*?})/);
    if (controlMatch) {
      try {
        const control = JSON.parse(controlMatch[1]);
        wasResolved = control.resolved === "yes";
        console.log("📊 Chat resolution status:", wasResolved ? "RESOLVED" : "NOT RESOLVED");
      } catch (e) {
        console.error("Failed to parse control block:", e);
      }
    }
  }

  if (chatId) {
    await closeChat(chatId);
  }

  localStorage.removeItem("chat_id");
  setChatId(null);

  toast.success("Chat closed ✔");

  // ⭐ Show survey ONLY if resolved OR user clicked "Satisfied"
  const shouldShowSurvey = wasResolved || satisfiedFlag || userWasSatisfied;

  if (shouldShowSurvey) {
    console.log("✅ Showing survey (resolved or user satisfied)");
    setTimeout(() => {
      setSurveyVisible(true);
    }, 2000);
  } else {
    console.log("⏭️  Skipping survey (not resolved, user not satisfied)");
    toast.info("Thank you! No feedback needed.");
    setTimeout(() => {
      navigate("/history");
    }, 2000);
  }
};
```

---

### Change 4: Update sendMessage Function (Line ~350)

**Find this section (around line 400):**
```javascript
setAiMessageCount((count) => {
  const updated = count + 1;
  if (updated >= 5) setShowAutoTicketPrompt(true);
  return updated;
});
```

**Replace with:**
```javascript
// ⭐ Increment USER message count (not AI message count)
setUserMessageCount((count) => {
  const updated = count + 1;
  console.log(`📊 User message count: ${updated}`);
  if (updated >= 5 && !showAutoTicketPrompt) {
    console.log("✅ 5 user messages reached - showing escalation prompt");
    setShowAutoTicketPrompt(true);
  }
  return updated;
});
```

**ALSO, at the beginning of sendMessage function (around line 344), ADD this:**
```javascript
const sendMessage = async (content) => {
  if (chatLocked || waitingForAI) return;

  if (!chatId) {
    toast.error("Please click 'Start New Chat' before sending a message.");
    return;
  }

  // Update activity timestamp
  updateActivity();

  // ⭐ ADD THIS: Increment user message count immediately
  setUserMessageCount(prev => prev + 1);

  addMessage({
    id: crypto.randomUUID(),
    role: "user",
    content,
  });

  // ... rest of function
```

---

### Change 5: Update handleSatisfaction Function (Line ~420)

**Find this:**
```javascript
const handleSatisfaction = async (reply) => {
  if (reply === "yes") {
    await sendMessage("Yes, I am satisfied with the response.");
  } else {
    await sendMessage("No, I am not satisfied. I need more assistance with my issue.");
  }
};
```

**Replace with:**
```javascript
const handleSatisfaction = async (reply) => {
  if (reply === "yes") {
    // ⭐ User is satisfied - close immediately with survey
    console.log("✅ User clicked 'Satisfied' - closing chat with survey");
    setUserWasSatisfied(true);

    // Add a simple closing message
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: "Yes, I am satisfied with the response.",
    });

    // Close chat after short delay and show survey
    setTimeout(() => {
      triggerChatClosed(true); // true = user was satisfied
    }, 1000);
  } else {
    // ⭐ User needs help - continue conversation, NO survey later
    console.log("⚠️  User clicked 'Need Help' - continuing conversation");
    setUserWasSatisfied(false);
    await sendMessage("No, I am not satisfied. I need more assistance with my issue.");
  }
};
```

---

### Change 6: Remove Duplicate Counter Logic (Line ~400)

**Find and REMOVE this (it's now handled at the start of sendMessage):**
```javascript
setAiMessageCount((count) => {
  const updated = count + 1;
  if (updated >= 5) setShowAutoTicketPrompt(true);
  return updated;
});
```

**This section should be DELETED** because we moved the counter logic to the beginning of `sendMessage`.

---

## Testing After Changes

### Test 1: Satisfied Button
```
1. Start chat
2. Ask question
3. Click "Satisfied"
4. ✅ Chat closes immediately
5. ✅ Survey appears
```

### Test 2: Escalation After 5 Messages
```
1. Start chat
2. Send message 1 - No prompt
3. Send message 2 - No prompt
4. Send message 3 - No prompt
5. Send message 4 - No prompt
6. Send message 5 - ✅ "Initiate ticket protocol" appears
```

### Test 3: Need Help = No Survey
```
1. Start chat
2. Ask question
3. Click "Need Help"
4. Continue conversation
5. Eventually create ticket or close
6. ✅ NO survey (user wasn't satisfied)
```

---

## Summary of All Changes

| Line | Change | Purpose |
|------|--------|---------|
| ~31 | Add `userMessageCount` and `userWasSatisfied` states | Track user actions |
| ~191 | Reset new counters in `createNewChat` | Clean state for new chat |
| ~290 | Update `triggerChatClosed` to accept satisfaction flag | Conditional survey logic |
| ~344 | Increment counter at start of `sendMessage` | Count user messages |
| ~400 | Remove old AI message counter | Cleanup |
| ~420 | Update `handleSatisfaction` | Auto-close on satisfied |

---

## Quick Implementation Checklist

- [ ] Change `aiMessageCount` to `userMessageCount`
- [ ] Add `userWasSatisfied` state
- [ ] Update `triggerChatClosed` function
- [ ] Update `sendMessage` to increment user counter
- [ ] Update `handleSatisfaction` for auto-close
- [ ] Remove old AI message counter logic
- [ ] Test all three scenarios

---

## Need Help?

If you encounter any issues:
1. Check the browser console for log messages
2. Look for "📊 User message count" logs
3. Verify the changes were applied correctly
4. Test each scenario separately

