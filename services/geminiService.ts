
import { GoogleGenAI, Type } from "@google/genai";
import { AI_Insight } from "../types";

/**
 * Inicialización del cliente de Google GenAI.
 * La clave se obtiene automáticamente del entorno configurado.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * @function generateCosmicInsight
 * @description Utiliza Gemini 3 para realizar una traducción creativa, un análisis científico
 * y una búsqueda web en tiempo real sobre el fenómeno astronómico proporcionado.
 * 
 * @param {string} title - Título original del APOD.
 * @param {string} explanation - Explicación técnica original.
 * @returns {Promise<AI_Insight>} Objeto con el análisis estructurado y noticias recientes.
 */
export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza este fenómeno astronómico: "${title}". 
    Proporciona una traducción al español y un análisis profundo.
    Además, utiliza la búsqueda de Google para encontrar 2 o 3 enlaces a noticias o artículos científicos RECIENTES (2023-2025) específicamente sobre este objeto o misión espacial.`,
    config: {
      // Activamos la herramienta de búsqueda de Google para obtener datos actualizados
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      // Definimos el esquema estricto para asegurar que la IA responda en el formato esperado
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

  // Parseo del contenido JSON generado por el modelo
  const baseInsight = JSON.parse(response.text.trim());
  
  /**
   * Extracción de Grounding Metadata:
   * Aquí recuperamos los enlaces reales de Google Search que la IA utilizó
   * para validar su respuesta o proporcionar contexto adicional.
   */
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
    recentNews: news.slice(0, 3) // Retornamos máximo 3 fuentes relevantes
  };
};
