
import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHoroscope = async (sign: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a daily horoscope for ${sign} today.`,
      config: {
        systemInstruction: "You are a mystical Metropolis Astrologer. Provide a 3-sentence daily horoscope that is encouraging and insightful. Use cosmic and modern terminology.",
      }
    });
    return response.text || "The constellations are currently obscured by metropolis smog.";
  } catch (error) {
    console.error("Horoscope API Error:", error);
    return "The stars are recalibrating. Check back later.";
  }
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' (0-100) and 'reason'.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    percentage: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                },
                required: ['percentage', 'reason']
            }
        }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Love Prediction API Error:", error);
    return { percentage: 50, reason: "The romantic frequencies are currently experiencing atmospheric interference." };
  }
}

export const checkContentSafety = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following text for inappropriate language, hate speech, severe insults, or harassment: "${text}". Return a JSON object with 'isInappropriate' (boolean) and 'reason' (string, keep it short).`,
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

// Fix: Implement getPsychiatristResponse to handle chat sessions with Dr. Pinel
export const getPsychiatristResponse = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction: "You are Dr. Philippe Pinel, a wise and empathetic psychiatrist in the Mooderia Metropolis. Your goal is to provide supportive, non-judgmental, and insightful guidance to citizens. Use a professional yet caring tone. If a user expresses severe distress, gently remind them to seek professional real-world help while remaining supportive.",
      }
    });
    return { text: response.text || "I am processing your words. Tell me more about how you feel." };
  } catch (error) {
    console.error("Psychiatrist API Error:", error);
    return { text: "The neural bridge is momentarily unstable. I am here for you when the connection clears." };
  }
};