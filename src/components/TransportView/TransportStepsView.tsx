import React, { useState } from 'react';
import { TransportStep } from '../../core/transport/transportTypes';
import { LatexMath } from '../LatexMath';
import { ChevronDown, ChevronUp, Layers, CheckCircle, ArrowRight } from 'lucide-react';

interface TransportStepsViewProps {
  steps: TransportStep[];
}

export const TransportStepsView: React.FC<TransportStepsViewProps> = ({ steps }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col">
      {/* Encabezado */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Desglose Algorítmico Paso a Paso
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Traza matemática formal de cada asignación, cálculo de penalizaciones y optimización MODI
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-zinc-400 bg-black/40 px-3 py-1 rounded-xl border border-white/[0.06]">
          {steps.length} {steps.length === 1 ? 'Paso' : 'Pasos'}
        </span>
      </div>

      {/* Lista de Pasos */}
      <div className="divide-y divide-white/[0.06]">
        {steps.map((step, idx) => {
          const isExpanded = expandedStep === idx || expandedStep === null; // Por defecto todos o seleccionado

          const getPhaseBadge = (phase: TransportStep['phase']) => {
            switch (phase) {
              case 'balancing':
                return { label: 'Balanceo', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
              case 'initial_solution':
                return { label: 'Solución Inicial', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
              case 'degeneracy_handling':
                return { label: 'Degeneración (ε)', color: 'bg-orange-500/10 text-orange-300 border-orange-500/20' };
              case 'modi_multipliers':
                return { label: 'Multiplicadores u, v', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
              case 'stepping_stone_cycle':
                return { label: 'Cruce del Arroyo', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' };
              case 'optimal_result':
                return { label: 'Óptimo Global', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
              default:
                return { label: 'Iteración', color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20' };
            }
          };

          const badge = getPhaseBadge(step.phase);

          return (
            <div key={idx} className="p-4 transition-all hover:bg-white/[0.01]">
              <div
                className="flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setExpandedStep(expandedStep === idx ? -1 : idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/[0.08] text-[11px] font-mono font-bold text-zinc-300 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>{step.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </h4>
                  </div>
                </div>

                <button className="text-zinc-400 hover:text-white p-1 rounded-lg">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Contenido expandible */}
              {isExpanded && (
                <div className="mt-3 pl-9 flex flex-col gap-3 text-xs text-zinc-300">
                  <p className="leading-relaxed text-zinc-300">{step.description}</p>

                  {/* Fórmulas matemáticas en LaTeX */}
                  {step.latexFormulas && step.latexFormulas.length > 0 && (
                    <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl flex flex-col gap-1.5">
                      {step.latexFormulas.map((f, fIdx) => (
                        <div key={fIdx} className="font-mono text-zinc-200">
                          <LatexMath math={f} block={false} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resumen de costos en este paso */}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>Costo acumulado de este paso:</span>
                    <strong className="text-emerald-400 font-mono">
                      Z = ${step.tableau.totalCost.toString()}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
