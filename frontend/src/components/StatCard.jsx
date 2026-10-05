import React from 'react';
import { Activity, CheckCircle, AlertTriangle, ShieldX } from 'lucide-react';

export const StatCard = ({ stats }) => {
  const { total = 0, allowed = 0, flagged = 0, blocked = 0, avgRiskScore = 0 } = stats || {};

  const cards = [
    {
      title: 'Total Requests',
      value: total,
      subtitle: `${avgRiskScore} Avg Risk Score`,
      icon: Activity,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      badgeBg: 'bg-cyan-500/20 text-cyan-300'
    },
    {
      title: 'Allowed Requests',
      value: allowed,
      subtitle: total > 0 ? `${Math.round((allowed / total) * 100)}% of Traffic` : '0% Traffic',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      badgeBg: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      title: 'Flagged Requests',
      value: flagged,
      subtitle: 'Medium Risk (31-60)',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badgeBg: 'bg-amber-500/20 text-amber-300'
    },
    {
      title: 'Blocked Requests',
      value: blocked,
      subtitle: 'High Risk (61-100)',
      icon: ShieldX,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      badgeBg: 'bg-rose-500/20 text-rose-300'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`cyber-card flex flex-col justify-between ${c.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold tracking-tight text-white font-mono">
                {c.value}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badgeBg}`}>
                {c.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
