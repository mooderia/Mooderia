
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Utility to communicate with Gemini.
 * Uses process.env.API_KEY exclusively.
 */
const callGemini = async (model: string, prompt: string, config?: any) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("METROPOLIS_LINK_OFFLINE: API key not found.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    if (!response || !response.text) {
      throw new Error("NEURAL_LINK_EMPTY: No response from metropolis.");
    }

    return response.text;
  } catch (error: any) {
    console.error("METROPOLIS ERROR:", error);
    throw error;
  }
};

export const getHoroscope = async (sign: string) => {
  try {
    const prompt = `Provide a daily horoscope for the zodiac sign ${sign}. 
    Make it three sentences long, modern, and inspiring. 
    Tone: Chief Astrologer of a vibrant metropolis.`;
    
    return await callGemini('gemini-3-flash-preview', prompt, {
      systemInstruction: "You are the Chief Astrologer of Mooderia."
    });
  } catch (error: any) {
    return `NEURAL LINK INTERFERENCE: ${error.message || "The stars are currently obscured by metropolis clouds."}`;
  }
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
  try {
    const prompt = `Calculate love compatibility between ${sign1} and ${sign2}. 
    Return a JSON object with 'percentage' (number) and 'reason' (concise string).`;
    
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
    
    return JSON.parse(text);
  } catch (error) {
    return { percentage: 50, reason: "Atmospheric interference prevents a clear sync." };
  }
};

export const checkContentSafety = async (text: string) => {
  try {
    if (!text || text.length < 2) return { isInappropriate: false, reason: "" };
    const prompt = `Scan this text for safety and metropolis rules: "${text}". 
    Return JSON with 'isInappropriate' (boolean) and 'reason' (string).`;
    
    const resText = await callGemini('gemini-3-flash-preview', prompt, {
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

    return JSON.parse(resText);
  } catch (error) {
    return { isInappropriate: false, reason: "" };
  }
};
