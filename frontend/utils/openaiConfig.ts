import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store this in server-side .env file
  baseURL: "/api/openai", // Create a proxy endpoint in your backend
});

export { openai };
