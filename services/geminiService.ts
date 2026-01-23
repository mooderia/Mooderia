import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization as per instructions
// Using a function to ensure we catch the environment variable at runtime
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("METROPOLIS ERROR: API_KEY is missing from environment.");
    // We return a dummy key or handle the error gracefully so the app doesn't crash
    // but the user's specific instruction is to use process.env.API_KEY directly.
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const getPsychiatristResponse = async (message: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Dr. Philippe Pinel, the Chief Psychiatrist of Mooderia. You provide compassionate, expert, and concise mental health support to citizens. Your tone is professional, warm, and therapeutic. Focus on validation, mindfulness, and gentle guidance. Keep responses under 3 paragraphs.",
      }
    });
    return { text: response.text || "The neural link is experiencing static. Dr. Pinel is momentarily unavailable." };
  } catch (error) {
    console.error("Psychiatrist API Error:", error);
    return { text: "Connection to the Medical District failed. Please ensure your Metropolis credentials (API Key) are valid and that you have redeployed after adding them." };
  }
};

export const getHoroscope = async (sign: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Provide a daily horoscope for ${sign} today.` }] }],
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
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' (0-100) and 'reason'.` }] }],
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Analyze the following text for inappropriate language, hate speech, severe insults, or harassment: "${text}". Return a JSON object with 'isInappropriate' (boolean) and 'reason' (string, keep it short).` }] }],
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