
import { useState, useEffect } from 'react';
import { FavoriteItem, NASA_APOD, AI_Insight } from '../types';

/**
 * @hook useFavorites
 * @description Gestiona la bitácora personal del usuario utilizando localStorage.
 * Permite guardar y eliminar descubrimientos astronómicos para consulta offline o futura.
 */
export const useFavorites = () => {
  /**
   * Inicialización perezosa (Lazy State): Solo leemos el disco una vez al cargar la app.
   */
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem('adhara_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  /**
   * @function toggleFavorite
   * @description Agrega o elimina un item de la bitácora basándose en su existencia previa.
   * @param {NASA_APOD} apod - Datos de la NASA.
   * @param {AI_Insight | null} insight - Análisis de la IA (obligatorio para guardar).
   */
  const toggleFavorite = (apod: NASA_APOD, insight: AI_Insight | null) => {
    if (!insight) return; 

    setFavorites(prev => {
      const exists = prev.some(f => f.apod.date === apod.date);
      let newFavs;
      
      if (exists) {
        newFavs = prev.filter(f => f.apod.date !== apod.date);
      } else {
        newFavs = [{ apod, insight }, ...prev];
      }
      
      // Persistencia en el navegador
      localStorage.setItem('adhara_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  /**
   * @function isFavorite
   * @description Comprueba si un descubrimiento ya está en la bitácora por su fecha.
   */
  const isFavorite = (date: string) => favorites.some(f => f.apod.date === date);

  return { favorites, toggleFavorite, isFavorite };
};
