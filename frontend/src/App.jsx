import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { RequestSimulator } from './components/RequestSimulator';
import { LiveLogsTable } from './components/LiveLogsTable';
import { ArchitectureModal } from './components/ArchitectureModal';
import { fetchLogsAndStats, resetSecurityLogs } from './services/api';

export function App() {
  const [stats, setStats] = useState({ total: 0, allowed: 0, flagged: 0, blocked: 0, avgRiskScore: 0 });
  const [logs, setLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchLogsAndStats();
    if (result && result.stats) {
      setStats(result.stats);
      setLogs(result.logs || []);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
    // Auto refresh logs every 2 seconds for live telemetry
    const timer = setInterval(loadData, 2000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleReset = async () => {
    if (window.confirm('Reset all security logs and rate limit counters for demo?')) {
      await resetSecurityLogs();
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col justify-between">
      
      <div>
        <Header onReset={handleReset} onRefresh={loadData} isRefreshing={isRefreshing} />

        <main className="max-w-7xl mx-auto px-6 pb-12">
          {/* Top KPI Metrics Cards */}
          <StatCard stats={stats} />

          {/* Interactive API Request Simulator & Risk Inspector */}
          <RequestSimulator onRequestComplete={loadData} />

          {/* System Architecture Diagram */}
          <ArchitectureModal />

          {/* Live MongoDB Security Logs Table */}
          <LiveLogsTable logs={logs} onRefresh={loadData} />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-4 text-center text-xs text-gray-500 bg-[#090d16]/90">
        <p>AI-Powered Behavioral API Security Platform • Hackathon Prototype Submission</p>
      </footer>

    </div>
  );
}

export default App;
