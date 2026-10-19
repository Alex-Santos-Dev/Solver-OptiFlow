import React from 'react';
import { PRESET_PROBLEMS, PresetProblem } from '../core/presets';
import { X, Sparkles, ArrowRight, LineChart, Table2 } from 'lucide-react';

/**
 * Propiedades del componente modal de problemas predefinidos (PresetsModal).
 */
interface PresetsModalProps {
  /** Indica si la ventana modal se encuentra visible o cerrada */
  isOpen: boolean;
  /** Función callback para cerrar el modal al hacer clic en el backdrop o en el botón de cerrar */
  onClose: () => void;
  /** Función callback que carga el problema seleccionado en el estado global de la aplicación */
  onSelectPreset: (preset: PresetProblem) => void;
}

/**
 * Componente Modal para Exploración y Selección de Problemas Preestablecidos.
 *
 * Presenta una galería de ejercicios emblemáticos de libros de texto de Investigación de Operaciones
 * (Taha, Hillier-Lieberman), abarcando:
 * 1. Producción y Maximización Estándar (2D)
 * 2. Dieta y Minimización (Variables de Exceso y Gran M)
 * 3. Mezcla Química con Igualdad (Dos Fases)
 * 4. Óptimos Múltiples (Soluciones Infinitas)
 * 5. Región No Acotada (Unbounded)
 * 6. Problema Infactible (Región Vacía)
 * 7. Modelo Multivariable de 3 dimensiones
 *
 * Al seleccionar un caso, inyecta su formulación directamente en el parser y selecciona el método recomendado.
 */
export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#18191e]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)] flex flex-col overflow-hidden">
        {/* Cabecera del Modal (Estilo macOS Sheet Titlebar) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-1.5 pr-1">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20 shadow-inner hover:opacity-80 transition cursor-pointer"
                title="Cerrar"
              />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/20 shadow-inner cursor-default opacity-50"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20 shadow-inner cursor-default opacity-50"></span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                Biblioteca de Problemas Clásicos (IO)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
            title="Cerrar ventana"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lista con Scroll de los Problemas Preconfigurados */}
        <div className="overflow-y-auto p-4 flex flex-col gap-2.5">
          {PRESET_PROBLEMS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group p-3.5 bg-black/20 hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm"
            >
              {/* Título del Caso y Acción Hover */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-xs sm:text-sm text-zinc-200 group-hover:text-blue-400 transition flex items-center gap-2">
                  {preset.name}
                </h3>
                <span className="flex items-center gap-1 text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                  Cargar <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              {/* Descripción Teórica */}
              <p className="text-xs text-zinc-400 leading-relaxed">
                {preset.description}
              </p>

              {/* Insignia del Método Recomendado */}
              <div className="flex items-center gap-2 pt-0.5">
                {preset.recommendedMethod === 'graphic' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/[0.08] text-[10px] font-medium">
                    <LineChart className="w-3 h-3 text-blue-400" /> Gráfico & Simplex
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 border border-white/[0.08] text-[10px] font-medium">
                    <Table2 className="w-3 h-3 text-indigo-400" /> Simplex ({preset.simplexMethod === 'twoPhase' ? 'Dos Fases' : 'Gran M'})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

