// Import the Google AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from Netlify's environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- --- --- THIS IS THE CRITICAL FIX --- --- ---
// The URL of your Firebase app must be EXACTLY correct.
const ALLOWED_ORIGIN = "https://ai-twin-chatbot.web.app";
// --- --- --- --- --- --- --- --- --- --- --- ---

// Initialize the AI model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This is the main function that runs when called
exports.handler = async (event) => {
  // Set up the headers to allow your Firebase app to make requests
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Browsers send a "preflight" OPTIONS request first to check permissions.
  // We need to handle this by sending back an OK response.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers
    };
  }
  
  // We only want to process chat messages sent via POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, // Method Not Allowed
      headers,
      body: "Method Not Allowed" 
    };
  }

  // Main logic to talk to the AI
  try {
    // Check if the API key was loaded correctly
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in the Netlify environment variables.");
    }

    const { prompt, history } = JSON.parse(event.body);
    
    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: text }),
    };

  } catch (error) {
    // Log the actual error on the backend for debugging
    console.error("Internal Server Error:", error);
    
    // Send a generic error message back to the user
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "An internal server error occurred." }),
    };
  }
};
