import React, { useState } from 'react';
import { Database, Filter, Search, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export const LiveLogsTable = ({ logs = [], onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    // Filter status match
    if (filterStatus !== 'ALL' && log.status !== filterStatus) {
      return false;
    }
    // Search query match (endpoint, ip, reason)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const endpointMatch = log.endpoint?.toLowerCase().includes(q);
      const ipMatch = log.ip?.toLowerCase().includes(q);
      const reasonMatch = log.reason?.toLowerCase().includes(q);
      return endpointMatch || ipMatch || reasonMatch;
    }
    return true;
  });

  const getMethodBadgeClass = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'POST': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ALLOWED':
        return (
          <span className="badge badge-low">
            <ShieldCheck className="w-3 h-3" /> ALLOWED
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="badge badge-med">
            <ShieldAlert className="w-3 h-3" /> FLAGGED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="badge badge-high">
            <ShieldX className="w-3 h-3" /> BLOCKED
          </span>
        );
      default:
        return <span className="badge badge-low">{status}</span>;
    }
  };

  return (
    <div className="cyber-card">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white">Live MongoDB Security Logs</h2>
            <p className="text-xs text-gray-400">Real-time audit log of intercepted API traffic</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP / endpoint / reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg text-xs pl-8 pr-3 py-1.5 text-white outline-none focus:border-cyan-400 w-48"
            />
          </div>

          {/* Filter Status Buttons */}
          <div className="flex items-center bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-xs">
            {['ALL', 'ALLOWED', 'FLAGGED', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="cyber-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Client IP</th>
              <th>Risk Score</th>
              <th>Status / Action</th>
              <th>Triggered Security Reason</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const dateStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString()
                  : new Date().toLocaleTimeString();
                
                const score = log.riskScore || 0;
                
                return (
                  <tr key={log._id || index}>
                    <td className="font-mono text-xs text-gray-400 whitespace-nowrap">{dateStr}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getMethodBadgeClass(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-semibold text-gray-200">{log.endpoint}</td>
                    <td className="font-mono text-xs text-gray-400">{log.ip}</td>
                    
                    {/* Risk Score Indicator */}
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${
                          score >= 61 ? 'text-rose-400' : score >= 31 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {score}
                        </span>
                        <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              score >= 61 ? 'bg-rose-500' : score >= 31 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(score, 10)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>{getStatusBadge(log.status)}</td>
                    <td className="text-xs text-gray-300 max-w-xs truncate" title={log.reason}>
                      {log.reason || 'Normal Request'}
                    </td>
                    <td className="font-mono text-xs text-gray-400 whitespace-nowrap">
                      {log.responseTime || 0}ms
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500 text-xs">
                  No security logs found matching criteria. Trigger an API test request above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
