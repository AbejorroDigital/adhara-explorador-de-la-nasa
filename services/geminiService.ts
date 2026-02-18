
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
  // 1. Instanciamos el modelo con la configuración de sistema correcta
  const model = ai.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: "Eres un astrofísico y divulgador científico. Tu misión es traducir y analizar datos de la NASA. REGLA CRÍTICA: Toda tu respuesta DEBE estar en español, sin excepciones. Debes respetar estrictamente el esquema JSON proporcionado."
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{
          text: `Analiza este fenómeno astronómico:
          Título original: "${title}"
          Descripción técnica original: "${explanation}"
          
          Instrucciones adicionales:
          1. Traduce fielmente al español.
          2. Realiza un análisis profundo y filosófico.
          3. Busca noticias científicas recientes (2023-2026) sobre este objeto.`
        }]
      }
    ],
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

  // 2. Acceso correcto al texto generado
  const responseText = result.response.text();
  const baseInsight = JSON.parse(responseText.trim());
  
  const news: any[] = [];
  const groundingChunks = result.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
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
