/**
 * Service to handle chatbot API calls.
 * For testing purposes, we use the Gemini API directly from the client.
 * NOTE for production: It's best practice to call the Gemini API from your backend to hide your API key.
 */

// We check common environment variables for React/Vite.
// In a real app, ensure your build tool makes these available (e.g., prefix with VITE_ or REACT_APP_).
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

// Gemini API endpoint for gemini-1.5-flash
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Custom Backend configuration
// To connect to your custom backend, replace GEMINI_API_URL with your backend URL below
// and update the fetch logic to use `backendPayload` instead.
// const BACKEND_API_URL = 'http://localhost:5000/api/chat';

export const sendMessageToBot = async (message, pageUrl = '', pageContext = '') => {
  try {
    // This is the ideal payload structure for your custom backend.
    const backendPayload = {
      message: message,
      page_url: pageUrl,
      page_context: pageContext
    };

    // If the API key is not set or still default, mock the response
    if (API_KEY === 'YOUR_GEMINI_API_KEY' || API_KEY === 'your_gemini_api_key_here') {
      console.warn("Gemini API Key missing, falling back to mock response.");
      console.log("Payload sent to backend:", backendPayload);
      return new Promise(resolve => {
        setTimeout(() => {
           resolve({
               reply: `Mock Response to: "${message}"\n(Context: User is on page '${pageUrl}')`,
               // url: '/some-page' // Uncomment to test auto-navigation
           });
        }, 800);
      });
    }

    // Direct Gemini integration for local testing without a backend
    // We enrich the prompt with the website context so Gemini understands the page state
    const contextualPrompt = `Context: The user is currently on the webpage path '${pageUrl}' (title: ${pageContext}).\n\nUser: ${message}`;

    const payload = {
      contents: [{
        parts: [{ text: contextualPrompt }]
      }]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // To use a custom backend, replace `payload` with `backendPayload`
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text from the Gemini response structure
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";

    return { reply: replyText };

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return {
      reply: 'Oops! Something went wrong communicating with the server.',
      error: true
    };
  }
};
