
import React, { useState } from 'react';
import { NASA_APOD, AI_Insight } from '../types';
import { CloseIcon, HeartIcon, ShareIcon, DownloadIcon } from './LucideIcons';

/**
 * @interface ApodViewerProps
 */
interface ApodViewerProps {
  apod: NASA_APOD;           // Datos de la NASA a renderizar
  insight: AI_Insight | null; // Datos de la IA para el sistema de compartición
  isFavorite: boolean;       // Estado visual del botón favorito
  onToggleFavorite: () => void; // Acción para guardar/quitar
}

/**
 * @component ApodViewer
 * @description Componente responsable de la renderización del contenido multimedia.
 * Gestiona el modo pantalla completa (Lightbox) y las acciones rápidas de usuario.
 */
export const ApodViewer: React.FC<ApodViewerProps> = ({ apod, insight, isFavorite, onToggleFavorite }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  /**
   * @function handleShare
   * @description Utiliza la Web Share API nativa si está disponible,
   * permitiendo compartir el descubrimiento en aplicaciones como WhatsApp o Twitter.
   */
  const handleShare = async () => {
    const shareData = {
      title: `Adhara: ${insight?.translatedTitle || apod.title}`,
      text: `Mira este descubrimiento cósmico: ${insight?.reflection || ''}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try { 
        await navigator.share(shareData); 
      } catch (err) { 
        console.log("Error al compartir:", err); 
      }
    } else {
      // Fallback para navegadores de escritorio que no soportan Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles. ¡Compártelo con quien quieras!');
    }
  };

  return (
    <>
      {/**
       * OVERLAY DE ZOOM (Lightbox)
       * Se activa al hacer clic en una imagen. Utiliza desenfoque y fondo oscuro para foco total.
       */}
      {isZoomed && apod.media_type === 'image' && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <CloseIcon className="w-6 h-6 text-white" />
          </button>
          <img 
            src={apod.hdurl || apod.url} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            alt="Vista de alta resolución"
          />
        </div>
      )}

      {/**
       * CONTENEDOR PRINCIPAL
       * Maneja la distinción entre imagen y video (iframe de YouTube/Vimeo usualmente).
       */}
      <div className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-3xl">
        {apod.media_type === 'image' ? (
          <div className="cursor-zoom-in relative" onClick={() => setIsZoomed(true)}>
            <img 
              src={apod.url} 
              alt={apod.title}
              className="w-full h-auto max-h-[70vh] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ) : (
          <div className="aspect-video w-full">
            <iframe 
              src={apod.url} 
              title={apod.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Degradado inferior para mejorar legibilidad de botones flotantes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/**
         * PANEL DE ACCIONES FLOTANTES
         * Botones estilizados con efecto de cristal (glassmorphism).
         */}
        <div className="absolute bottom-6 right-6 flex gap-3 z-10">
          <button 
            onClick={onToggleFavorite}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all border active:scale-95 ${
              isFavorite 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
          >
            <HeartIcon className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          {apod.hdurl && (
            <a 
              href={apod.hdurl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
            >
              <DownloadIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
};
