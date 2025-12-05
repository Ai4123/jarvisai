import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, '../src/pages/Chat.jsx');

console.log('🔧 Applying remaining fixes to Chat.jsx...\n');

let content = fs.readFileSync(chatFilePath, 'utf8');

// Fix 4: Update triggerChatClosed survey logic
console.log('✅ Fix 4: Updating triggerChatClosed survey logic...');
content = content.replace(
    /toast\.success\("Chat closed ✔"\);\s+setTimeout\(\(\) => \{\s+setSurveyVisible\(true\);\s+\}, 2000\);/,
    `toast.success("Chat closed ✔");

    // ⭐ Show survey ONLY if resolved OR user clicked "Satisfied"
    const shouldShowSurvey = satisfiedFlag || userWasSatisfied;

    if (shouldShowSurvey) {
      console.log("✅ Showing survey (user satisfied)");
      setTimeout(() => {
        setSurveyVisible(true);
      }, 2000);
    } else {
      console.log("⏭️  Skipping survey (user not satisfied)");
      toast.info("Thank you! No feedback needed.");
      setTimeout(() => {
        navigate("/history");
      }, 2000);
    }`
);

// Fix 5: Add user message counter in sendMessage
console.log('✅ Fix 5: Adding user message counter in sendMessage...');
content = content.replace(
    /(\/\/ Update activity timestamp\s+updateActivity\(\);\s+)(addMessage\(\{)/,
    `$1\n    // ⭐ Increment user message count\n    setUserMessageCount(prev => prev + 1);\n\n    $2`
);

// Fix 6: Update escalation logic
console.log('✅ Fix 6: Updating escalation logic...');
content = content.replace(
    /setAiMessageCount\(\(count\) => \{\s+const updated = count \+ 1;\s+if \(updated >= 5\) setShowAutoTicketPrompt\(true\);\s+return updated;\s+\}\);/,
    `// ⭐ Check user message count for escalation (after 5 USER messages)
      if (userMessageCount >= 5 && !showAutoTicketPrompt) {
        console.log("✅ 5 user messages reached - showing escalation prompt");
        setShowAutoTicketPrompt(true);
      }`
);

// Fix 7: Update handleSatisfaction
console.log('✅ Fix 7: Updating handleSatisfaction...');
content = content.replace(
    /const handleSatisfaction = async \(reply\) => \{\s+if \(reply === "yes"\) \{\s+await sendMessage\("Yes, I am satisfied with the response\."\);\s+\} else \{\s+await sendMessage\("No, I am not satisfied\. I need more assistance with my issue\."\);\s+\}\s+\};/,
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

fs.writeFileSync(chatFilePath, content, 'utf8');

console.log('\n🎉 All remaining fixes applied!');
console.log('\n✨ Implementation complete! All three fixes are now active.');
