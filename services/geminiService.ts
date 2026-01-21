
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPsychiatristResponse = async (message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Dr. Philippe Pinel, a compassionate and expert psychiatrist in the city of Mooderia. You provide helpful advice for mental well-being while maintaining a professional yet friendly tone.",
    }
  });
  return response.text;
};

export const getNutritionistResponse = async (message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Dr. Antoine Lavoisier, a professional nutritionist in Mooderia. You guide users on meal plans and wellness.",
    }
  });
  return response.text;
};

export const getStudyGuideResponse = async (message: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Sir Clark, an inspiring educator in Mooderia. You help students with study methods and motivate them.",
    }
  });
  return response.text;
};

export const getTellerResponse = async (question: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict the answer to this question: ${question}`,
    config: {
      systemInstruction: "You are a mystical fortune teller. You must answer ONLY starting with one of these five categories: [YES, NO, MAYBE, BIG YES, BIG NO]. After the category, add a very short, poetic, and mysterious sentence. Example: 'YES. The moon smiles upon your path.'",
    }
  });
  return response.text;
};

export const getHoroscope = async (sign: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a daily horoscope for ${sign} today.`,
    config: {
      systemInstruction: "You are an expert astrologer. Provide a 3-sentence horoscope that is encouraging and insightful.",
    }
  });
  return response.text;
};

export const getPlanetaryInsights = async (sign: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain how current planetary movements affect the mood of a ${sign} today.`,
    config: {
      systemInstruction: "You are a cosmic astrologer providing deep, personalized insights based on planetary aspects. Plain text only, no markdown.",
    }
  });
  return response.text;
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
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
    
    return JSON.parse(response.text.trim());
}
