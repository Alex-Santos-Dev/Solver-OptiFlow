import React from 'react';
import { SimplexStep } from '../../core/simplex/simplexTypes';
import { SimplexTableau } from './SimplexTableau';
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle, Sparkles, BookOpen } from 'lucide-react';
import { LatexMath } from '../LatexMath';

/**
 * Propiedades del componente SimplexStepCard
 */
interface SimplexStepCardProps {
  /** Paso actual a visualizar */
  step: SimplexStep;
  /** Cantidad total de pasos registrados */
  totalSteps: number;
}

/**
 * Componente SimplexStepCard (Tarjeta de Iteración Simplex)
 * -------------------------------------------------------------
 * Contenedor didáctico que encapsula una iteración del algoritmo Simplex:
 * 1. Encabezado con número de paso, título y distintivo de estado.
 * 2. Tarjeta resumen del pivote:
 *    - Variable que entra a la base (según la condición de optimalidad).
 *    - Variable que sale de la base (según la razón mínima theta).
 *    - Valor numérico del cociente mínimo.
 *    - Valor numérico del elemento pivote.
 * 3. Matriz de la tabla Simplex (SimplexTableau).
 * 4. Detalle de las Operaciones Elementales de Fila de Gauss-Jordan aplicadas
 *    (ej: R_r <- (1/p) * R_r,  R_i <- R_i - a_ik * R_r).
 * 5. Párrafo explicativo con la justificación teórica del paso.
 */
export const SimplexStepCard: React.FC<SimplexStepCardProps> = ({ step, totalSteps }) => {
  const { title, description, pivot, rowOperations, status } = step;

  const renderStatusBadge = () => {
    switch (status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Solución Óptima
          </span>
        );
      case 'alternative_optima':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Óptimos Múltiples
          </span>
        );
      case 'unbounded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            No Acotado
          </span>
        );
      case 'infeasible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Infactible
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            En progreso
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 font-mono font-medium text-xs flex items-center justify-center border border-white/[0.08]">
            Paso {step.stepNumber}/{totalSteps}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">{title}</h3>
        </div>
        {renderStatusBadge()}
      </div>

      {/* Pivot Decision Card (if pivot exists) */}
      {pivot && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/25 border border-white/[0.06] p-3 rounded-xl text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[11px] font-medium">Variable Entrante</span>
            <span className="font-semibold text-blue-400 flex items-center gap-1 text-xs font-mono">
              <LatexMath math={pivot.enteringVar} />
              <ArrowRight className="w-3 h-3 text-zinc-600 inline" /> Base
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[11px] font-medium">Variable Saliente</span>
            <span className="font-semibold text-amber-300 flex items-center gap-1 text-xs font-mono">
              Base <ArrowRight className="w-3 h-3 text-zinc-600 inline" />
              <LatexMath math={pivot.leavingVar} />
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[11px] font-medium">Cociente Mínimo</span>
            <span className="font-semibold text-emerald-400 font-mono text-xs">
              <LatexMath math={`\\theta = ${pivot.minimumRatio.toLatex()}`} />
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[11px] font-medium">Elemento Pivote</span>
            <span className="font-bold text-amber-300 font-mono text-xs">
              <LatexMath math={pivot.value.toLatex()} />
            </span>
          </div>
        </div>
      )}

      {/* Simplex Tableau */}
      <SimplexTableau step={step} />

      {/* Solución Básica del Paso: Variables Básicas (VB) y Variables No Básicas (VNB) */}
      {(() => {
        const { columns, rows, zRow } = step.tableau;
        const basicVarsList = rows.map((r) => ({
          name: r.basicVar,
          value: r.rhs,
        }));
        const basicVarNames = new Set(rows.map((r) => r.basicVar));
        const nonBasicVarsList = columns.filter((col) => !basicVarNames.has(col));
        const isPhase1 = step.title.includes('Fase 1');
        const objectiveLabel = isPhase1 ? 'W' : 'Z';
        const objectiveValue = zRow.rhs;

        return (
          <div className="bg-black/25 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,199,89,0.6)]"></div>
                <span className="text-xs font-medium text-zinc-200 tracking-tight">
                  Solución Básica en este Paso (Vértice del Poliedro)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Función Objetivo Actual:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] text-zinc-200 border border-white/[0.08] font-mono font-semibold text-xs">
                  <LatexMath math={`${objectiveLabel} = ${objectiveValue.toLatex()}`} />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Variables Básicas (VB) */}
              <div className="flex flex-col gap-1.5 bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">
                      VB
                    </span>
                    Variables Básicas ({basicVarsList.length}):
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Valor = RHS</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                  {basicVarsList.map((bv, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 border border-emerald-500/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="font-semibold text-emerald-300">
                        <LatexMath math={bv.name} />
                      </span>
                      <span className="text-zinc-600">=</span>
                      <span className="font-medium text-zinc-100">
                        <LatexMath math={bv.value.toLatex()} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variables No Básicas (VNB) */}
              <div className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-400 font-bold text-[10px]">
                      VNB
                    </span>
                    Variables No Básicas ({nonBasicVarsList.length}):
                  </span>
                  <span className="text-[11px] text-zinc-500">Por definición = 0</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                  {nonBasicVarsList.length > 0 ? (
                    nonBasicVarsList.map((nbCol, idx) => (
                      <div
                        key={idx}
                        className="bg-black/30 border border-white/[0.06] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-zinc-400"
                      >
                        <span className="font-medium text-blue-300/80">
                          <LatexMath math={nbCol} />
                        </span>
                        <span className="text-zinc-600">=</span>
                        <span className="font-medium text-zinc-400">0</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-500 text-xs italic">Ninguna</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Row Operations (Gauss-Jordan) */}
      {rowOperations && rowOperations.length > 0 && (
        <div className="flex flex-col gap-1.5 bg-black/25 border border-white/[0.06] p-3.5 rounded-xl text-xs">
          <div className="font-medium text-zinc-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Operaciones Elementales de Fila (Gauss-Jordan):</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-zinc-300">
            {rowOperations.map((op, idx) => (
              <span
                key={idx}
                className="bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-lg text-xs"
              >
                <LatexMath math={op} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pedagogical Description */}
      <div className="text-xs text-zinc-400 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/[0.05]">
        <strong className="text-zinc-200">Explicación del Paso: </strong>
        {description}
      </div>
    </div>
  );
};
