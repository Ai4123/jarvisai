import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, '../src/pages/Chat.jsx');
const chatMessagePath = path.join(__dirname, '../src/components/ChatMessage.jsx');

console.log('🔧 Fixing popup persistence and typing animation...\n');

// 1. Modify ChatMessage.jsx to accept skipTyping
let chatMessageContent = fs.readFileSync(chatMessagePath, 'utf8');
console.log('✅ Updating ChatMessage.jsx to support skipTyping...');

chatMessageContent = chatMessageContent.replace(
    /const \[isTyping, setIsTyping\] = useState\(!isUser\);/,
    `const [isTyping, setIsTyping] = useState(!isUser && !safeMessage.skipTyping);`
);

fs.writeFileSync(chatMessagePath, chatMessageContent, 'utf8');

// 2. Modify Chat.jsx
let chatContent = fs.readFileSync(chatFilePath, 'utf8');
console.log('✅ Updating Chat.jsx...');

// Remove satisfactionMessageId state
chatContent = chatContent.replace(
    /const \[satisfactionMessageId, setSatisfactionMessageId\] = useState\(localStorage\.getItem\("satisfaction_message_id"\)\);.*\n/,
    ''
);

// Remove useEffect for persistence
chatContent = chatContent.replace(
    /\/\/ ⭐ Persist satisfaction button state\s+useEffect\(\(\) => \{[\s\S]*?\}, \[satisfactionMessageId\]\);\s+/,
    ''
);

// Update fetchMessages to add skipTyping: true
chatContent = chatContent.replace(
    /setMessages\(data \|\| \[\]\);/,
    `// ⭐ Disable typing for loaded messages
    const loadedMessages = (data || []).map(m => ({ ...m, skipTyping: true }));
    setMessages(loadedMessages);`
);

// Revert isLatestAiMessage logic to use index
chatContent = chatContent.replace(
    /const isLatestAiMessage = m\.id === satisfactionMessageId;.*$/m,
    `const isLatestAiMessage = index === latestAiIndex; // ⭐ Use index for latest message`
);

// Remove setSatisfactionMessageId calls
chatContent = chatContent.replace(
    /setSatisfactionMessageId\(aiMsgId\);/g,
    ''
);
chatContent = chatContent.replace(
    /setSatisfactionMessageId\(null\);/g,
    ''
);

fs.writeFileSync(chatFilePath, chatContent, 'utf8');

console.log('\n🎉 Popup persistence fixed by disabling re-typing on old messages!');
