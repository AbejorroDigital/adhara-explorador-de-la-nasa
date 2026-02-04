
import React from 'react';
import { AI_Insight } from '../types';
import { SparklesIcon } from './LucideIcons';

interface InsightPanelProps {
  insight: AI_Insight | null;
  loading: boolean;
}

const InsightPanel: React.FC<InsightPanelProps> = ({ insight, loading }) => {
  if (loading && !insight) {
    return (
      <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg"></div>
          <div className="h-4 bg-indigo-500/10 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          <div className="h-3 bg-white/5 rounded w-full"></div>
          <div className="h-3 bg-white/5 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <SparklesIcon className="w-48 h-48 text-indigo-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <SparklesIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg md:text-xl font-space font-bold text-indigo-300 tracking-tight uppercase">Bitácora de Inteligencia</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em] mb-3">Reflexión Profunda</h4>
              <p className="text-lg md:text-xl text-slate-100 font-light leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                "{insight.reflection}"
              </p>
            </section>
            
            <section>
              <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em] mb-3">Contexto Científico</h4>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {insight.scientificContext}
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em] mb-3">Perspectiva Humana</h4>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {insight.philosophicalPerspective}
              </p>
            </section>

            {insight.recentNews && insight.recentNews.length > 0 && (
              <section>
                <h4 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] mb-4">Investigación en Tiempo Real</h4>
                <div className="space-y-3">
                  {insight.recentNews.map((news, idx) => (
                    <a 
                      key={idx} 
                      href={news.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group/link"
                    >
                      <p className="text-xs text-slate-300 font-medium group-hover/link:text-indigo-300 line-clamp-1">
                        {news.title}
                      </p>
                      <span className="text-[9px] text-slate-500 uppercase">Ver fuente original</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
            
            <section>
              <h4 className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-[0.2em] mb-4">Conceptos Clave</h4>
              <div className="flex flex-wrap gap-2">
                {insight.suggestedReading.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightPanel;
