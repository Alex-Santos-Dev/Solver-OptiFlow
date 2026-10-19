import React from 'react';
import { GraphicSolution } from '../../core/graphic/graphicTypes';
import { LatexMath } from '../LatexMath';
import { BookOpen, CheckCircle2 } from 'lucide-react';

/**
 * Propiedades del componente GraphicStepsView
 */
interface GraphicStepsViewProps {
  /** Solución calculada del Método Gráfico con la secuencia de pasos */
  solution: GraphicSolution;
}

/**
 * Componente GraphicStepsView (Pasos Teóricos y Analíticos del Método Gráfico)
 * -----------------------------------------------------------------------------
 * Desglosa la resolución gráfica en 5 pasos didácticos:
 * 1. Ecuaciones asociadas e interceptos con los ejes cartesianos.
 * 2. Trazado de semiplanos y conformación de la Región Factible.
 * 3. Cálculo analítico de los vértices (intersección de rectas).
 * 4. Evaluación de Z en cada punto extremo.
 * 5. Conclusión y solución óptima.
 */
export const GraphicStepsView: React.FC<GraphicStepsViewProps> = ({ solution }) => {
  const { steps } = solution;

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <BookOpen className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
          Resolución Paso a Paso (Método Gráfico)
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((s) => (
          <div
            key={s.stepNumber}
            className="flex flex-col gap-2 bg-black/25 border border-white/[0.06] p-4 rounded-xl text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-300 text-xs sm:text-sm">{s.title}</span>
              <span className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-mono text-[10px] flex items-center justify-center font-medium">
                {s.stepNumber}
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-xs">{s.description}</p>

            {s.latexFormula && (
              <div className="bg-white/[0.02] border border-white/[0.06] p-2.5 rounded-lg overflow-x-auto text-zinc-200 mt-1">
                <LatexMath math={s.latexFormula} block />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

