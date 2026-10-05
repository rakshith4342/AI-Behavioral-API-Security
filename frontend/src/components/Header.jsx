import React from 'react';
import { Shield, RefreshCw, Cpu, Layers, Activity } from 'lucide-react';

export const Header = ({ onReset, onRefresh, isRefreshing }) => {
  return (
    <header className="cyber-header px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title and Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                AI-Powered Behavioral API Security <span className="text-cyan-400">Platform</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PROTOTYPE v1.0 (ROUND 2)
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
              <span>Rule-Based Security Engine</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE MONITORING
              </span>
            </p>
          </div>
        </div>

        {/* System Info Badges & Action Buttons */}
        <div className="flex items-center gap-3">
          
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs">
            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phase 1: Rule Engine (Active)</span>
            </div>
            <span className="text-gray-600">|</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Phase 2: ML Anomaly Detection (Planned)</span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary text-xs px-3 py-2"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onReset}
            className="btn btn-danger text-xs px-3 py-2"
            title="Clear all logs & security counters"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
};
