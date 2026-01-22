
let aiModulePromise: Promise<any> | null = null;
let ai: any;
const getAi = async () => {
  if (!aiModulePromise) {
    aiModulePromise = import('https://esm.sh/@google/genai@1.35.0');
  }
  const mod = await aiModulePromise;
  if (!ai) {
    ai = new mod.GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return mod;
};

export const getPsychiatristResponse = async (message: string) => {
  const mod = await getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: "You are Dr. Philippe Pinel, a compassionate and expert psychiatrist in the city of Mooderia. You provide helpful advice for mental well-being while maintaining a professional yet friendly tone.",
    }
  });
  return { text: response.text };
};

export const getHoroscope = async (sign: string) => {
  await getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a daily horoscope for ${sign} today.`,
    config: {
      systemInstruction: "You are an expert astrologer. Provide a 3-sentence horoscope that is encouraging and insightful.",
    }
  });
  return response.text;
};

export const getLovePrediction = async (sign1: string, sign2: string) => {
    const mod = await getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Predict love compatibility between ${sign1} and ${sign2}. Return only a JSON object with 'percentage' (0-100) and 'reason'.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: mod.Type.OBJECT,
                properties: {
                    percentage: { type: mod.Type.NUMBER },
                    reason: { type: mod.Type.STRING }
                },
                required: ['percentage', 'reason']
            }
        }
    });
    
    return JSON.parse(response.text.trim());
}

export const getTellerResponse = async (question: string) => {
  await getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict the answer to this question: ${question}`,
    config: {
      systemInstruction: "You are a mystical fortune teller. You must answer ONLY starting with one of these five categories: [YES, NO, MAYBE, BIG YES, BIG NO]. After the category, add a very short, poetic, and mysterious sentence. Example: 'YES. The moon smiles upon your path.'",
    }
  });
  return response.text;
};
