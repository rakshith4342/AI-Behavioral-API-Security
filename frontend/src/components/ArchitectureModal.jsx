import React from 'react';
import { Cpu, ShieldCheck, Database, Brain, ArrowRight } from 'lucide-react';

export const ArchitectureModal = () => {
  return (
    <div className="cyber-card mb-6 border-cyan-500/20">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Security Architecture & Request Inspection Pipeline</h2>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
          Engine: Rule-Based Risk Classifier
        </span>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        
        {/* Step 1 */}
        <div className="bg-gray-900/90 p-3 rounded-lg border border-gray-800 flex flex-col items-center text-center">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mb-2">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">1. React Dashboard</span>
          <span className="text-[10px] text-gray-400 mt-1">API Client Request</span>
        </div>

        {/* Step 2 */}
        <div className="bg-gray-900/90 p-3 rounded-lg border border-cyan-500/30 flex flex-col items-center text-center">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-cyan-300">2. Security Middleware</span>
          <span className="text-[10px] text-gray-400 mt-1">Express.js Interceptor</span>
        </div>

        {/* Step 3: Rule Engine */}
        <div className="bg-gray-900/90 p-3 rounded-lg border border-emerald-500/30 flex flex-col items-center text-center">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-emerald-300">3. Basic Rule Engine</span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1">ACTIVE (Phase 1)</span>
          <span className="text-[10px] text-gray-400">Rate Limits / Auth / Patterns</span>
        </div>

        {/* Step 4: Future ML Anomaly Engine */}
        <div className="bg-purple-950/30 p-3 rounded-lg border border-purple-500/30 flex flex-col items-center text-center">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mb-2">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-purple-300">4. ML Anomaly Engine</span>
          <span className="text-[10px] text-purple-300 font-semibold mt-1">PLANNED (Phase 2)</span>
          <span className="text-[10px] text-gray-400">Python + Scikit-Learn Isolation Forest</span>
        </div>

        {/* Step 5: Action & Mongo */}
        <div className="bg-gray-900/90 p-3 rounded-lg border border-gray-800 flex flex-col items-center text-center">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mb-2">
            <Database className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">5. Action & Audit Log</span>
          <span className="text-[10px] text-gray-400 mt-1">ALLOW / FLAG / BLOCK ➔ MongoDB</span>
        </div>

      </div>

      {/* Breakdown Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        <div className="p-3.5 rounded-lg bg-gray-900/60 border border-gray-800">
          <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Current Prototype: Rule-Based Security Engine
          </h4>
          <p className="text-gray-300 leading-relaxed">
            Interprets API requests against static rules: rate limits per IP sliding window, repeated failed login counters, authorization token checks for <code className="text-cyan-300">/api/admin</code>, and payload pattern checks. Calculates a <b>Rule-Based Risk Score</b> (0-100) to ALLOW, FLAG, or BLOCK traffic.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/40">
          <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
            <Brain className="w-4 h-4" /> Future Architecture: Behavioral Isolation Forest ML (Planned)
          </h4>
          <p className="text-gray-300 leading-relaxed">
            In future phases, a Python microservice utilizing <b>Scikit-learn Isolation Forest</b> will analyze multi-dimensional feature vectors (entropy, request bursts, path variance) after basic rule checks to detect subtle behavioral anomalies that rule-based systems miss.
          </p>
        </div>

      </div>
    </div>
  );
};
