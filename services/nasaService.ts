import { NASA_APOD } from '../types';

/**
 * @function getApiKey
 * @description Rastrea la clave de la API de la NASA a través de los posibles entornos de construcción.
 * Previene que el empaquetador falle al buscar en las variables de Vite o Next.js.
 */
const getApiKey = (): string => {
  const key = 
    (import.meta.env?.VITE_APY_KEY) || 
    (process.env?.NEXT_PUBLIC_APY_KEY) || 
    (process.env?.APY_KEY);

  return key; 
};

/** * Única fuente de la verdad para la clave de la API en este archivo.
 * Se exporta por si otros servicios la requieren.
 */
export const API_KEY = getApiKey();

/** Configuración base de la API planetaria */
const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';

/**
 * @function getNASADate
 * @description Calcula una fecha segura para consultar la API de la NASA.
 * @param {number} offsetDays - Días de retroceso desde hoy.
 * @returns {string} Fecha formateada como YYYY-MM-DD en la zona horaria de Nueva York.
 */
const getNASADate = (offsetDays = 1): string => {
  const now = new Date();
  now.setDate(now.getDate() - offsetDays);
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
};

/**
 * @function fetchAPOD
 * @description Recupera la imagen del día de la NASA para una fecha específica.
 */
export const fetchAPOD = async (date?: string, signal?: AbortSignal): Promise<NASA_APOD> => {
  const requestDate = date || getNASADate();
  
  const url = new URL(NASA_API_BASE);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('date', requestDate);

  try {
    const response = await fetch(url.toString(), { signal });
    
    // Gestión automática de retrasos en la publicación
    if ((response.status === 400 || response.status === 404) && !date) {
      console.warn("Imagen de hoy no disponible, intentando ayer...");
      return fetchAPOD(getNASADate(1), signal);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('Límite de API alcanzado. Verifica que tu clave personalizada esté activa.');
      }
      throw new Error(errorData.msg || `Error de la NASA (${response.status})`);
    }

    return response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    if (err.message.includes('Failed to fetch')) {
      throw new Error('No se pudo contactar con la NASA. Revisa tu conexión o bloqueadores de anuncios.');
    }
    throw err;
  }
};

/**
 * @function fetchRandomAPOD
 * @description Obtiene una imagen astronómica aleatoria.
 */
export const fetchRandomAPOD = async (signal?: AbortSignal): Promise<NASA_APOD[]> => {
  const url = new URL(NASA_API_BASE);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('count', '1');
  
  const response = await fetch(url.toString(), { signal });
  
  if (!response.ok) {
    throw new Error('Error al obtener datos aleatorios.');
  }
  return response.json();
};
