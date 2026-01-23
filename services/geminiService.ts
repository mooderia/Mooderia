import { GoogleGenAI, Type } from "@google/genai";

/**
 * Enhanced Gemini utility that follows strict SDK guidelines.
 */
const callGemini = async (model: string, prompt: string, config?: any) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    return response.text;
  } catch (error: any) {
    console.error("METROPOLIS API ERROR:", error.message || error);
    throw error;
  }
};

export const getHoroscope = async (sign: string) => {
  try {
    const prompt = `Provide a daily horoscope for ${sign} for today. Keep it to exactly three sentences. Use a modern, encouraging, and slightly mystical tone.`;
    const systemInstruction = "You are the Mooderia Chief Astrologer. Your predictions are insightful and concise.";
    
    const text = await callGemini('gemini-3-flash-preview', prompt, { systemInstruction });
    return text || "The cosmic signal is weak. Try refreshing your link.";
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") {
      return "METROPOLIS ERROR: Your API Key is not detected. Check your Environment Variables and Redeploy.";
    }
    return "The stars are currently undergoing maintenance. Please try again in a moment.";
  }
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
  try {
    const prompt = `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' (number 0-100) and 'reason' (string, max 30 words).`;
    
    const text = await callGemini('gemini-3-flash-preview', prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          percentage: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ['percentage', 'reason']
      }
    });
    
    return JSON.parse(text || '{"percentage": 50, "reason": "Connection unstable."}');
  } catch (error) {
    return { percentage: 50, reason: "The romantic frequencies are currently experiencing atmospheric interference." };
  }
};

export const checkContentSafety = async (text: string) => {
  try {
    if (text.length < 3) return { isInappropriate: false, reason: "" };
    const prompt = `Check this text for safety: "${text}". Return JSON with 'isInappropriate' (boolean) and 'reason' (string).`;
    
    const resultText = await callGemini('gemini-3-flash-preview', prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isInappropriate: { type: Type.BOOLEAN },
          reason: { type: Type.STRING }
        },
        required: ['isInappropriate', 'reason']
      }
    });

    return JSON.parse(resultText || '{"isInappropriate": false, "reason": ""}');
  } catch (error) {
    return { isInappropriate: false, reason: "" };
  }
};