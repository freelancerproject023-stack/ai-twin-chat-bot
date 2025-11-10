const { GoogleGenerativeAI } = require("@google/generative-ai");

// The URL of your Firebase app. THIS MUST BE EXACTLY RIGHT.
const ALLOWED_ORIGIN = "https://ai-twin-chatbot.web.app";

// This is the main function that runs when called
exports.handler = async (event, context) => {

  // --- CORS Preflight Handling ---
  // The browser sends an OPTIONS request first to check permissions.
  // We must respond to this request with the correct headers.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // "No Content" success status
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // --- Main Function Logic ---
  try {
    // Get the API key from Netlify's environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("API Key is not set on the server.");
    }
    
    // Initialize the AI model
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt, history } = JSON.parse(event.body);
    
    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    
    // Success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ response: text }),
    };

  } catch (error) {
    // Error response
    console.error("Internal Server Error:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "An internal server error occurred on the backend." }),
    };
  }
};
