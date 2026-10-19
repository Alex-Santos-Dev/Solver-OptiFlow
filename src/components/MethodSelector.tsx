import React from 'react';
import { LineChart, Table2, Layers, Zap, Truck } from 'lucide-react';
import { SimplexMethodOption } from '../core/simplex/simplexSolver';

/**
 * Método de resolución general elegido por el usuario:
 * - 'graphic': Método Gráfico 2D en el plano cartesiano.
 * - 'simplex': Método Simplex Lineal tabular en n dimensiones.
 */
export type ResolutionMethod = 'graphic' | 'simplex' | 'transport';

/**
 * Propiedades del componente MethodSelector
 */
interface MethodSelectorProps {
  /** Método de resolución activo */
  method: ResolutionMethod;
  /** Callback para conmutar entre Gráfico, Simplex y Transporte */
  onMethodChange: (m: ResolutionMethod) => void;
  /** Variante activa del algoritmo Simplex ('bigM' o 'twoPhase') */
  simplexOption: SimplexMethodOption;
  /** Callback para alternar entre Gran M y Dos Fases */
  onSimplexOptionChange: (opt: SimplexMethodOption) => void;
  /** Cantidad de variables de decisión del modelo actual */
  variableCount: number;
}

/**
 * Componente MethodSelector (Selector de Estrategia al estilo macOS Segmented Control)
 */
export const MethodSelector: React.FC<MethodSelectorProps> = ({
  method,
  onMethodChange,
  simplexOption,
  onSimplexOptionChange,
  variableCount,
}) => {
  const is2D = variableCount === 2;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] p-2 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Pestañas Principales: Segmented Control macOS */}
      <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
        {/* Botón Método Gráfico */}
        <button
          onClick={() => onMethodChange('graphic')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            method === 'graphic'
              ? 'bg-white/[0.14] text-white shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.18)] border border-white/[0.12]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <LineChart className="w-3.5 h-3.5 text-blue-400" />
          <span>Método Gráfico</span>
          {is2D ? (
            <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-[10px] font-mono">
              2D
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-white/[0.05] border border-white/[0.05] text-zinc-400 text-[10px] font-mono">
              {variableCount} vars
            </span>
          )}
        </button>

        {/* Botón Método Simplex */}
        <button
          onClick={() => onMethodChange('simplex')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            method === 'simplex'
              ? 'bg-white/[0.14] text-white shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.18)] border border-white/[0.12]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <Table2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Método Simplex</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] border border-white/[0.08] text-zinc-300 text-[10px] font-mono">
            Lineal
          </span>
        </button>

        {/* Botón Problema de Transporte */}
        <button
          onClick={() => onMethodChange('transport')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            method === 'transport'
              ? 'bg-white/[0.14] text-white shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.18)] border border-white/[0.12]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transporte y Redes</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            Nuevo
          </span>
        </button>
      </div>

      {/* Sub-selector para Variantes de Simplex (Gran M vs Dos Fases) */}
      {method === 'simplex' && (
        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
          <span className="text-[11px] font-medium text-zinc-400 px-2 tracking-tight">Algoritmo:</span>
          {/* Opción Gran M */}
          <button
            onClick={() => onSimplexOptionChange('bigM')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
              simplexOption === 'bigM'
                ? 'bg-white/[0.14] text-amber-300 font-medium shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400/90" />
            <span>Gran M</span>
          </button>
          {/* Opción Dos Fases */}
          <button
            onClick={() => onSimplexOptionChange('twoPhase')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
              simplexOption === 'twoPhase'
                ? 'bg-white/[0.14] text-cyan-300 font-medium shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3 h-3 text-cyan-400/90" />
            <span>Dos Fases</span>
          </button>
        </div>
      )}
    </div>
  );
};

