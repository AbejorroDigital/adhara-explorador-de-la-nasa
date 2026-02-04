
import React from 'react';
import { useApodData } from './hooks/useApodData';
import { useFavorites } from './hooks/useFavorites';
import InsightPanel from './components/InsightPanel';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ApodViewer } from './components/ApodViewer';
import { CalendarIcon, RefreshIcon, SparklesIcon } from './components/LucideIcons';

const App: React.FC = () => {
  // Inicializamos con la fecha actual (el servicio la ajustará si es necesario)
  const today = new Date().toISOString().split('T')[0];
  
  const { 
    apod, 
    insight, 
    loading, 
    insightLoading, 
    error, 
    date, 
    loadData 
  } = useApodData(today);

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      loadData(e.target.value, false);
    }
  };

  const loadRandom = () => loadData(undefined, true);
  const retry = () => loadData(date, false);

  const handleFavoriteClick = () => {
    if (apod) toggleFavorite(apod, insight);
  };

  const handleHistoryClick = (fav: typeof favorites[0]) => {
    // Scroll arriba y cargar los datos del favorito
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Aquí podríamos implementar una función en useApodData para "setear" datos directamente
    // pero para simplicidad, recargamos por fecha
    loadData(fav.apod.date, false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="w-full max-w-6xl px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <SparklesIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-space font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            ADHARA
          </h1>
        </div>

        <div className="flex items-center w-full sm:w-auto gap-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-xl">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border-r border-white/5">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={handleDateChange}
              max={today}
              className="bg-transparent text-sm text-slate-200 outline-none w-full appearance-none"
            />
          </div>
          <button
            onClick={loadRandom}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
            title="Imagen aleatoria"
          >
            <RefreshIcon className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl px-4 py-8 flex-1 space-y-12 z-10">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-8 rounded-3xl text-center space-y-4">
            <p className="font-medium">{error}</p>
            <button 
              onClick={retry}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors font-bold text-sm"
            >
              REINTENTAR
            </button>
          </div>
        ) : loading || !apod ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ApodViewer 
              apod={apod} 
              insight={insight} 
              isFavorite={isFavorite(apod.date)}
              onToggleFavorite={handleFavoriteClick}
            />

            {/* Info Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-500/20">
                  {apod.date}
                </span>
                {apod.copyright && (
                  <span className="text-xs text-slate-500 italic">© {apod.copyright}</span>
                )}
              </div>
              <h2 className="text-3xl md:text-5xl font-space font-bold text-white tracking-tight leading-tight">
                {insight?.translatedTitle || apod.title}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-3xl font-light">
                {insight?.translatedExplanation || apod.explanation}
              </p>
            </div>
            
            <InsightPanel insight={insight} loading={insightLoading} />

            {/* Favorites Strip */}
            {favorites.length > 0 && (
              <section className="pt-12 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6">Bitácora Guardada</h3>
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar scroll-smooth">
                  {favorites.map((fav, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleHistoryClick(fav)}
                      className="flex-shrink-0 w-32 cursor-pointer group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden border border-white/10 mb-2 relative">
                        {fav.apod.media_type === 'image' ? (
                          <img src={fav.apod.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-[10px] uppercase">Video</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-colors" />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-medium group-hover:text-indigo-400 transition-colors">
                        {fav.insight.translatedTitle || fav.apod.title}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="w-full py-12 px-4 border-t border-white/5 bg-slate-950/50 mt-auto backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-600 text-[10px] uppercase tracking-widest">
            Adhara v2.1 • Gemini 2.5 • NASA Open API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
