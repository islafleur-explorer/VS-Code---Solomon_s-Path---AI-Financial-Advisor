/**
 * API service for communicating with the backend
 */

const API_URL = 'http://localhost:8000';

/**
 * Send a query to the SolomonSays RAG system
 * @param {string} query - The user's question
 * @param {Array} chatHistory - Array of previous chat messages
 * @returns {Promise} - Promise resolving to the response from the RAG system
 */
export const sendQuery = async (query, chatHistory = []) => {
  try {
    const response = await fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        chat_history: chatHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get response from SolomonSays');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending query to SolomonSays:', error);
    throw error;
  }
};

/**
 * Check if the SolomonSays API is available
 * @returns {Promise<boolean>} - Promise resolving to true if the API is available
 */
export const checkApiAvailability = async () => {
  try {
    const response = await fetch(`${API_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('SolomonSays API is not available:', error);
    return false;
  }
};
