import React, { useState, useEffect } from 'react';
import { SimplexResult } from '../../core/simplex/simplexTypes';
import { SimplexStepCard } from './SimplexStepCard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Award } from 'lucide-react';
import { LatexMath } from '../LatexMath';
import confetti from 'canvas-confetti';

/**
 * Propiedades del componente SimplexSolutionView
 */
interface SimplexSolutionViewProps {
  /** Resultado completo generado por el solver Simplex */
  result: SimplexResult;
}

/**
 * Componente SimplexSolutionView (Vista y Navegador del Método Simplex estilo macOS)
 */
export const SimplexSolutionView: React.FC<SimplexSolutionViewProps> = ({ result }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Reset to first step on new result
  useEffect(() => {
    setCurrentStepIdx(0);
    if (result.status === 'optimal') {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.85 },
          colors: ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#FFFFFF'],
        });
      } catch (e) {
        // ignore if canvas not ready
      }
    }
  }, [result]);

  const totalSteps = result.steps.length;
  const currentStep = result.steps[currentStepIdx] || result.steps[0];

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Tarjeta de Resumen Final de Solución (Estilo macOS Window Panel) */}
      <div className="bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/[0.1] border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                {result.method === 'twoPhase' ? 'Método Dos Fases' : 'Método Simplex / Gran M'}
              </span>
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">{result.statusMessage}</h2>
            </div>
          </div>

          {result.optimalValue && (
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-zinc-400 font-medium">Valor Óptimo Global</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tracking-tight">
                Z* = {result.optimalValue.toString()}{' '}
                <span className="text-xs text-zinc-400 font-normal">
                  ({result.optimalValue.toNumber().toFixed(2)})
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Desglose de Variables de Decisión y Holguras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Variables de Decisión */}
          <div className="bg-black/20 border border-white/[0.06] p-3.5 rounded-xl">
            <span className="text-xs font-medium text-zinc-300 block mb-2.5">
              Variables de Decisión Óptimas:
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {Object.entries(result.variableValues).map(([v, val]) => (
                <div
                  key={v}
                  className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
                >
                  <span className="font-semibold text-blue-300">
                    <LatexMath math={v} />
                  </span>
                  <span className="text-zinc-500">=</span>
                  <span className="font-bold text-emerald-400">
                    <LatexMath math={val.toLatex()} />{' '}
                    <span className="text-[11px] text-zinc-400 font-normal">
                      ({val.toNumber().toFixed(2)})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Variables de Holgura y Exceso */}
          <div className="bg-black/20 border border-white/[0.06] p-3.5 rounded-xl">
            <span className="text-xs font-medium text-zinc-300 block mb-2.5">
              Variables de Holgura / Exceso (Recursos):
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {Object.keys(result.slackValues).length > 0 ? (
                Object.entries(result.slackValues).map(([s, val]) => {
                  const isZero = val.isZero();
                  return (
                    <div
                      key={s}
                      className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm"
                    >
                      <span className="text-zinc-300">
                        <LatexMath math={s} />
                      </span>
                      <span className="text-zinc-500">=</span>
                      <span className={isZero ? 'text-zinc-400 font-medium' : 'text-amber-300 font-bold'}>
                        <LatexMath math={val.toLatex()} />
                      </span>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        {isZero ? '(Agotado)' : '(Sobrante)'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <span className="text-zinc-500 text-xs italic">Sin variables de holgura.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Navegación de Pasos (Estilo Apple Media / Segmented Player) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentStepIdx(0)}
            disabled={currentStepIdx === 0}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-20 disabled:pointer-events-none text-zinc-300 border border-white/[0.06] transition"
            title="Ir al inicio"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-20 disabled:pointer-events-none text-zinc-300 border border-white/[0.06] text-xs font-medium transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
        </div>

        {/* Píldoras numeradas de pasos */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full bg-black/25 p-1 rounded-xl border border-white/[0.04]">
          {result.steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                idx === currentStepIdx
                  ? 'bg-white/[0.16] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.12]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
            >
              {s.title.includes('Iteración')
                ? `Iter ${s.stepNumber - 1}`
                : s.title.includes('Fase 2')
                ? 'Fase 2'
                : s.title.includes('Fase 1')
                ? 'Fase 1'
                : 'Inicio'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentStepIdx((prev) => Math.min(totalSteps - 1, prev + 1))}
            disabled={currentStepIdx === totalSteps - 1}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/90 hover:bg-blue-500 active:bg-blue-600 disabled:opacity-20 disabled:pointer-events-none text-white text-xs font-medium shadow-[0_2px_8px_rgba(10,132,255,0.3)] border border-blue-400/30 transition"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentStepIdx(totalSteps - 1)}
            disabled={currentStepIdx === totalSteps - 1}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-20 disabled:pointer-events-none text-zinc-300 border border-white/[0.06] transition"
            title="Ir al final"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tarjeta del Paso Seleccionado */}
      {currentStep && <SimplexStepCard step={currentStep} totalSteps={totalSteps} />}
    </div>
  );
};

