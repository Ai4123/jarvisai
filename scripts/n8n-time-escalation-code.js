// ============================================
// TIME-BASED ESCALATION CODE
// ============================================
// Replace the jsCode in "Code in JavaScript7" node with this:

// Extract values safely
const response = $('parse_control').item.json.ai_response || "";
const chat_id = $('insert into messages').first().json.chat_id || null;
const resolved = $('parse_control').item.json.resolved || "no";

// Get chat creation time from the chat record
const chatCreatedAt = new Date($('supabase select chat').first().json.created_at);
const now = new Date();
const durationMinutes = (now - chatCreatedAt) / (1000 * 60);

// Configuration: threshold in minutes (default 5)
const ESCALATION_THRESHOLD_MINUTES = 5;

// Check if we should append ticket prompt
const shouldPromptTicket =
    durationMinutes > ESCALATION_THRESHOLD_MINUTES &&
    resolved !== "yes" &&
    !response.toLowerCase().includes("create a ticket"); // Don't duplicate if already mentioned

let finalResponse = response;

if (shouldPromptTicket) {
    finalResponse = response + "\n\nIt seems this is taking longer than expected. Would you like me to create a ticket for human support? If yes, please type 'create a ticket'.";
}

// Build final JSON
const data = {
    response: finalResponse,
    chat_id,
    duration_minutes: Math.round(durationMinutes * 10) / 10,
    escalation_prompted: shouldPromptTicket
};

// Return clean JSON object
return [
    {
        json: data
    }
];
