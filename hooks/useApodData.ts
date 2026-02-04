
import { useState, useEffect, useCallback, useRef } from 'react';
import { NASA_APOD, AI_Insight } from '../types';
import { fetchAPOD, fetchRandomAPOD } from '../services/nasaService';
import { generateCosmicInsight } from '../services/geminiService';

interface ApodDataState {
  apod: NASA_APOD | null;
  insight: AI_Insight | null;
  loading: boolean;
  insightLoading: boolean;
  error: string | null;
}

export const useApodData = (initialDate: string) => {
  const [state, setState] = useState<ApodDataState>({
    apod: null,
    insight: null,
    loading: true,
    insightLoading: false,
    error: null
  });

  const [date, setDate] = useState(initialDate);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (targetDate?: string, isRandom = false) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({ ...prev, loading: true, error: null, insight: null }));

    try {
      let apodData: NASA_APOD;
      
      if (isRandom) {
        const result = await fetchRandomAPOD(signal);
        apodData = result[0];
        setDate(apodData.date);
      } else {
        // Si targetDate es undefined, fetchAPOD maneja la fecha por defecto
        apodData = await fetchAPOD(targetDate, signal);
        if (targetDate) setDate(targetDate);
        else setDate(apodData.date); // Sincronizar fecha si hubo fallback
      }

      setState(prev => ({ ...prev, apod: apodData, loading: false, insightLoading: true }));

      // Llamada a IA (no bloqueante para la UI principal, pero sí rastreable)
      try {
        const aiData = await generateCosmicInsight(apodData.title, apodData.explanation);
        if (!signal.aborted) {
          setState(prev => ({ ...prev, insight: aiData, insightLoading: false }));
        }
      } catch (aiErr) {
        console.error("IA Error", aiErr);
        if (!signal.aborted) {
          setState(prev => ({ ...prev, insightLoading: false }));
        }
      }

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        insightLoading: false, 
        error: err.message || 'Error desconocido' 
      }));
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadData(date);
    return () => abortControllerRef.current?.abort();
  }, []); // Solo al montar, luego controlamos con loadData

  return { ...state, date, setDate, loadData };
};
