const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.handler = async (event) => {
  // --- --- --- THIS IS THE CRITICAL FIX --- --- ---
  // We must explicitly allow your Firebase app's domain.
  const allowedOrigin = "https://ai-twin-chatbot.web.app"; 
  // --- --- --- --- --- --- --- --- --- --- --- ---

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  
  // (The rest of the function is the same)
  try {
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to get a response from the AI." }),
    };
  }
};
