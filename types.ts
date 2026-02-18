
/**
 * @interface NASA_APOD
 * @description Estructura de datos devuelta por la API "Astronomy Picture of the Day" de la NASA.
 */
export interface NASA_APOD {
  date: string;          // Fecha de la imagen (YYYY-MM-DD)
  explanation: string;   // Explicación técnica original en inglés
  hdurl?: string;        // URL de la versión en alta definición (opcional)
  media_type: 'image' | 'video'; // Tipo de contenido multimedia
  service_version: string;
  title: string;         // Título original de la obra
  url: string;           // URL de la imagen o video (versión estándar)
  copyright?: string;    // Créditos de autoría (opcional)
}

/**
 * @interface GroundingSource
 * @description Representa una fuente de información externa recuperada mediante Google Search.
 */
export interface GroundingSource {
  title: string; // Título del sitio web o artículo
  uri: string;   // Enlace directo a la fuente
}

/**
 * @interface AI_Insight
 * @description Objeto enriquecido generado por Gemini AI tras analizar los datos de la NASA.
 */
export interface AI_Insight {
  translatedTitle: string;        // Título traducido y adaptado al español
  translatedExplanation: string;  // Explicación principal en español
  reflection: string;             // Reflexión inspiracional o poética del fenómeno
  scientificContext: string;      // Datos científicos adicionales aportados por la IA
  philosophicalPerspective: string; // Conexión del fenómeno con la experiencia humana
  suggestedReading: string[];     // Etiquetas o conceptos clave para investigar más
  recentNews?: GroundingSource[]; // Noticias de última hora relacionadas (vía Grounding)
}

/**
 * @interface FavoriteItem
 * @description Representa un descubrimiento guardado por el usuario en su bitácora local.
 */
export interface FavoriteItem {
  apod: NASA_APOD;    // Datos originales de la NASA
  insight: AI_Insight; // Análisis de la IA asociado
}
