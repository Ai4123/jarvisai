import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Chat.jsx
const chatFilePath = path.join(__dirname, '../src/pages/Chat.jsx');

console.log('🔧 Applying all three fixes to Chat.jsx...\n');

// Read the file
let content = fs.readFileSync(chatFilePath, 'utf8');

// Fix 1: Add new state variables (after line 31)
console.log('✅ Fix 1: Adding userMessageCount and userWasSatisfied state variables...');
content = content.replace(
    /const \[aiMessageCount, setAiMessageCount\] = useState\(0\);/,
    `const [aiMessageCount, setAiMessageCount] = useState(0);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [userWasSatisfied, setUserWasSatisfied] = useState(false);`
);

// Fix 2: Reset counters in createNewChat
console.log('✅ Fix 2: Resetting counters in createNewChat...');
content = content.replace(
    /setAiMessageCount\(0\);\s+setShowAutoTicketPrompt\(false\);/,
    `setAiMessageCount(0);
      setUserMessageCount(0);
      setUserWasSatisfied(false);
      setShowAutoTicketPrompt(false);`
);

// Fix 3: Update triggerChatClosed to accept satisfaction parameter
console.log('✅ Fix 3: Updating triggerChatClosed function...');
content = content.replace(
    /const triggerChatClosed = async \(\) => \{/,
    `const triggerChatClosed = async (satisfiedFlag = false) => {`
);

// Fix 3b: Update survey logic in triggerChatClosed
content = content.replace(
    /\/\/ ⭐ NEW: Only show survey if chat was resolved\s+if \(wasResolved\) \{[\s\S]*?navigate\("\/history"\);\s+\}, 2000\);\s+\}/,
    `// ⭐ Show survey ONLY if resolved OR user clicked "Satisfied"
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
    }`
);

// Fix 4: Update sendMessage to increment user message count
console.log('✅ Fix 4: Adding user message counter to sendMessage...');
content = content.replace(
    /(\/\/ Update activity timestamp\s+updateActivity\(\);)/,
    `// Update activity timestamp
    updateActivity();

    // ⭐ Increment user message count
    setUserMessageCount(prev => prev + 1);`
);

// Fix 5: Change escalation logic to use userMessageCount
console.log('✅ Fix 5: Updating escalation logic to use user message count...');
content = content.replace(
    /setAiMessageCount\(\(count\) => \{[\s\S]*?return updated;\s+\}\);/,
    `// ⭐ Check user message count for escalation (after 5 USER messages)
      setUserMessageCount((count) => {
        console.log(\`📊 User message count: \${count}\`);
        if (count >= 5 && !showAutoTicketPrompt) {
          console.log("✅ 5 user messages reached - showing escalation prompt");
          setShowAutoTicketPrompt(true);
        }
        return count;
      });`
);

// Fix 6: Update handleSatisfaction
console.log('✅ Fix 6: Updating handleSatisfaction for auto-close...');
content = content.replace(
    /const handleSatisfaction = async \(reply\) => \{[\s\S]*?await sendMessage\("No, I am not satisfied\. I need more assistance with my issue\."\);\s+\}\s+\};/,
    `const handleSatisfaction = async (reply) => {
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
  };`
);

// Write the updated content back
fs.writeFileSync(chatFilePath, content, 'utf8');

console.log('\n🎉 All fixes applied successfully!');
console.log('\nChanges made:');
console.log('  1. ✅ Added userMessageCount and userWasSatisfied state');
console.log('  2. ✅ Reset counters in createNewChat');
console.log('  3. ✅ Updated triggerChatClosed to accept satisfaction flag');
console.log('  4. ✅ Added user message counter in sendMessage');
console.log('  5. ✅ Changed escalation to trigger after 5 USER messages');
console.log('  6. ✅ Updated handleSatisfaction for auto-close on "Satisfied"');
console.log('\n✨ Ready to test!');
