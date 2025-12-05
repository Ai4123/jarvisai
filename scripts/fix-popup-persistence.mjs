import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chatFilePath = path.join(__dirname, '../src/pages/Chat.jsx');

console.log('🔧 Fixing popup persistence issue...\n');

let content = fs.readFileSync(chatFilePath, 'utf8');

// Fix: Add state to track which message should show satisfaction buttons
console.log('✅ Adding state to persist satisfaction button visibility...');

// Add new state variable after other state declarations
content = content.replace(
    /(const \[userWasSatisfied, setUserWasSatisfied\] = useState\(false\);)/,
    `$1
  const [satisfactionMessageId, setSatisfactionMessageId] = useState(null); // Track which message shows buttons`
);

// Update sendMessage to set the satisfaction message ID after AI responds
content = content.replace(
    /(addMessage\(\{\s+id: crypto\.randomUUID\(\),\s+role: "assistant",\s+content: response,\s+\}\);)/,
    `const aiMsgId = crypto.randomUUID();
      addMessage({
        id: aiMsgId,
        role: "assistant",
        content: response,
      });
      
      // ⭐ Set this as the message that should show satisfaction buttons
      setSatisfactionMessageId(aiMsgId);`
);

// Update the rendering to use satisfactionMessageId instead of isLatestAiMessage
content = content.replace(
    /(const latestAiIndex = getLatestAiMessageIndex\(messages\);\s+const isLatestAiMessage = index === latestAiIndex;)/,
    `const latestAiIndex = getLatestAiMessageIndex(messages);
                    const isLatestAiMessage = m.id === satisfactionMessageId; // ⭐ Use message ID instead of index`
);

// Clear satisfaction message ID when chat closes
content = content.replace(
    /(localStorage\.removeItem\("chat_id"\);\s+setChatId\(null\);)/,
    `localStorage.removeItem("chat_id");
    setChatId(null);
    setSatisfactionMessageId(null); // ⭐ Clear satisfaction button tracking`
);

// Clear satisfaction message ID when creating new chat
content = content.replace(
    /(setUserWasSatisfied\(false\);\s+setShowAutoTicketPrompt\(false\);)/,
    `setUserWasSatisfied(false);
      setSatisfactionMessageId(null); // ⭐ Clear satisfaction button tracking
      setShowAutoTicketPrompt(false);`
);

fs.writeFileSync(chatFilePath, content, 'utf8');

console.log('\n🎉 Popup persistence fix applied!');
console.log('\nChanges made:');
console.log('  1. ✅ Added satisfactionMessageId state to track which message shows buttons');
console.log('  2. ✅ Set message ID when AI responds');
console.log('  3. ✅ Use message ID instead of index for button visibility');
console.log('  4. ✅ Clear tracking when chat closes or new chat starts');
console.log('\n✨ Buttons will now persist when switching tabs!');
