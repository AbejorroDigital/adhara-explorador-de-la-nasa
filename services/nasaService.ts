import { NASA_APOD } from '../types';

/**
 * Determinamos la clave de la API de forma dinámica.
 * Intentamos recuperar 'APY_KEY' (según tu configuración en Vercel) 
 * con los prefijos estándar de los frameworks modernos.
 */
const NASA_KEY = (
  import.meta.env?.VITE_APY_KEY || 
  process.env?.NEXT_PUBLIC_APY_KEY || 
  'DEMO_KEY'
) as string;

/** * Configuración base para la comunicación con la API de la NASA.
 */
const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';

// Exportamos la clave si es necesaria en otros módulos, 
// o la usamos internamente en las funciones de fetch.
export const API_KEY = NASA_KEY;

/**
 * @function getNASADate
 * @description Calcula una fecha segura para consultar la API de la NASA.
 * @param {number} offsetDays - Días de retroceso desde hoy.
 * @returns {string} Fecha formateada como YYYY-MM-DD en la zona horaria de Nueva York.
 * 
 * NOTA: Es crítico usar 'America/New_York' porque la NASA publica sus actualizaciones
 * basándose en su hora local (EST/EDT). Sin esto, usuarios en zonas horarias adelantadas
 * (como Europa o Asia) recibirían errores 400 al pedir una fecha que "aún no existe" para la NASA.
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
 * @param {string} [date] - Fecha opcional (YYYY-MM-DD). Si no se provee, busca la más reciente.
 * @param {AbortSignal} [signal] - Señal para cancelar la petición fetch si el componente se desmonta.
 * @returns {Promise<NASA_APOD>} Datos de la imagen astronómica.
 * @throws Error si la conexión falla o se alcanzan los límites de la API.
 */
export const fetchAPOD = async (date?: string, signal?: AbortSignal): Promise<NASA_APOD> => {
  const requestDate = date || getNASADate();
  
  const url = new URL(NASA_API_BASE);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('date', requestDate);

  try {
    const response = await fetch(url.toString(), { signal });
    
    // Gestión automática de retrasos en la publicación:
    // Si la NASA aún no ha subido la imagen de hoy, retrocedemos un día automáticamente.
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
    if (err.name === 'AbortError') throw err;
    if (err.message.includes('Failed to fetch')) {
      throw new Error('No se pudo contactar con la NASA. Revisa tu conexión o bloqueadores de anuncios.');
    }
    throw err;
  }
};

/**
 * @function fetchRandomAPOD
 * @description Obtiene una imagen astronómica aleatoria de los archivos históricos de la NASA.
 * @param {AbortSignal} [signal] - Señal de cancelación.
 * @returns {Promise<NASA_APOD[]>} Array con un objeto APOD aleatorio.
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
