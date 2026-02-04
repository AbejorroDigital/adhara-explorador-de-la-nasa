
import { GoogleGenAI, Type } from "@google/genai";
import { AI_Insight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Actúa como un astrónomo experto de habla hispana. Analiza este fenómeno". 
    Toda tu respuesta DEBE estar en español, sin excepciones.

    TU MISIÓN:
    Recibirás datos en INGLÉS de la NASA y deberás transformarlos COMPLETAMENTE al ESPAÑOL.
    
    DATOS DE ENTRADA (NASA):
    - Título original: ${title}
    - Descripción original: ${explanation}
    
    INSTRUCCIONES DE SALIDA:
    1. Traduce y expande el contenido al español con un tono poético y científico.
    2. Los campos del JSON DEBEN estar escritos en español.
    3. No utilices ni una sola palabra en inglés en tu respuesta final.
    Usa la búsqueda de Google para encontrar fuentes científicas recientes (2023-2025).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedTitle: { 
            type: Type.STRING, 
            description: "El título del objeto traducido al español." 
          },
          translatedExplanation: { 
            type: Type.STRING, 
            description: "Explicación detallada en español." 
          },
          reflection: { 
            type: Type.STRING, 
            description: "Reflexión profunda redactada en español." 
          },
          scientificContext: { 
            type: Type.STRING, 
            description: "Contexto científico actual en español." 
          },
          philosophicalPerspective: { 
            type: Type.STRING, 
            description: "Perspectiva filosófica en español." 
          },
          suggestedReading: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Títulos de lecturas recomendadas en español."
          }
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
