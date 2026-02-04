
import React, { useState } from 'react';
import { NASA_APOD, AI_Insight } from '../types';
import { CloseIcon, HeartIcon, ShareIcon, DownloadIcon } from './LucideIcons';

interface ApodViewerProps {
  apod: NASA_APOD;
  insight: AI_Insight | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const ApodViewer: React.FC<ApodViewerProps> = ({ apod, insight, isFavorite, onToggleFavorite }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `Adhara: ${insight?.translatedTitle || apod.title}`,
      text: `Mira este descubrimiento cósmico: ${insight?.reflection || ''}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log(err); }
    } else {
      // Fallback simple: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <>
      {/* Lightbox / Zoom Overlay */}
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
            alt="Vista HD"
          />
        </div>
      )}

      {/* Main Card */}
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

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

        <div className="absolute bottom-6 right-6 flex gap-3 z-10">
          <button 
            onClick={onToggleFavorite}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all border active:scale-95 ${
              isFavorite 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <HeartIcon className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
            title="Compartir"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          {apod.hdurl && (
            <a 
              href={apod.hdurl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95"
              title="Descargar HD"
            >
              <DownloadIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </>
  );
};
