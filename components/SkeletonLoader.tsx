
import React from 'react';
import { RefreshIcon } from './LucideIcons';

export const SkeletonLoader = () => (
  <div className="w-full space-y-8 animate-pulse">
    {/* Media Skeleton */}
    <div className="aspect-video w-full bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <RefreshIcon className="w-10 h-10 text-indigo-500/30 animate-spin" />
        <p className="text-slate-500 font-medium font-space text-xs tracking-widest">SINTONIZANDO SEÑAL...</p>
      </div>
    </div>
    
    {/* Text Skeleton */}
    <div className="space-y-4 px-2">
      <div className="h-4 bg-white/5 rounded w-32"></div>
      <div className="h-10 bg-white/5 rounded w-3/4"></div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);
