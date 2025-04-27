/**
 * API service for communicating with the SolomonSays backend
 */

const API_URL = 'http://localhost:8000';

/**
 * Send a query to the SolomonSays RAG system
 * @param {string} query - The user's question
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {Object} userContext - User context information
 * @returns {Promise} - Promise resolving to the response from the RAG system
 */
export const sendQuery = async (query, chatHistory = [], userContext = {}) => {
  try {
    const response = await fetch(`${API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        chat_history: chatHistory,
        user_context: userContext,
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

/**
 * Get information about the RAG system
 * @returns {Promise} - Promise resolving to system information
 */
export const getSystemInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/api/system-info`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get system information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting system information:', error);
    throw error;
  }
};

/**
 * Ingest content into the RAG system
 * @param {string} contentSource - Path or URL to the content
 * @param {string} sourceType - Type of content source ('json', 'url', 'pdf', 'csv')
 * @returns {Promise} - Promise resolving to the ingestion result
 */
export const ingestContent = async (contentSource, sourceType = 'json') => {
  try {
    const response = await fetch(`${API_URL}/api/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_source: contentSource,
        source_type: sourceType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to ingest content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error ingesting content:', error);
    throw error;
  }
};
