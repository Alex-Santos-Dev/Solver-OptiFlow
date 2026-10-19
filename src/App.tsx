import React, { useState, useMemo } from 'react';
import { LPModel } from './core/parser/lpTypes';
import { GraphicSolver } from './core/graphic/graphicSolver';
import { SimplexSolver, SimplexMethodOption } from './core/simplex/simplexSolver';
import { GraphicSolution, GraphicPoint } from './core/graphic/graphicTypes';
import { SimplexResult } from './core/simplex/simplexTypes';
import { PresetProblem, PRESET_PROBLEMS } from './core/presets';

import { Header } from './components/Header';
import { ProblemInput } from './components/ProblemInput';
import { MethodSelector, ResolutionMethod } from './components/MethodSelector';
import { GraphicCanvas } from './components/GraphicView/GraphicCanvas';
import { GraphicVerticesTable } from './components/GraphicView/GraphicVerticesTable';
import { GraphicStepsView } from './components/GraphicView/GraphicStepsView';
import { SimplexSolutionView } from './components/SimplexView/SimplexSolutionView';
import { TransportView } from './components/TransportView/TransportView';
import { PresetsModal } from './components/PresetsModal';

import { Table2, Info, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente Principal App
 * -------------------------------------------------------------
 * Coordina todo el flujo de la aplicación:
 * 1. Entrada de datos (texto libre o constructor interactivo).
 * 2. Selección de método:
 *    - Método Gráfico 2D (con validación de dimensionalidad).
 *    - Método Simplex (con opciones de Gran M o Dos Fases).
 * 3. Ejecución reactiva de los solvers al modificar el modelo.
 * 4. Distribución en panel responsivo de 2 columnas (editor a la izquierda, solución a la derecha).
 */
export const App: React.FC = () => {
  // Modelo actual analizado (función objetivo, restricciones, variables)
  const [model, setModel] = useState<LPModel | null>(null);

  // Método de resolución seleccionado ('graphic' o 'simplex')
  const [method, setMethod] = useState<ResolutionMethod>('graphic');

  // Variante del método Simplex ('bigM' o 'twoPhase')
  const [simplexOption, setSimplexOption] = useState<SimplexMethodOption>('bigM');

  // Control de apertura de la ventana modal de ejemplos típicos
  const [presetsModalOpen, setPresetsModalOpen] = useState(false);

  // Texto inicial por defecto (Problema de Producción Estándar)
  const [inputText, setInputText] = useState(PRESET_PROBLEMS[0].text);

  // Control de expansión del panel del editor para problemas de gran escala
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  // Vértice actualmente seleccionado para resaltar entre la tabla y el canvas
  const [selectedVertex, setSelectedVertex] = useState<GraphicPoint | null>(null);

  // Conteo de variables de decisión
  const varCount = model ? model.variables.length : 2;

  // Cálculo reactivo de la solución gráfica (solo se recalcula si cambia el modelo)
  const graphicSolution: GraphicSolution | null = useMemo(() => {
    if (!model) return null;
    return GraphicSolver.solve(model);
  }, [model]);

  // Cálculo reactivo de la solución Simplex (solo se recalcula si cambia el modelo o la variante)
  const simplexResult: SimplexResult | null = useMemo(() => {
    if (!model) return null;
    return SimplexSolver.solve(model, simplexOption);
  }, [model, simplexOption]);

  /**
   * Carga un problema predefinido de la biblioteca de ejemplos
   */
  const handleSelectPreset = (preset: PresetProblem) => {
    setInputText(preset.text);
    if (preset.recommendedMethod) {
      setMethod(preset.recommendedMethod);
    }
    if (preset.simplexMethod) {
      setSimplexOption(preset.simplexMethod);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e12] text-[#f5f5f7] macos-ambient selection:bg-blue-500/30 selection:text-white">
      {/* Barra de Encabezado Superior (Ventana macOS) */}
      <Header onOpenPresets={() => setPresetsModalOpen(true)} />

      {/* Área de Trabajo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Selector de Método (Segmented Control macOS) */}
        <MethodSelector
          method={method}
          onMethodChange={(m) => setMethod(m)}
          simplexOption={simplexOption}
          onSimplexOptionChange={(opt) => setSimplexOption(opt)}
          variableCount={varCount}
        />

        {/* Vista Condicional: Modo Transporte y Redes vs Modo Programación Lineal General */}
        {method === 'transport' ? (
          <TransportView />
        ) : (
          /* Distribución Dinámica (Modo Dividido vs Modo Expandido para Multivariables) */
          <div
            className={
              isEditorExpanded
                ? 'flex flex-col gap-6'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
            }
          >
            {/* Columna Izquierda / Panel Completo: Entrada del Problema */}
            <div className={isEditorExpanded ? 'w-full flex flex-col gap-5' : 'lg:col-span-5 flex flex-col gap-5'}>
              <ProblemInput
                initialText={inputText}
                isExpanded={isEditorExpanded}
                onToggleExpand={() => setIsEditorExpanded(!isEditorExpanded)}
                onModelChange={(newModel) => {
                  setModel(newModel);
                  // Si el usuario introduce más de 2 variables, conmutar automáticamente a Simplex
                  if (newModel && newModel.variables.length > 2 && method === 'graphic') {
                    setMethod('simplex');
                  }
                }}
                onOpenPresets={() => setPresetsModalOpen(true)}
              />

              {/* Tarjeta de Guía Pedagógica (Inspector macOS) */}
              {!isEditorExpanded && (
                <div className="bg-[#18191e]/50 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl flex flex-col gap-2 text-xs text-zinc-400 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>Orientación Didáctica de Métodos</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 leading-relaxed">
                    <li>
                      <strong className="text-zinc-300 font-medium">Método Gráfico:</strong> Ideal para visualizar el polígono de soluciones factibles, vértices analíticos y la recta de nivel Z en problemas de 2 variables.
                    </li>
                    <li>
                      <strong className="text-zinc-300 font-medium">Método Simplex:</strong> Recomendado para cualquier cantidad de variables (2 a 16+). Muestra la matriz de la tabla inicial, criterio de razón mínima, elemento pivote y operaciones Gauss-Jordan paso a paso.
                    </li>
                    <li>
                      <strong className="text-zinc-300 font-medium">Transporte y Redes:</strong> Resuelve problemas logísticos con Esquina Noroeste, Costo Mínimo, Vogel (VAM) y optimización MODI con alertas de casos especiales.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Columna Derecha / Panel Inferior: Vista de Resolución Paso a Paso */}
            <div className={isEditorExpanded ? 'w-full flex flex-col gap-6' : 'lg:col-span-7 flex flex-col gap-6'}>
            {!model ? (
              <div className="p-12 bg-[#18191e]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                  <Table2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-zinc-200 tracking-tight">
                  Ingresa o formula un problema de Programación Lineal
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                  Usa el panel de la izquierda para ingresar tu función objetivo y restricciones, o carga un ejemplo típico desde la barra superior.
                </p>
              </div>
            ) : method === 'graphic' ? (
              /* Vista del Método Gráfico */
              graphicSolution?.is2D ? (
                <div className="flex flex-col gap-6">
                  {/* Banner de Estado de la Solución (Subtle pill banner) */}
                  <div
                    className={`p-3.5 px-4 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 text-xs ${
                      graphicSolution.status === 'optimal'
                        ? 'bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300'
                        : graphicSolution.status === 'alternative_optima'
                        ? 'bg-amber-500/[0.08] border-amber-500/20 text-amber-300'
                        : 'bg-rose-500/[0.08] border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <div>
                        <span className="font-semibold text-xs sm:text-sm block">
                          {graphicSolution.statusMessage}
                        </span>
                        {graphicSolution.optimalValue && (
                          <span className="text-zinc-400 text-[11px]">
                            Valor óptimo analítico calculado en el vértice extremo.
                          </span>
                        )}
                      </div>
                    </div>
                    {graphicSolution.optimalValue && (
                      <span className="text-base sm:text-lg font-mono font-bold shrink-0 text-emerald-400">
                        Z* = {graphicSolution.optimalValue.toString()}
                      </span>
                    )}
                  </div>

                  {/* Plano Cartesiano Interactivo (Canvas) */}
                  <GraphicCanvas
                    solution={graphicSolution}
                    onSelectVertex={(v) => setSelectedVertex(v)}
                  />

                  {/* Tabla de Vértices con Evaluación de Z */}
                  <GraphicVerticesTable
                    solution={graphicSolution}
                    selectedVertex={selectedVertex}
                    onSelectVertex={(v) => setSelectedVertex(v)}
                  />

                  {/* Pasos Analíticos Teóricos */}
                  <GraphicStepsView solution={graphicSolution} />
                </div>
              ) : (
                /* Advertencia cuando se elige Método Gráfico con más de 2 variables */
                <div className="p-8 bg-[#18191e]/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col items-center text-center gap-4 shadow-lg">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/[0.1] border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                      Método Gráfico no aplicable ({varCount} variables)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">
                      El método gráfico está restringido al plano cartesiano bidimensional (2 variables). Para resolver problemas con 3 o más variables ({model.variables.join(', ')}), debes usar el Método Simplex.
                    </p>
                  </div>
                  <button
                    onClick={() => setMethod('simplex')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow-[0_2px_8px_rgba(10,132,255,0.3)] transition"
                  >
                    <span>Cambiar al Método Simplex</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            ) : (
              /* Vista del Método Simplex */
              simplexResult && <SimplexSolutionView result={simplexResult} />
            )}
          </div>
        </div>
        )}
      </main>

      {/* Pie de Página */}
      <footer className="w-full border-t border-white/[0.06] bg-[#0d0e12]/80 backdrop-blur-xl py-4 mt-12 text-center text-xs text-zinc-500">
        <p>
          <strong className="text-zinc-300 font-semibold">OptiFlow (Beta 0.0.1)</strong> &bull; Investigación de Operaciones &bull; Fracciones Exactas (`BigInt`), Simplex, Gran M, Dos Fases, Método Gráfico y Modelos de Transporte.
        </p>
      </footer>

      {/* Ventana Modal con Ejemplos Clásicos de Libro */}
      <PresetsModal
        isOpen={presetsModalOpen}
        onClose={() => setPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
};

export default App;
