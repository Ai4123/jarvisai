# Feature 1: Time-Based Escalation - Simple Implementation for YOUR Workflow

## ✅ GOOD NEWS: Your Frontend Already Handles This!

Looking at your `Chat.jsx` (line 344-346), you already have:
```javascript
if (raw.escalation === true) {
  setShowTicketPrompt(true);
}
```

So your frontend is **already ready** to show the ticket prompt when the backend sends `escalation: true`.

---

## 🎯 What You Need to Do in n8n

Your workflow is simpler than expected, which makes this EASIER! You just need to:

### Option 1: Add to AI Agent System Prompt (EASIEST - 2 minutes)

Update your AI Agent's system prompt to include time-based escalation logic.

**Steps:**
1. Open your n8n workflow
2. Find the **"AI Agent"** node (the first node in your workflow)
3. Click to edit it
4. In the **System Message** field, ADD this at the end:

```
IMPORTANT: Time-Based Escalation Rule

Before generating your response, check the chat duration:
- If the chat has been active for more than 5 minutes AND the query is not resolved, append this message to your response:

"It seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'."

Do this ONLY if:
1. Chat duration > 5 minutes
2. resolved = "no"
3. Your response doesn't already mention creating a ticket
```

**That's it!** The AI will now automatically add the escalation prompt after 5 minutes.

---

### Option 2: Add a Code Node (More Control - 10 minutes)

If you want more precise control, add a Code node after the AI Agent:

**Steps:**
1. Open your n8n workflow
2. After the **"AI Agent"** node, add a new **Code** node
3. Name it: "Add Time-Based Escalation"
4. Paste this code:

```javascript
// Get the AI response
const aiResponse = $input.first().json.output || "";

// Get chat creation time from earlier node
const chatCreatedAt = new Date($('supabase select chat').first().json.created_at);
const now = new Date();
const durationMinutes = (now - chatCreatedAt) / (1000 * 60);

// Configuration
const ESCALATION_THRESHOLD_MINUTES = 5;

// Check if we should add escalation prompt
const shouldEscalate = 
  durationMinutes > ESCALATION_THRESHOLD_MINUTES && 
  aiResponse.includes('"resolved": "no"') &&
  !aiResponse.toLowerCase().includes("create a ticket");

let finalResponse = aiResponse;

if (shouldEscalate) {
  // Find where to insert (before the ###CONTROL block)
  const controlIndex = aiResponse.indexOf("###CONTROL:");
  if (controlIndex > 0) {
    const beforeControl = aiResponse.substring(0, controlIndex);
    const controlBlock = aiResponse.substring(controlIndex);
    finalResponse = beforeControl + 
      "\n\nIt seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'.\n\n" +
      controlBlock;
  } else {
    finalResponse = aiResponse + 
      "\n\nIt seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'.";
  }
}

return [{
  json: {
    output: finalResponse,
    escalation: shouldEscalate,
    duration_minutes: Math.round(durationMinutes * 10) / 10
  }
}];
```

5. Connect this node between "AI Agent" and whatever comes next
6. Update the response node to use `$json.output` instead of the AI Agent's output

---

## 🎯 RECOMMENDED: Option 1 (AI Prompt)

I recommend **Option 1** because:
- ✅ Simpler (just edit the prompt)
- ✅ No workflow changes needed
- ✅ AI handles it intelligently
- ✅ Works immediately
- ✅ No risk of breaking existing flow

---

## 📝 Exact Steps for Option 1

1. **Open n8n** → Go to your workflow
2. **Click** on the "AI Agent" node (first node)
3. **Scroll down** to "System Message"
4. **Add** the escalation rule text at the very end
5. **Save** the workflow
6. **Test** by:
   - Starting a chat
   - Asking a question
   - Waiting 6 minutes
   - Asking another question
   - You should see the ticket prompt!

---

## ⚙️ Configuration

To change the time threshold, just edit the number in the prompt:
- `more than 5 minutes` → Change to `more than 10 minutes`
- Or whatever duration you want

---

## 🧪 Testing

### Test Scenario 1: Quick Resolution (< 5 min)
```
1. Start chat
2. Ask: "What is KB?"
3. Get answer (resolved = yes)
4. ✅ NO escalation prompt (correct!)
```

### Test Scenario 2: Long Unresolved (> 5 min)
```
1. Start chat
2. Ask: "How do I configure X?"
3. Wait 6 minutes
4. Ask: "Can you help with Y?"
5. ✅ Should see escalation prompt (correct!)
```

---

## 💡 Why This Works

Your workflow already:
- ✅ Tracks chat `created_at` (in Supabase)
- ✅ Has the AI generate `resolved` status
- ✅ Sends responses to frontend
- ✅ Frontend handles `escalation` flag

So you just need the AI to:
- Check time elapsed
- Add the prompt if needed
- Done!

---

## Summary

**For Feature 1, do this:**
1. Open n8n workflow
2. Edit "AI Agent" node
3. Add escalation rule to system prompt
4. Save
5. Test

**Total time: 2 minutes** ⏱️

That's it! Much simpler than the complex workflow I was expecting. 🎉
