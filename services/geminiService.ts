
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Robust AI initialization.
 * We create the instance inside the call to ensure it always picks up the latest environment state.
 */
const callGemini = async (model: string, prompt: string, config?: any) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("METROPOLIS DIAGNOSTIC: process.env.API_KEY is currently undefined.");
      throw new Error("API Key Missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt, // Using simplified string content for maximum reliability
      config: config
    });

    return response.text;
  } catch (error: any) {
    console.error("METROPOLIS LINK ERROR:", error.message || error);
    if (error.message?.includes("API_KEY_INVALID")) {
      console.error("CRITICAL: The API Key provided in Vercel is invalid.");
    }
    throw error;
  }
};

export const getHoroscope = async (sign: string) => {
  try {
    const prompt = `Provide a daily horoscope for ${sign} today. Keep it to 3 encouraging sentences.`;
    const systemInstruction = "You are a mystical Metropolis Astrologer. Provide insightful, modern horoscopes.";
    
    const text = await callGemini('gemini-3-flash-preview', prompt, { systemInstruction });
    return text || "The constellations are currently obscured.";
  } catch (error) {
    return "The stars are recalibrating. Check back shortly.";
  }
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
  try {
    const prompt = `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' (number 0-100) and 'reason' (string).`;
    
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
    
    return JSON.parse(text || "{}");
  } catch (error) {
    console.error("Love Prediction Error:", error);
    return { percentage: 50, reason: "The romantic frequencies are experiencing atmospheric interference." };
  }
};

export const checkContentSafety = async (text: string) => {
  try {
    // If the text is very short, assume safe to save on API quota
    if (text.length < 3) return { isInappropriate: false, reason: "" };

    const prompt = `Analyze this text for hate speech or severe harassment: "${text}". Return JSON with 'isInappropriate' (boolean) and 'reason' (string).`;
    
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

    return JSON.parse(resultText || "{\"isInappropriate\": false, \"reason\": \"\"}");
  } catch (error) {
    // Fail safe: If the safety check API fails (e.g. key issue), allow the post but log it.
    console.warn("Safety Check Bypassed due to API error.");
    return { isInappropriate: false, reason: "" };
  }
};
