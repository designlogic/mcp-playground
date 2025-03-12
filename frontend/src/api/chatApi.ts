const API_URL = 'http://localhost:3001/api';

export const sendMessage = async (message: string): Promise<string> => {
    try {
        console.log('Sending message:', message);
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}; 