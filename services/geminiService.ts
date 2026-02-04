export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  // --- LLAMADA 1: INVESTIGACIÓN Y ANÁLISIS ---
  // Aquí no nos importa el idioma, solo extraer los datos y las fuentes.
  const researchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this astronomical event: "${title}". Description: "${explanation}". 
    Use Google Search for recent scientific context (2023-2025).`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const rawAnalysis = researchResponse.text;
  
  // Extraer fuentes de Grounding de la primera llamada
  const news: any[] = [];
  const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        news.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  // --- LLAMADA 2: TRADUCCIÓN Y FORMATEO ---
  // Ahora enviamos el análisis crudo para que sea procesado estrictamente en español.
  const finalResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Eres un divulgador científico experto en español. 
    Toma el siguiente análisis y tradúcelo/redáctalo COMPLETAMENTE al ESPAÑOL.
    
    ANÁLISIS A PROCESAR:
    ${rawAnalysis}
    
    DATOS ORIGINALES:
    Título: ${title}
    Explicación: ${explanation}
    
    REGLA DE ORO: No uses inglés en el resultado final.`,
    config: {
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

  const baseInsight = JSON.parse(finalResponse.text.trim());

  return {
    ...baseInsight,
    recentNews: news.slice(0, 3)
  };
};
