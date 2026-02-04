
import { useState, useEffect } from 'react';
import { FavoriteItem, NASA_APOD, AI_Insight } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem('adhara_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleFavorite = (apod: NASA_APOD, insight: AI_Insight | null) => {
    if (!insight) return; // Requerimos el insight para guardar

    setFavorites(prev => {
      const exists = prev.some(f => f.apod.date === apod.date);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(f => f.apod.date !== apod.date);
      } else {
        newFavs = [{ apod, insight }, ...prev];
      }
      localStorage.setItem('adhara_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (date: string) => favorites.some(f => f.apod.date === date);

  return { favorites, toggleFavorite, isFavorite };
};
