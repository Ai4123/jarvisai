// ============================================
// CONDITIONAL FEEDBACK - FRONTEND CODE
// ============================================
// Add this to your Chat.jsx or wherever you handle chat closing

// Option 1: Simple check before showing survey
const handleChatClose = async (chatId) => {
    try {
        // Get the last AI message to check resolution status
        const lastAIMessage = messages
            .filter(m => m.role === 'ai')
            .pop();

        // Parse the control block if it exists
        let resolved = false;
        if (lastAIMessage?.content) {
            const controlMatch = lastAIMessage.content.match(/###CONTROL:\s*({[\s\S]*?})/);
            if (controlMatch) {
                try {
                    const control = JSON.parse(controlMatch[1]);
                    resolved = control.resolved === "yes";
                } catch (e) {
                    console.error("Failed to parse control block:", e);
                }
            }
        }

        // Close the chat via API
        const response = await fetch(`${API_URL}/chats/${chatId}/close`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ resolved })
        });

        if (!response.ok) throw new Error('Failed to close chat');

        // Only show survey if resolved
        if (resolved) {
            setShowSurveyModal(true);
            setSurveyData({ chatId, ticketId: null });
        } else {
            // Just show a simple message
            toast.success('Chat closed. No feedback needed for unresolved queries.');
            navigate('/history');
        }

    } catch (error) {
        console.error('Error closing chat:', error);
        toast.error('Failed to close chat');
    }
};

// Option 2: Check from chat status in database
const handleChatCloseFromDB = async (chatId) => {
    try {
        // Fetch chat details including resolved status
        const chatResponse = await fetch(`${API_URL}/chats/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const chat = await chatResponse.json();

        // Close the chat
        await fetch(`${API_URL}/chats/${chatId}/close`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Show survey only if resolved
        if (chat.resolved === true || chat.status === 'resolved') {
            setShowSurveyModal(true);
        } else {
            navigate('/history');
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

// Option 3: Conditional rendering in JSX
const SurveyModal = ({ chat, onClose }) => {
    // Don't render if not resolved
    if (!chat.resolved && chat.status !== 'resolved') {
        return null;
    }

    return (
        <div className="survey-modal">
            {/* Your survey UI */}
        </div>
    );
};
