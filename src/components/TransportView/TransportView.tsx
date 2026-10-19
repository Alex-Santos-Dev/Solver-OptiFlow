import React, { useState, useMemo } from 'react';
import { TransportModel, TransportInitialMethod, cloneTransportModel } from '../../core/transport/transportTypes';
import { TRANSPORT_PRESETS } from '../../core/transport/transportPresets';
import { TransportSolver } from '../../core/transport/transportSolver';
import { TransportMatrixInput } from './TransportMatrixInput';
import { TransportSpecialCaseAlerts } from './TransportSpecialCaseAlerts';
import { TransportMatrixTable } from './TransportMatrixTable';
import { TransportNetworkGraph } from './TransportNetworkGraph';
import { TransportStepsView } from './TransportStepsView';
import { CheckCircle2, Table2, Network, ListOrdered } from 'lucide-react';

export const TransportView: React.FC = () => {
  // Modelo de Transporte editable
  const [model, setModel] = useState<TransportModel>(() => cloneTransportModel(TRANSPORT_PRESETS[0].model));

  // Método inicial seleccionado (Vogel por defecto)
  const [initialMethod, setInitialMethod] = useState<TransportInitialMethod>('vogel');

  // Activar optimización MODI
  const [optimizeWithMODI, setOptimizeWithMODI] = useState<boolean>(true);

  // Pestaña visual activa para los resultados: 'table' | 'graph' | 'steps'
  const [activeTab, setActiveTab] = useState<'both' | 'table' | 'graph'>('both');

  // Ejecución reactiva del solver
  const solution = useMemo(() => {
    return TransportSolver.solve(model, initialMethod, optimizeWithMODI);
  }, [model, initialMethod, optimizeWithMODI]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Panel de Configuración y Editor Matricial */}
      <TransportMatrixInput
        model={model}
        onChangeModel={(newM) => setModel(newM)}
        initialMethod={initialMethod}
        onChangeInitialMethod={(m) => setInitialMethod(m)}
        optimizeWithMODI={optimizeWithMODI}
        onToggleOptimizeWithMODI={(v) => setOptimizeWithMODI(v)}
      />

      {/* 2. Alertas de Casos Especiales Detectados y Activados */}
      {solution.specialCases.length > 0 && (
        <TransportSpecialCaseAlerts specialCases={solution.specialCases} />
      )}

      {/* 3. Banner de Resumen Óptimo */}
      <div className="p-4 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              {solution.isOptimal
                ? 'Solución Óptima de Costo Mínimo Alcanzada'
                : 'Solución Básica Factible Inicial'}
            </h4>
            <span className="text-xs text-zinc-300">
              {solution.isOptimal
                ? `Verificada mediante la prueba de optimalidad de multiplicadores del Método MODI ($u_i + v_j = c_{ij}$).`
                : `Calculada mediante el método inicial seleccionado.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-emerald-500/30">
          <span className="text-xs text-zinc-400">Costo Mínimo Total:</span>
          <span className="text-xl font-mono font-bold text-emerald-400">
            Z* = ${solution.totalCost.toString()}
          </span>
        </div>
      </div>

      {/* 4. Selector de Vista de Resultados (Tablero Matricial vs Grafo de Red) */}
      <div className="flex items-center justify-between gap-3 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] p-1.5 rounded-2xl">
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('both')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'both'
                ? 'bg-white/[0.14] text-white shadow-md border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Tablero + Grafo</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'table'
                ? 'bg-white/[0.14] text-white shadow-md border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Tablero Matricial</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-white/[0.14] text-white shadow-md border border-white/[0.12]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>Grafo de Red</span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 pr-3 font-mono hidden sm:inline">
          {solution.balancedModel.origins.length} Orígenes &bull;{' '}
          {solution.balancedModel.destinations.length} Destinos
        </span>
      </div>

      {/* 5. Vistas Visuales Activas */}
      {(activeTab === 'both' || activeTab === 'table') && (
        <TransportMatrixTable
          model={solution.balancedModel}
          tableau={solution.finalTableau}
          title="Tablero de Transporte Óptimo (Matriz de Asignaciones y Multiplicadores MODI)"
          subtitle="Muestra las cantidades distribuidas x_ij, costos unitarios c_ij, multiplicadores u_i, v_j y costos marginales"
        />
      )}

      {(activeTab === 'both' || activeTab === 'graph') && (
        <TransportNetworkGraph
          model={solution.balancedModel}
          tableau={solution.finalTableau}
        />
      )}

      {/* 6. Desglose Algorítmico Paso a Paso */}
      <TransportStepsView steps={solution.steps} />
    </div>
  );
};
