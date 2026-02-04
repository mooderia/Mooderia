import { GoogleGenAI, Type } from "@google/genai";

export const getHoroscope = async (sign: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a daily horoscope for ${sign} today.`,
      config: {
        systemInstruction: "You are a mystical Metropolis Astrologer in the Mooderia universe. Provide a 3-sentence daily horoscope that is encouraging and insightful. Use cosmic and modern metropolis terminology.",
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const getPsychiatristResponse = async (text: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction: "You are Dr. Philippe Pinel, a wise and empathetic psychiatrist in the Mooderia Metropolis. Your goal is to provide supportive, non-judgmental, and insightful guidance. Keep responses relatively concise but warm. Encourage citizens to reflect on their mood pet and their daily streaks.",
      }
    });
    return { text: response.text || "I am processing your words. Tell me more about how you feel." };
  } catch (error) {
    console.error("Psychiatrist API Error:", error);
    return { text: "The neural bridge is momentarily unstable. I am here for you when the connection clears." };
  }
};