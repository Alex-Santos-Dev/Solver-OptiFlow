import React from 'react';
import { Fraction } from '../../core/math/fraction';
import { TransportModel, TransportInitialMethod, cloneTransportModel } from '../../core/transport/transportTypes';
import { TRANSPORT_PRESETS, TransportPresetProblem } from '../../core/transport/transportPresets';
import {
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Scale,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface TransportMatrixInputProps {
  model: TransportModel;
  onChangeModel: (newModel: TransportModel) => void;
  initialMethod: TransportInitialMethod;
  onChangeInitialMethod: (method: TransportInitialMethod) => void;
  optimizeWithMODI: boolean;
  onToggleOptimizeWithMODI: (val: boolean) => void;
}

export const TransportMatrixInput: React.FC<TransportMatrixInputProps> = ({
  model,
  onChangeModel,
  initialMethod,
  onChangeInitialMethod,
  optimizeWithMODI,
  onToggleOptimizeWithMODI,
}) => {
  // Sumas de oferta y demanda
  let totalSupply = Fraction.ZERO;
  for (const o of model.origins) totalSupply = totalSupply.add(o.supply);

  let totalDemand = Fraction.ZERO;
  for (const d of model.destinations) totalDemand = totalDemand.add(d.demand);

  const isBalanced = totalSupply.equals(totalDemand);

  // Agregar Origen
  const handleAddOrigin = () => {
    const idx = model.origins.length + 1;
    const newOrigins = [
      ...model.origins,
      { id: `o_${Date.now()}`, name: `Origen ${idx}`, supply: new Fraction(50, 1) },
    ];
    const newRow = model.destinations.map(() => new Fraction(5, 1));
    const newCosts = [...model.costs, newRow];
    const newProhibited = model.prohibited
      ? [...model.prohibited, model.destinations.map(() => false)]
      : undefined;

    onChangeModel({
      ...model,
      origins: newOrigins,
      costs: newCosts,
      prohibited: newProhibited,
    });
  };

  // Eliminar Origen
  const handleRemoveOrigin = (index: number) => {
    if (model.origins.length <= 2) return; // Mínimo 2
    const newOrigins = model.origins.filter((_, i) => i !== index);
    const newCosts = model.costs.filter((_, i) => i !== index);
    const newProhibited = model.prohibited
      ? model.prohibited.filter((_, i) => i !== index)
      : undefined;

    onChangeModel({
      ...model,
      origins: newOrigins,
      costs: newCosts,
      prohibited: newProhibited,
    });
  };

  // Agregar Destino
  const handleAddDestination = () => {
    const idx = model.destinations.length + 1;
    const newDestinations = [
      ...model.destinations,
      { id: `d_${Date.now()}`, name: `Destino ${idx}`, demand: new Fraction(50, 1) },
    ];
    const newCosts = model.costs.map((row) => [...row, new Fraction(5, 1)]);
    const newProhibited = model.prohibited
      ? model.prohibited.map((row) => [...row, false])
      : undefined;

    onChangeModel({
      ...model,
      destinations: newDestinations,
      costs: newCosts,
      prohibited: newProhibited,
    });
  };

  // Eliminar Destino
  const handleRemoveDestination = (index: number) => {
    if (model.destinations.length <= 2) return; // Mínimo 2
    const newDestinations = model.destinations.filter((_, j) => j !== index);
    const newCosts = model.costs.map((row) => row.filter((_, j) => j !== index));
    const newProhibited = model.prohibited
      ? model.prohibited.map((row) => row.filter((_, j) => j !== index))
      : undefined;

    onChangeModel({
      ...model,
      destinations: newDestinations,
      costs: newCosts,
      prohibited: newProhibited,
    });
  };

  // Actualizar costo de celda
  const handleCostChange = (i: number, j: number, val: string) => {
    try {
      const parsed = Fraction.parse(val || '0');
      const newCosts = model.costs.map((row, rIdx) =>
        rIdx === i ? row.map((c, cIdx) => (cIdx === j ? parsed : c)) : [...row]
      );
      onChangeModel({ ...model, costs: newCosts });
    } catch {
      // Ignorar entrada inválida transitoria
    }
  };

  // Alternar ruta prohibida
  const handleToggleProhibited = (i: number, j: number) => {
    const prohibited = model.prohibited
      ? model.prohibited.map((row) => [...row])
      : model.origins.map(() => model.destinations.map(() => false));

    prohibited[i][j] = !prohibited[i][j];
    onChangeModel({ ...model, prohibited });
  };

  // Cargar Preset
  const handleLoadPreset = (preset: TransportPresetProblem) => {
    onChangeModel(cloneTransportModel(preset.model));
    onChangeInitialMethod(preset.recommendedInitialMethod);
  };

  return (
    <div className="bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col gap-5 p-5">
      {/* Barra Superior con Selector de Casos de Estudio */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Configuración del Problema de Transporte</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingresa orígenes, destinos, capacidades y la matriz de costos de envío
          </p>
        </div>

        {/* Selector de Presets Rápidos */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-zinc-400" />
          <select
            onChange={(e) => {
              const selected = TRANSPORT_PRESETS.find((p) => p.id === e.target.value);
              if (selected) handleLoadPreset(selected);
            }}
            defaultValue={TRANSPORT_PRESETS[0].id}
            className="bg-black/40 border border-white/[0.1] text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500/50"
          >
            <option disabled value="">
              Cargar Ejemplo de Libro…
            </option>
            {TRANSPORT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selectores de Métodos y Opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-3.5 rounded-xl border border-white/[0.06]">
        {/* Método Inicial */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Método de Solución Inicial (SBFI):</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => onChangeInitialMethod('vogel')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                initialMethod === 'vogel'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Vogel (VAM)
            </button>
            <button
              onClick={() => onChangeInitialMethod('leastCost')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                initialMethod === 'leastCost'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Costo Mínimo
            </button>
            <button
              onClick={() => onChangeInitialMethod('northwest')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                initialMethod === 'northwest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Esq. Noroeste
            </button>
          </div>
        </div>

        {/* Optimización MODI */}
        <div className="flex flex-col justify-center gap-1.5">
          <label className="text-xs font-medium text-zinc-300">Optimización de Redes:</label>
          <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer bg-black/40 p-2 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition">
            <input
              type="checkbox"
              checked={optimizeWithMODI}
              onChange={(e) => onToggleOptimizeWithMODI(e.target.checked)}
              className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
            />
            <span>Aplicar Método MODI / Cruce del Arroyo hasta alcanzar el Óptimo</span>
          </label>
        </div>
      </div>

      {/* Indicador de Balanceo de Oferta y Demanda */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          isBalanced
            ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/[0.08] border-amber-500/20 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 shrink-0" />
          <span>
            {isBalanced ? (
              <strong>Problema Balanceado:</strong>
            ) : (
              <strong>Problema Desbalanceado:</strong>
            )}{' '}
            Oferta Total = <span className="font-mono">{totalSupply.toString()} u</span>, Demanda Total ={' '}
            <span className="font-mono">{totalDemand.toString()} u</span>.
          </span>
        </div>
        {!isBalanced && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 border border-amber-500/30 font-semibold">
            Se activará fila/col ficticia con costo 0
          </span>
        )}
      </div>

      {/* Editor Matricial Interactivo */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-zinc-400 font-medium">Orígenes \ Destinos</th>
              {model.destinations.map((dest, j) => (
                <th key={dest.id} className="p-2 min-w-[120px] text-center">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <input
                      type="text"
                      value={dest.name}
                      onChange={(e) => {
                        const newDest = [...model.destinations];
                        newDest[j].name = e.target.value;
                        onChangeModel({ ...model, destinations: newDest });
                      }}
                      className="bg-black/40 border border-white/[0.08] rounded px-1.5 py-0.5 text-center text-xs text-white font-semibold w-full"
                    />
                    {model.destinations.length > 2 && (
                      <button
                        onClick={() => handleRemoveDestination(j)}
                        className="text-zinc-500 hover:text-rose-400 p-0.5"
                        title="Eliminar Destino"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
                    <span>Demanda:</span>
                    <input
                      type="text"
                      defaultValue={dest.demand.toString()}
                      onBlur={(e) => {
                        try {
                          const parsed = Fraction.parse(e.target.value);
                          const newDest = [...model.destinations];
                          newDest[j].demand = parsed;
                          onChangeModel({ ...model, destinations: newDest });
                        } catch {}
                      }}
                      className="w-14 bg-black/60 border border-blue-500/40 rounded px-1 text-center font-mono text-blue-300 font-bold"
                    />
                  </div>
                </th>
              ))}
              <th className="p-2 min-w-[110px] text-center text-zinc-300 font-medium">Oferta</th>
              <th className="p-2 w-10 text-center">
                <button
                  onClick={handleAddDestination}
                  className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto"
                  title="Agregar Destino"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {model.origins.map((orig, i) => (
              <tr key={orig.id}>
                <td className="p-2 min-w-[140px]">
                  <div className="flex items-center gap-1.5">
                    {model.origins.length > 2 && (
                      <button
                        onClick={() => handleRemoveOrigin(i)}
                        className="text-zinc-500 hover:text-rose-400 p-0.5"
                        title="Eliminar Origen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <input
                      type="text"
                      value={orig.name}
                      onChange={(e) => {
                        const newOrig = [...model.origins];
                        newOrig[i].name = e.target.value;
                        onChangeModel({ ...model, origins: newOrig });
                      }}
                      className="bg-black/40 border border-white/[0.08] rounded px-1.5 py-0.5 text-xs text-white font-semibold w-full"
                    />
                  </div>
                </td>

                {/* Celdas de costo */}
                {model.destinations.map((_, j) => {
                  const isProhibited = model.prohibited?.[i]?.[j] ?? false;
                  return (
                    <td key={j} className="p-1.5 text-center">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="text"
                          disabled={isProhibited}
                          defaultValue={isProhibited ? 'M' : model.costs[i][j].toString()}
                          key={`${i}-${j}-${isProhibited}`}
                          onBlur={(e) => handleCostChange(i, j, e.target.value)}
                          className={`w-full py-1.5 px-2 text-center font-mono rounded-lg border text-xs ${
                            isProhibited
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
                              : 'bg-black/40 border-white/[0.08] text-zinc-200 focus:border-blue-500/50'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleToggleProhibited(i, j)}
                          className={`absolute right-1 text-[10px] p-0.5 rounded transition ${
                            isProhibited
                              ? 'text-rose-400 hover:text-white'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                          title={isProhibited ? 'Habilitar ruta' : 'Bloquear ruta (Costo M)'}
                        >
                          <ShieldAlert className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  );
                })}

                {/* Entrada de Capacidad / Oferta */}
                <td className="p-1.5 text-center">
                  <input
                    type="text"
                    defaultValue={orig.supply.toString()}
                    onBlur={(e) => {
                      try {
                        const parsed = Fraction.parse(e.target.value);
                        const newOrig = [...model.origins];
                        newOrig[i].supply = parsed;
                        onChangeModel({ ...model, origins: newOrig });
                      } catch {}
                    }}
                    className="w-full py-1.5 px-2 text-center font-mono font-bold text-zinc-100 bg-black/60 border border-white/[0.1] rounded-lg text-xs"
                  />
                </td>

                <td />
              </tr>
            ))}

            {/* Fila para agregar origen */}
            <tr>
              <td className="p-2">
                <button
                  onClick={handleAddOrigin}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 rounded-lg border border-blue-500/20"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agregar Origen</span>
                </button>
              </td>
              <td colSpan={model.destinations.length + 2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
