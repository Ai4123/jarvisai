# Quick Reference Card

## 🚀 Implementation in 3 Steps

### Step 1: Time-Based Escalation (5 minutes)
1. Open n8n workflow editor
2. Find node: **"Code in JavaScript7"**
3. Replace `jsCode` with code from: `scripts/n8n-time-escalation-code.js`
4. Save & activate

**Test**: Start chat, wait 6 minutes, send message → Should see ticket prompt

---

### Step 2: Conditional Feedback (10 minutes)
**Option A - Frontend (Recommended)**:
1. Open `Chat.jsx`
2. Find `handleChatClose` function
3. Add code from: `scripts/frontend-conditional-feedback.js` (Option 1)
4. Save & test

**Test**: Close resolved chat → Survey shows | Close unresolved → No survey

---

### Step 3: Verify (5 minutes)
- [ ] Time prompt after 5+ min ✓
- [ ] No prompt if resolved ✓
- [ ] Survey only for resolved ✓
- [ ] No errors in console ✓

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Start here - overview |
| `IMPLEMENTATION_GUIDE.md` | Detailed step-by-step |
| `WORKFLOW_DIAGRAMS.md` | Visual flows |
| `scripts/n8n-time-escalation-code.js` | Copy this to n8n |
| `scripts/frontend-conditional-feedback.js` | Copy this to frontend |

---

## ⚙️ Configuration

### Change Time Threshold
```javascript
const ESCALATION_THRESHOLD_MINUTES = 10; // Change from 5 to 10
```

### Disable Features
```javascript
// Disable time-based escalation
const ESCALATION_THRESHOLD_MINUTES = 999999;

// Disable conditional feedback
// Just remove the if-check and always show survey
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Prompt not appearing | Check duration > 5 min AND resolved = "no" |
| Survey still shows | Verify conditional check is in place |
| "Cannot read created_at" | Ensure chat exists in database |
| Duplicate prompts | Check `!response.includes("create a ticket")` |

---

## 📊 Testing Scenarios

### Scenario 1: Quick & Resolved
```
Time: 2 min | Resolved: yes
Expected: No prompt, Show survey ✓
```

### Scenario 2: Long & Unresolved
```
Time: 6 min | Resolved: no
Expected: Show prompt, No survey ✓
```

### Scenario 3: Long but Resolved
```
Time: 7 min | Resolved: yes
Expected: No prompt, Show survey ✓
```

### Scenario 4: Manual Ticket
```
User types: "create a ticket"
Expected: Ticket created, No survey ✓
```

---

## 🔧 Troubleshooting Commands

```bash
# Check n8n logs
docker logs n8n-container

# Check database
psql -d your_db -c "SELECT id, created_at, status FROM chats ORDER BY created_at DESC LIMIT 5;"

# Test frontend
console.log("Chat resolved:", chat.resolved);
console.log("Duration:", durationMinutes);
```

---

## 📞 Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` - Troubleshooting section
2. Review n8n execution logs
3. Check browser console for errors
4. Verify all node references are correct

---

## ✅ Success Criteria

- [x] Code files created
- [x] Documentation complete
- [ ] Feature 1 implemented
- [ ] Feature 1 tested
- [ ] Feature 2 implemented
- [ ] Feature 2 tested
- [ ] Both features working together
- [ ] No errors in production

---

## 🎯 Next Action

**Right now**: Open `scripts/n8n-time-escalation-code.js` and copy the code to your n8n workflow!

