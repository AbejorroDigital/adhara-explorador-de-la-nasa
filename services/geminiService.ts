
import { GoogleGenAI, Type } from "@google/genai";
import { AI_Insight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza este fenómeno astronómico: "${title}". 
    Proporciona un análisis profundo y una traducción al español (Es muy importante que sea en español tu respuesta).
    Además, utiliza la búsqueda de Google para encontrar 2 o 3 enlaces a noticias o artículos científicos RECIENTES (2023-2025) específicamente sobre este objeto o misión espacial.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedTitle: { type: Type.STRING },
          translatedExplanation: { type: Type.STRING },
          reflection: { type: Type.STRING },
          scientificContext: { type: Type.STRING },
          philosophicalPerspective: { type: Type.STRING },
          suggestedReading: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["translatedTitle", "translatedExplanation", "reflection", "scientificContext", "philosophicalPerspective", "suggestedReading"]
      }
    }
  });

  const baseInsight = JSON.parse(response.text.trim());
  
  // Extraer fuentes de Grounding si existen
  const news: any[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        news.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }

  return {
    ...baseInsight,
    recentNews: news.slice(0, 3)
  };
};
