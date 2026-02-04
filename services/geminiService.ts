export const generateCosmicInsight = async (title: string, explanation: string): Promise<AI_Insight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Eres un astrofísico de habla hispana. Tu misión es analizar y traducir datos de la NASA.
    
    ENTRADA (INGLÉS):
    Título: "${title}"
    Explicación: "${explanation}"

    TAREA:
    1. Traduce y expande la información al ESPAÑOL.
    2. Usa Google Search para buscar hitos científicos recientes (2023-2025).
    3. Responde estrictamente en ESPAÑOL dentro del JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      // Mantenemos una temperatura baja para evitar que se desvíe al inglés
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          // Usamos nombres en español para forzar el idioma en la IA
          titulo: { type: Type.STRING },
          explicacion: { type: Type.STRING },
          reflexion: { type: Type.STRING },
          contexto_cientifico: { type: Type.STRING },
          perspectiva: { type: Type.STRING },
          lecturas: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["titulo", "explicacion", "reflexion", "contexto_cientifico", "perspectiva", "lecturas"]
      }
    }
  });

  const rawJson = JSON.parse(response.text.trim());

  // --- EL MAPEO: Aquí protegemos tu lógica ---
  // Convertimos los nombres en español de la IA a los nombres en inglés de tu App
  const baseInsight: any = {
    translatedTitle: rawJson.titulo,
    translatedExplanation: rawJson.explicacion,
    reflection: rawJson.reflexion,
    scientificContext: rawJson.contexto_cientifico,
    philosophicalPerspective: rawJson.perspectiva,
    suggestedReading: rawJson.lecturas
  };

  // Extraer fuentes de Grounding
  const news: any[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        news.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  return {
    ...baseInsight,
    recentNews: news.slice(0, 3)
  } as AI_Insight;
};
