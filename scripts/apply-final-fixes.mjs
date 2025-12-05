import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, '../src/pages/Chat.jsx');

console.log('🔧 Applying final fixes to Chat.jsx...\n');

let content = fs.readFileSync(chatFilePath, 'utf8');

// Fix 1: Update triggerChatClosed to accept force parameter
console.log('✅ Fix 1: Updating triggerChatClosed signature...');
content = content.replace(
    /const triggerChatClosed = async \(satisfiedFlag = false\) => \{\s+if \(chatLocked\) return;/,
    `const triggerChatClosed = async (satisfiedFlag = false, force = false) => {
    if (chatLocked && !force) return;`
);

// Fix 2: Update handleSatisfaction to force close
console.log('✅ Fix 2: Updating handleSatisfaction to force close...');
content = content.replace(
    /triggerChatClosed\(true\); \/\/ true = user was satisfied/,
    `triggerChatClosed(true, true); // true = user was satisfied, true = force close`
);

// Fix 3: Initialize satisfactionMessageId from localStorage
console.log('✅ Fix 3: Initializing satisfactionMessageId from localStorage...');
content = content.replace(
    /const \[satisfactionMessageId, setSatisfactionMessageId\] = useState\(null\);/,
    `const [satisfactionMessageId, setSatisfactionMessageId] = useState(localStorage.getItem("satisfaction_message_id"));`
);

// Fix 4: Add useEffect to sync satisfactionMessageId
console.log('✅ Fix 4: Adding useEffect for satisfactionMessageId persistence...');
// Insert after the last useEffect or state declaration
content = content.replace(
    /(const \[sessionExpired, setSessionExpired\] = useState\(false\);)/,
    `$1

  // ⭐ Persist satisfaction button state
  useEffect(() => {
    if (satisfactionMessageId) {
      localStorage.setItem("satisfaction_message_id", satisfactionMessageId);
    } else {
      localStorage.removeItem("satisfaction_message_id");
    }
  }, [satisfactionMessageId]);`
);

fs.writeFileSync(chatFilePath, content, 'utf8');

console.log('\n🎉 Final fixes applied!');
console.log('  1. ✅ triggerChatClosed now accepts force param');
console.log('  2. ✅ handleSatisfaction forces close');
console.log('  3. ✅ satisfactionMessageId persists in localStorage');
