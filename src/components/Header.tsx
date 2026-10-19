import React from 'react';
import { Calculator, Printer, Sparkles, SlidersHorizontal } from 'lucide-react';

/**
 * Propiedades del componente Header.
 */
interface HeaderProps {
  /** Función callback que se ejecuta al presionar el botón "Ejemplos" para desplegar el modal de problemas predefinidos */
  onOpenPresets: () => void;
}

/**
 * Componente de Encabezado Superior (Header) con diseño inspirado en la barra de ventana de macOS.
 */
export const Header: React.FC<HeaderProps> = ({ onOpenPresets }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="w-full bg-[#14151a]/80 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Identidad de Marca y Controles de Ventana macOS */}
        <div className="flex items-center gap-4">
          {/* macOS Traffic Lights (Botones de Ventana) */}
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20 shadow-inner inline-block hover:opacity-80 transition cursor-default"></span>
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/20 shadow-inner inline-block hover:opacity-80 transition cursor-default"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20 shadow-inner inline-block hover:opacity-80 transition cursor-default"></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
              <Calculator className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                  <span>OptiFlow</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium">
                    Beta 0.0.1
                  </span>
                </h1>
                <span className="text-zinc-600 font-light hidden sm:inline">•</span>
                <span className="text-xs text-zinc-400 font-normal hidden sm:inline">
                  Investigación de Operaciones
                </span>
                {/* Badge minimalista de precisión simbólica */}
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20 text-[10px] font-medium tracking-tight">
                  Fracciones Exactas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción Estilo Barra de Herramientas de macOS */}
        <div className="flex items-center gap-2">
          {/* Botón de Ejemplos Predefinidos */}
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/90" />
            <span className="hidden sm:inline">Ejemplos de Libro</span>
            <span className="sm:hidden">Ejemplos</span>
          </button>

          {/* Botón de Exportación / Impresión */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.2)] print:hidden"
            title="Exportar reporte limpio para tarea o examen"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Exportar / Imprimir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

