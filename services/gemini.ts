import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize AI client only if key exists, otherwise handle gracefully in UI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateJsonAnalysis = async (jsonString: string): Promise<string> => {
  if (!ai) return "API Key is missing. Please configure process.env.API_KEY.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following JSON. 
      1. Provide a brief 1-sentence summary of what this data likely represents.
      2. Generate a TypeScript interface that matches this JSON structure.
      
      JSON:
      ${jsonString.slice(0, 5000)} // Limit length to avoid token limits for large files
      `,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with AI service.";
  }
};

export const explainJwtClaims = async (payload: string): Promise<string> => {
  if (!ai) return "API Key is missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain the security implications and meaning of the following JWT payload claims. Highlight any potential security risks (like long expiration, sensitive data in payload).
      
      Payload:
      ${payload}
      `,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with AI service.";
  }
};