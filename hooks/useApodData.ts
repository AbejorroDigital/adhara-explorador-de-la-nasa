
import { useState, useEffect, useCallback, useRef } from 'react';
import { NASA_APOD, AI_Insight } from '../types';
import { fetchAPOD, fetchRandomAPOD } from '../services/nasaService';
import { generateCosmicInsight } from '../services/geminiService';

/**
 * @interface ApodDataState
 * @description Estado interno que gestiona la carga de datos tanto de la NASA como de la IA.
 */
interface ApodDataState {
  apod: NASA_APOD | null;       // Datos brutos de la NASA
  insight: AI_Insight | null;    // Análisis enriquecido de Gemini
  loading: boolean;             // Indicador de carga para la petición principal
  insightLoading: boolean;      // Indicador de carga específico para la generación de la IA
  error: string | null;         // Mensaje de error si algo falla
}

/**
 * @hook useApodData
 * @description Hook personalizado que encapsula toda la lógica de obtención de datos astronómicos.
 * Implementa un AbortController para evitar "race conditions" y fugas de memoria al cambiar de fechas rápidamente.
 * 
 * @param {string} initialDate - Fecha con la que se inicializa el explorador.
 */
export const useApodData = (initialDate: string) => {
  const [state, setState] = useState<ApodDataState>({
    apod: null,
    insight: null,
    loading: true,
    insightLoading: false,
    error: null
  });

  const [date, setDate] = useState(initialDate);
  // Referencia para gestionar la cancelación de peticiones asíncronas
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * @function loadData
   * @description Función núcleo que orquesta las llamadas a la NASA y posteriormente a Gemini.
   */
  const loadData = useCallback(async (targetDate?: string, isRandom = false) => {
    // Abortar cualquier petición en curso antes de iniciar una nueva
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Resetear estados para una nueva carga limpia
    setState(prev => ({ ...prev, loading: true, error: null, insight: null }));

    try {
      let apodData: NASA_APOD;
      
      // Lógica diferenciada para carga aleatoria o por fecha específica
      if (isRandom) {
        const result = await fetchRandomAPOD(signal);
        apodData = result[0];
        setDate(apodData.date);
      } else {
        apodData = await fetchAPOD(targetDate, signal);
        if (targetDate) setDate(targetDate);
        else setDate(apodData.date); 
      }

      // Actualizar estado con datos de la NASA y proceder a la fase de IA
      setState(prev => ({ ...prev, apod: apodData, loading: false, insightLoading: true }));

      /**
       * FASE IA: Se ejecuta de forma independiente para no bloquear la visualización
       * de la imagen principal. El usuario puede ver la foto mientras la IA "piensa".
       */
      try {
        const aiData = await generateCosmicInsight(apodData.title, apodData.explanation);
        if (!signal.aborted) {
          setState(prev => ({ ...prev, insight: aiData, insightLoading: false }));
        }
      } catch (aiErr) {
        console.error("Error en la generación de IA:", aiErr);
        if (!signal.aborted) {
          setState(prev => ({ ...prev, insightLoading: false }));
        }
      }

    } catch (err: any) {
      // Si el error fue causado por una cancelación manual, no actualizamos el estado
      if (err.name === 'AbortError') return;
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        insightLoading: false, 
        error: err.message || 'Error desconocido al conectar con el cosmos' 
      }));
    }
  }, []);

  // Efecto de carga inicial al montar el componente
  useEffect(() => {
    loadData(date);
    return () => abortControllerRef.current?.abort(); // Limpieza al desmontar
  }, []); 

  return { ...state, date, setDate, loadData };
};
