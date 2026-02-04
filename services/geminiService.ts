export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  // --- LLAMADA 1: INVESTIGACIÓN (El cerebro científico) ---
  // Aquí dejamos que Gemini use Google Search libremente. 
  // No importa si genera esta parte interna en inglés.
  const researchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Thoroughly analyze this astronomical event for a scientific blog:
    Title: "${title}"
    Description: "${explanation}"
    Use Google Search to find scientific context and news from 2023-2025.`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const rawAnalysis = researchResponse.text;
  
  // Extraemos las noticias del Grounding de la primera llamada
  const news: any[] = [];
  const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        news.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  // --- LLAMADA 2: TRADUCCIÓN Y ESTILO (El poeta divulgador) ---
  // Esta llamada es pura y exclusivamente para el formateo final en español.
  // Al no tener herramientas (tools), Gemini se concentra solo en el idioma.
  const finalResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Eres un traductor y divulgador científico de primer nivel. 
    Tu objetivo es transformar el análisis adjunto en un JSON perfecto en español.
    
    ANÁLISIS TÉCNICO: ${rawAnalysis}
    TÍTULO ORIGINAL: ${title}
    DESCRIPCIÓN ORIGINAL: ${explanation}
    
    INSTRUCCIÓN CRÍTICA: Escribe TODO en español. No dejes términos en inglés.`,
    config: {
      temperature: 0.1, // Casi nada de aleatoriedad para evitar fugas de idioma
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

  // Parseamos el resultado final que ya viene con tus llaves originales
  const baseInsight = JSON.parse(finalResponse.text.trim());

  return {
    ...baseInsight,
    recentNews: news.slice(0, 3)
  };
};
