import { GoogleGenAI, Type } from "@google/genai";

export const checkContentSafety = async (text: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following text for inappropriate language: "${text}". Return a JSON object with 'isInappropriate' (boolean) and 'reason' (string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isInappropriate: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ['isInappropriate', 'reason']
        }
      }
    });
    const resultText = response.text || "{}";
    return JSON.parse(resultText.trim());
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { isInappropriate: false, reason: "" };
  }
};