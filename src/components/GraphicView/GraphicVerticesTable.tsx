import React from 'react';
import { GraphicSolution, GraphicPoint } from '../../core/graphic/graphicTypes';
import { Award, CheckCircle2, Crosshair } from 'lucide-react';
import { LatexMath } from '../LatexMath';

/**
 * Propiedades del componente GraphicVerticesTable
 */
interface GraphicVerticesTableProps {
  /** Solución del Método Gráfico con la lista de vértices factibles */
  solution: GraphicSolution;
  /** Vértice actualmente enfocado/seleccionado */
  selectedVertex?: GraphicPoint | null;
  /** Callback al hacer clic en una fila de la tabla */
  onSelectVertex?: (v: GraphicPoint) => void;
}

/**
 * Componente GraphicVerticesTable (Tabla de Vértices y Teorema de Programación Lineal)
 * ----------------------------------------------------------------------------------
 * Presenta en formato tabular la evaluación analítica de la Función Objetivo en
 * todos los puntos extremos del polígono factible.
 *
 * Muestra:
 * - Etiqueta del vértice (A, B, C...)
 * - Coordenada exacta en fracciones racionales (x, y)
 * - Coordenada decimal aproximada
 * - Valor resultante Z(x, y)
 * - Distintivo dorado para el vértice óptimo Z*
 */
export const GraphicVerticesTable: React.FC<GraphicVerticesTableProps> = ({
  solution,
  selectedVertex,
  onSelectVertex,
}) => {
  const { feasibleVertices, variables, optimalValue } = solution;
  const [xVar, yVar] = variables;

  if (feasibleVertices.length === 0) {
    return (
      <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-sm">
        No se encontraron vértices factibles. El conjunto de restricciones es infactible.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 tracking-tight">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <span>Evaluación de la Función Objetivo en Vértices</span>
        </h3>
        <span className="text-xs text-zinc-400 font-mono">
          {feasibleVertices.length} {feasibleVertices.length === 1 ? 'vértice' : 'vértices'} factibles
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-black/25">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.04] text-zinc-400 font-medium border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Vértice</th>
              <th className="py-2.5 px-3">Coordenada ({xVar}, {yVar})</th>
              <th className="py-2.5 px-3">Decimal</th>
              <th className="py-2.5 px-3 text-right">Valor Z</th>
              <th className="py-2.5 px-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-zinc-200">
            {feasibleVertices.map((v) => {
              const isSelected = selectedVertex?.label === v.label;
              const isOpt = v.isOptimal;

              return (
                <tr
                  key={v.label}
                  onClick={() => onSelectVertex && onSelectVertex(v)}
                  className={`transition-colors cursor-pointer ${
                    isOpt
                      ? 'bg-amber-500/[0.08] hover:bg-amber-500/[0.14]'
                      : isSelected
                      ? 'bg-blue-500/[0.1]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                        isOpt
                          ? 'bg-amber-400 text-zinc-950 shadow-sm'
                          : 'bg-white/[0.08] text-zinc-200'
                      }`}
                    >
                      {v.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    ({v.x.toString()}, {v.y.toString()})
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-400">
                    ({v.xNum.toFixed(2)}, {v.yNum.toFixed(2)})
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400 text-xs">
                    {v.zValue.toString()}{' '}
                    <span className="text-zinc-500 text-[11px] font-normal">
                      ({v.zNum.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {isOpt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-medium border border-amber-400/30">
                        <Award className="w-3 h-3 text-amber-400" />
                        Óptimo Z*
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Factible</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {optimalValue && (
        <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/[0.08] border border-amber-500/20 p-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            El valor óptimo es <strong className="font-mono text-amber-200">Z* = {optimalValue.toString()}</strong>, alcanzado en el punto extremo señalado con el ícono de estrella.
          </span>
        </div>
      )}
    </div>
  );
};
