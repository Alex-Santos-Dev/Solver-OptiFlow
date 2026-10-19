import React from 'react';
import { SimplexStep } from '../../core/simplex/simplexTypes';
import { LatexMath } from '../LatexMath';

/**
 * Propiedades del componente SimplexTableau
 */
interface SimplexTableauProps {
  /** Paso actual con los datos del tableau, pivote y fila Z */
  step: SimplexStep;
}

/**
 * Componente SimplexTableau (Renderizado de la Tabla Simplex)
 * -------------------------------------------------------------
 * Renderiza la matriz de la tabla Simplex con estilo moderno y fórmulas KaTeX:
 * - Columna de Base (variable básica de cada renglón).
 * - Columnas de variables originales, holgura, exceso y artificiales.
 * - Columna de Solución (RHS).
 * - Columna de Razón Mínima theta = b_i / a_ik.
 * - Resaltado dinámico en color:
 *    * Azul suave: Columna pivote (variable entrante).
 *    * Naranja suave: Fila pivote (variable saliente).
 *    * Dorado brillante: Elemento pivote en la intersección.
 * - Renglón superior (Renglón 0) con la función objetivo Z o W.
 */
export const SimplexTableau: React.FC<SimplexTableauProps> = ({ step }) => {
  const { tableau, pivot } = step;
  const { columns, rows, zRow } = tableau;

  // Helper para renderizar variables en subíndices LaTeX (ej. x1 -> x_{1})
  const formatColLatex = (c: string): string => {
    if (c.includes('_') || c.includes('{')) return c;
    return c.replace(/([a-zA-Z]+)(\d+)/g, '$1_{$2}');
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-black/30 shadow-inner scrollbar-thin">
      <table className="w-full min-w-max text-center text-xs border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="bg-white/[0.04] text-zinc-400 font-medium border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
            <th className="py-2.5 px-3.5 text-left sticky left-0 z-20 bg-[#16171c] shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap min-w-[80px]">
              Base
            </th>
            {columns.map((col) => {
              const isPivotCol = pivot && pivot.colName === col;
              return (
                <th
                  key={col}
                  className={`py-2.5 px-3 min-w-[70px] whitespace-nowrap transition-colors font-medium ${
                    isPivotCol
                      ? 'bg-blue-500/[0.12] text-blue-300 font-semibold border-x border-blue-500/25'
                      : ''
                  }`}
                >
                  <LatexMath math={formatColLatex(col)} />
                </th>
              );
            })}
            <th className="py-2.5 px-3 bg-white/[0.02] font-medium text-zinc-300 border-l border-white/[0.06] min-w-[95px] whitespace-nowrap">
              Solución (RHS)
            </th>
            <th className="py-2.5 px-3 bg-white/[0.01] text-zinc-400 font-medium min-w-[85px] whitespace-nowrap">
              Razón <LatexMath math="\theta" />
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-white/[0.04] text-zinc-200">
          {/* Fila Objetivo (Z o W en Fase 1) - Renglón 0 arriba de todas las restricciones */}
          {(() => {
            const isPhase1 = step.title.includes('Fase 1');
            const objLabel = isPhase1 ? 'W' : 'Z';
            return (
              <tr className="bg-white/[0.03] font-semibold text-zinc-100 border-b-2 border-white/[0.10]">
                {/* Etiqueta de la Base para Z o W */}
                <td className="py-3 px-3.5 text-left sticky left-0 z-10 bg-[#171922] shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/25 shadow-sm">
                    <LatexMath math={objLabel} />
                  </span>
                </td>
                {columns.map((col) => {
                  const val = zRow.coefficients[col];
                  const isPivotCol = pivot && pivot.colName === col;

                  return (
                    <td
                      key={col}
                      className={`py-3 px-3 font-mono whitespace-nowrap ${
                        isPivotCol
                          ? 'bg-blue-500/[0.12] text-blue-200 border-x border-blue-500/25 font-semibold'
                          : 'text-zinc-200'
                      }`}
                    >
                      {val ? <LatexMath math={val.toLatex()} /> : '0'}
                    </td>
                  );
                })}
                {/* Z / W RHS (Valor actual de la función objetivo) */}
                <td className="py-3 px-3 font-mono text-xs text-rose-400 font-bold border-l border-white/[0.06] bg-rose-500/[0.05] whitespace-nowrap">
                  <LatexMath math={zRow.rhs.toLatex()} />
                </td>
                <td className="py-3 px-3 text-zinc-600 whitespace-nowrap">—</td>
              </tr>
            );
          })()}

          {/* Constraint Rows (Filas de restricciones) */}
          {rows.map((row, rIdx) => {
            const isPivotRow = pivot && pivot.rowIndex === rIdx;

            return (
              <tr
                key={rIdx}
                className={`transition-colors ${
                  isPivotRow ? 'bg-amber-500/[0.07] font-medium' : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Basic Variable Column */}
                <td
                  className={`py-2.5 px-3.5 text-left font-semibold sticky left-0 z-10 shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap ${
                    isPivotRow
                      ? 'text-amber-300 bg-[#211d18]'
                      : 'text-zinc-400 bg-[#16171c]'
                  }`}
                >
                  <LatexMath math={formatColLatex(row.basicVar)} />
                </td>

                {/* Coefficients */}
                {columns.map((col) => {
                  const val = row.coefficients[col];
                  const isPivotCol = pivot && pivot.colName === col;
                  const isPivotElement = isPivotRow && isPivotCol;

                  return (
                    <td
                      key={col}
                      className={`py-2 px-3 font-mono whitespace-nowrap ${
                        isPivotElement
                          ? 'bg-amber-400/90 text-zinc-950 font-bold text-xs rounded shadow-sm'
                          : isPivotCol
                          ? 'bg-blue-500/[0.06] text-blue-200 border-x border-blue-500/15'
                          : ''
                      }`}
                    >
                      {val ? <LatexMath math={val.toLatex()} /> : '0'}
                    </td>
                  );
                })}

                {/* Solution RHS */}
                <td className="py-2.5 px-3 font-mono font-medium text-emerald-400 border-l border-white/[0.06] whitespace-nowrap">
                  <LatexMath math={row.rhs.toLatex()} />
                </td>

                {/* Ratio / Cociente */}
                <td className="py-2.5 px-3 font-mono text-zinc-400 whitespace-nowrap">
                  {row.ratio ? (
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        isPivotRow
                          ? 'bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30'
                          : ''
                      }`}
                    >
                      <LatexMath math={row.ratio.toLatex()} />
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

