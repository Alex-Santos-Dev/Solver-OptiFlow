import React from 'react';
import { Fraction } from '../../core/math/fraction';
import { TransportModel, TransportTableau } from '../../core/transport/transportTypes';

interface TransportMatrixTableProps {
  model: TransportModel;
  tableau: TransportTableau;
  title?: string;
  subtitle?: string;
  highlightCycle?: boolean;
}

export const TransportMatrixTable: React.FC<TransportMatrixTableProps> = ({
  model,
  tableau,
  title = 'Tablero Matricial de Transporte',
  subtitle,
  highlightCycle = true,
}) => {
  const m = model.origins.length;
  const n = model.destinations.length;

  // Mapa de nodos de ciclo para búsqueda rápida
  const cycleMap = new Map<string, '+' | '-'>();
  if (highlightCycle && tableau.cycle) {
    for (const node of tableau.cycle) {
      cycleMap.set(`${node.row}-${node.col}`, node.sign);
    }
  }

  return (
    <div className="bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col">
      {/* Encabezado de la Tarjeta */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {tableau.isOptimal && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Solución Óptima
              </span>
            )}
            {tableau.isDegenerate && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Degenerada (con ε)
              </span>
            )}
          </h3>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/[0.06]">
            <span className="text-zinc-400">Costo Total:</span>
            <span className="text-emerald-400 font-bold text-sm">
              Z = {tableau.totalCost.toString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla con desplazamiento horizontal suave */}
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse text-xs select-none">
          <thead>
            <tr>
              <th className="p-2.5 text-left font-medium text-zinc-400 border border-white/[0.06] bg-black/30 rounded-tl-xl">
                Orígenes \ Destinos
              </th>
              {model.destinations.map((dest, j) => (
                <th
                  key={dest.id}
                  className="p-2.5 text-center font-medium text-zinc-200 border border-white/[0.06] bg-black/20 min-w-[110px]"
                >
                  <div className="font-semibold">{dest.name}</div>
                  <div className="text-[11px] font-mono text-blue-400 mt-0.5">
                    Demanda: {dest.demand.toString()}
                  </div>
                  {tableau.v[j] !== null && (
                    <div className="text-[10px] font-mono text-purple-300 mt-0.5 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      v_{j + 1} = {tableau.v[j]!.toString()}
                    </div>
                  )}
                </th>
              ))}
              <th className="p-2.5 text-center font-medium text-zinc-300 border border-white/[0.06] bg-black/30 min-w-[90px]">
                Oferta
              </th>
              <th className="p-2.5 text-center font-medium text-purple-300 border border-white/[0.06] bg-purple-500/[0.05] min-w-[80px] rounded-tr-xl">
                u_i (MODI)
              </th>
            </tr>
          </thead>

          <tbody>
            {model.origins.map((orig, i) => (
              <tr key={orig.id} className="hover:bg-white/[0.01]">
                {/* Nombre del Origen */}
                <td className="p-2.5 border border-white/[0.06] bg-black/20 font-medium text-zinc-200">
                  <div className="font-semibold">{orig.name}</div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    Oferta: {orig.supply.toString()}
                  </div>
                </td>

                {/* Celdas de Transporte (i, j) */}
                {model.destinations.map((_, j) => {
                  const cell = tableau.cells[i][j];
                  const cycleSign = cycleMap.get(`${i}-${j}`);
                  const isEntering =
                    tableau.enteringCell?.row === i && tableau.enteringCell?.col === j;
                  const isLeaving =
                    tableau.leavingCell?.row === i && tableau.leavingCell?.col === j;

                  let cellBg = 'bg-[#121318]/50';
                  let borderHighlight = 'border-white/[0.06]';

                  if (cycleSign) {
                    cellBg =
                      cycleSign === '+'
                        ? 'bg-blue-500/[0.12] border-blue-400/50'
                        : 'bg-rose-500/[0.12] border-rose-400/50';
                    borderHighlight =
                      cycleSign === '+' ? 'border-blue-400/80 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'border-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                  } else if (cell.isBasic) {
                    cellBg = 'bg-emerald-500/[0.08]';
                  }

                  return (
                    <td
                      key={j}
                      className={`relative p-3 border transition-all text-center min-w-[110px] h-[78px] ${cellBg} ${borderHighlight}`}
                    >
                      {/* Sub-caja superior derecha: Costo unitario c_ij */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/50 border border-white/[0.08] text-[10px] font-mono text-zinc-300">
                        {cell.isProhibited ? (
                          <span className="text-rose-400 font-bold">M</span>
                        ) : (
                          <span>${cell.cost.toString()}</span>
                        )}
                      </div>

                      {/* Badge de ciclo alternante (+ / -) */}
                      {cycleSign && (
                        <div
                          className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-md ${
                            cycleSign === '+'
                              ? 'bg-blue-500 text-white animate-pulse'
                              : 'bg-rose-500 text-white animate-pulse'
                          }`}
                        >
                          {cycleSign}
                        </div>
                      )}

                      {/* Centro: Asignación de Flujo x_ij */}
                      <div className="flex flex-col items-center justify-center h-full pt-1">
                        {cell.isBasic ? (
                          cell.isEpsilon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-300 font-mono font-bold text-xs">
                              ε <span className="text-[10px] font-normal">(0)</span>
                            </span>
                          ) : (
                            <span className="text-base sm:text-lg font-mono font-bold text-emerald-300 drop-shadow-[0_1px_4px_rgba(16,185,129,0.3)]">
                              {cell.allocated.toString()}
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-600 font-mono text-xs">—</span>
                        )}

                        {/* Indicadores de Entrante / Saliente */}
                        {isEntering && (
                          <span className="text-[9px] text-blue-300 font-semibold uppercase tracking-wider mt-0.5">
                            Entra
                          </span>
                        )}
                        {isLeaving && (
                          <span className="text-[9px] text-rose-300 font-semibold uppercase tracking-wider mt-0.5">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Sub-indicador inferior izquierdo: Costo Marginal / Oportunidad Delta_ij */}
                      {!cell.isBasic && cell.opportunityCost !== undefined && (
                        <div
                          className={`absolute bottom-1.5 left-1.5 text-[9px] font-mono px-1 rounded ${
                            cell.opportunityCost.isPositive()
                              ? 'text-blue-400 font-bold bg-blue-500/10'
                              : cell.opportunityCost.isZero()
                              ? 'text-purple-300 font-bold bg-purple-500/10'
                              : 'text-zinc-500'
                          }`}
                          title={`Índice marginal Δ_${i + 1}${j + 1} = u_${i + 1} + v_${j + 1} - c_${i + 1}${j + 1}`}
                        >
                          Δ = {cell.opportunityCost.toString()}
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Columna de Oferta */}
                <td className="p-2.5 text-center border border-white/[0.06] bg-black/20 font-mono font-bold text-zinc-200">
                  {orig.supply.toString()}
                </td>

                {/* Multiplicador u_i */}
                <td className="p-2.5 text-center border border-white/[0.06] bg-purple-500/[0.04] font-mono text-purple-300">
                  {tableau.u[i] !== null ? (
                    <span className="font-semibold">u_{i + 1} = {tableau.u[i]!.toString()}</span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}

            {/* Fila Inferior: Demanda Total y Multiplicadores v_j */}
            <tr className="bg-black/30 font-medium">
              <td className="p-2.5 border border-white/[0.06] font-semibold text-zinc-300 rounded-bl-xl">
                Demanda Total
              </td>
              {model.destinations.map((dest) => (
                <td
                  key={dest.id}
                  className="p-2.5 text-center border border-white/[0.06] font-mono font-bold text-zinc-200"
                >
                  {dest.demand.toString()}
                </td>
              ))}
              <td className="p-2.5 text-center border border-white/[0.06] font-mono font-bold text-emerald-400">
                {model.origins.reduce((acc, o) => acc.add(o.supply), Fraction.ZERO).toString()}
              </td>
              <td className="p-2.5 text-center border border-white/[0.06] text-zinc-500 rounded-br-xl">
                —
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leyenda pedagógica al pie del tablero */}
      <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01] flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
            <span>Celda Básica (Flujo Asignado)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40 inline-block" />
            <span>Épsilon ε (Básica Degenerada)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-black/60 border border-white/20 inline-block text-[8px] text-center">
              $c
            </span>
            <span>Costo Unitario en esquina</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400 font-mono font-bold">Δ</span>
            <span>Índice de Mejora (u_i + v_j - c_ij)</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">
          Básicas: {tableau.basicCount} / Requeridas: {tableau.requiredBasicCount} (m+n-1)
        </div>
      </div>
    </div>
  );
};
