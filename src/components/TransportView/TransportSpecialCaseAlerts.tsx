import React from 'react';
import { TransportSpecialCase } from '../../core/transport/transportTypes';
import { AlertTriangle, Sparkles, Scale, ShieldAlert, Info } from 'lucide-react';

interface TransportSpecialCaseAlertsProps {
  specialCases: TransportSpecialCase[];
}

export const TransportSpecialCaseAlerts: React.FC<TransportSpecialCaseAlertsProps> = ({
  specialCases,
}) => {
  if (!specialCases || specialCases.length === 0) return null;

  const getIcon = (type: TransportSpecialCase['type']) => {
    switch (type) {
      case 'unbalanced_supply':
      case 'unbalanced_demand':
        return <Scale className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'degeneracy':
        return <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'multiple_optima':
        return <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'prohibited_route':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getStyle = (type: TransportSpecialCase['type']) => {
    switch (type) {
      case 'unbalanced_supply':
      case 'unbalanced_demand':
        return 'bg-amber-500/[0.08] border-amber-500/20 text-amber-200';
      case 'degeneracy':
        return 'bg-orange-500/[0.08] border-orange-500/20 text-orange-200';
      case 'multiple_optima':
        return 'bg-purple-500/[0.08] border-purple-500/20 text-purple-200';
      case 'prohibited_route':
        return 'bg-rose-500/[0.08] border-rose-500/20 text-rose-200';
      default:
        return 'bg-blue-500/[0.08] border-blue-500/20 text-blue-200';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {specialCases.map((sc, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col gap-2 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${getStyle(
            sc.type
          )}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {getIcon(sc.type)}
              <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-white">
                {sc.title}
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-current bg-white/[0.04]">
              {sc.badge}
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{sc.description}</p>

          <div className="text-[11px] bg-black/30 border border-white/[0.06] rounded-xl px-3 py-1.5 flex items-center gap-2 text-zinc-300">
            <strong className="text-white font-medium shrink-0">Acción ejecutada:</strong>
            <span>{sc.actionTaken}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
