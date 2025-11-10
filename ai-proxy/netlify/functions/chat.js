const { GoogleGenerativeAI } = require("@google/generative-ai");

// This key is stored securely on Netlify, not in the code
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.handler = async (event) => {
  // Allow requests from any origin (*) for simplicity, or lock it down
  const headers = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  
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