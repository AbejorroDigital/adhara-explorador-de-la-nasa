
import { NASA_APOD } from '../types';

const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';
const API_KEY = 'DEMO_KEY'; 

/**
 * Obtiene la fecha actual ajustada a la zona horaria de Nueva York (America/New_York),
 * que es la que utiliza la NASA. Esto evita pedir imágenes del "futuro"
 * cuando en la zona del usuario ya es el día siguiente.
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

export const fetchAPOD = async (date?: string, signal?: AbortSignal): Promise<NASA_APOD> => {
  // Si no hay fecha, usamos la fecha segura de NY.
  const requestDate = date || getNASADate();
  
  const url = new URL(NASA_API_BASE);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('date', requestDate);

  try {
    const response = await fetch(url.toString(), { signal });
    
    // Si falla con 400/404 y no pedimos una fecha específica (es decir, pedimos "hoy"),
    // probablemente la imagen de hoy aún no se ha subido. Intentamos con ayer.
    if ((response.status === 400 || response.status === 404) && !date) {
      console.warn("Imagen de hoy no disponible, intentando ayer...");
      return fetchAPOD(getNASADate(1), signal);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error('Límite de API alcanzado (DEMO_KEY). Intenta de nuevo más tarde.');
      }
      throw new Error(errorData.msg || `Error de la NASA (${response.status})`);
    }

    return response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err; // Re-lanzar para manejar cancelación
    }
    if (err.message.includes('Failed to fetch')) {
      throw new Error('No se pudo contactar con la NASA. Revisa tu conexión o bloqueadores de anuncios.');
    }
    throw err;
  }
};

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
