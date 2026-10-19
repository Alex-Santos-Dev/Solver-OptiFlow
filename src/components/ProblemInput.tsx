import React, { useState, useEffect } from 'react';
import { LPModel, ObjectiveType, ConstraintOperator } from '../core/parser/lpTypes';
import { LPParser } from '../core/parser/lpParser';
import { Fraction } from '../core/math/fraction';
import { LatexMath } from './LatexMath';
import {
  Plus,
  Trash2,
  Edit3,
  Code2,
  Sparkles,
  AlertCircle,
  Table2,
  SlidersHorizontal,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

/**
 * Propiedades del componente ProblemInput
 */
interface ProblemInputProps {
  /** Callback emitido cada vez que el modelo ingresado cambia o es validado */
  onModelChange: (model: LPModel | null) => void;
  /** Texto inicial predeterminado para el editor */
  initialText?: string;
  /** Acción para abrir el modal con el banco de problemas clásicos */
  onOpenPresets: () => void;
  /** Si el editor se encuentra expandido en pantalla completa o ancho completo */
  isExpanded?: boolean;
  /** Callback para alternar entre vista dividida y modo expandido */
  onToggleExpand?: () => void;
}

/**
 * Componente ProblemInput (Entrada y Formulación de Problemas Multivariables)
 * ----------------------------------------------------------------------------
 * Permite formular problemas de Programación Lineal con cualquier número de variables (2 a 16+)
 * y restricciones (1 a 25+) con estabilidad visual completa.
 *
 * Características clave:
 * 1. Modo Texto Libre: Edición en lenguaje natural con análisis sintáctico reactivo.
 * 2. Modo Constructor Visual:
 *    - Vista Matriz Tabular (estilo hoja de cálculo/TORA/Lindo): alineación 100% vertical
 *      de columnas con scroll horizontal suave, evitando saltos y desórdenes visuales.
 *    - Vista de Ecuaciones en Línea: formulación matemática sin cortes rotos entre términos.
 * 3. Controles directos de dimensiones: steppers y entrada numérica rápida de variables y restricciones.
 * 4. Sincronización bidireccional inteligente entre Texto Libre y Constructor Visual.
 * 5. Prevención de colisiones de variables y renderizado formal con subíndices KaTeX.
 */
export const ProblemInput: React.FC<ProblemInputProps> = ({
  onModelChange,
  initialText = `Max Z = 3x1 + 5x2
s.a.
x1 <= 4
2x2 <= 12
3x1 + 2x2 <= 18
x1, x2 >= 0`,
  onOpenPresets,
  isExpanded = false,
  onToggleExpand,
}) => {
  // Modo de edición: 'text' (texto libre) o 'form' (constructor visual interactivo)
  const [inputMode, setInputMode] = useState<'text' | 'form'>('text');

  // Sub-vista dentro del constructor visual: 'matrix' (matriz tabular alineada) o 'equations' (ecuaciones)
  const [visualView, setVisualView] = useState<'matrix' | 'equations'>('matrix');

  // Contenido de texto en el modo libre
  const [rawText, setRawText] = useState(initialText);

  // Mensaje de error si la sintaxis del texto no es válida
  const [parseError, setParseError] = useState<string | null>(null);

  // Modelo analizado actualmente
  const [currentModel, setCurrentModel] = useState<LPModel | null>(null);

  // Estado del Constructor Visual (Modo Formulario)
  const [formObjType, setFormObjType] = useState<ObjectiveType>('max');
  const [formVars, setFormVars] = useState<string[]>(['x1', 'x2']);
  const [formObjCoeffs, setFormObjCoeffs] = useState<Record<string, string>>({
    x1: '3',
    x2: '5',
  });
  const [formConstraints, setFormConstraints] = useState<
    { id: string; coeffs: Record<string, string>; op: ConstraintOperator; rhs: string }[]
  >([
    { id: 'R1', coeffs: { x1: '1', x2: '0' }, op: '<=', rhs: '4' },
    { id: 'R2', coeffs: { x1: '0', x2: '2' }, op: '<=', rhs: '12' },
    { id: 'R3', coeffs: { x1: '3', x2: '2' }, op: '<=', rhs: '18' },
  ]);

  // Sincronizar cuando cambia el texto inicial desde un preset externo
  useEffect(() => {
    setRawText(initialText);
  }, [initialText]);

  // Efecto reactivo para analizar el texto cada vez que el usuario escribe en Modo Texto
  useEffect(() => {
    if (inputMode === 'text') {
      const res = LPParser.parse(rawText);
      if (res.error || !res.model) {
        setParseError(res.error || 'Error desconocido al parsear el modelo.');
        setCurrentModel(null);
        onModelChange(null);
      } else {
        setParseError(null);
        setCurrentModel(res.model);
        onModelChange(res.model);
      }
    }
  }, [rawText, inputMode]);

  /**
   * Convierte el estado actual del constructor visual a una cadena de texto algebraico estándar
   */
  const formatFormToText = (
    objType: ObjectiveType,
    vars: string[],
    objCoeffs: Record<string, string>,
    constraints: { coeffs: Record<string, string>; op: ConstraintOperator; rhs: string }[]
  ): string => {
    const objTerms: string[] = [];
    vars.forEach((v) => {
      const raw = (objCoeffs[v] || '0').trim();
      if (raw === '0' || raw === '') return;
      let sign = '+';
      let val = raw;
      if (val.startsWith('-')) {
        sign = '-';
        val = val.substring(1).trim();
      }
      const term = val === '1' ? v : `${val}${v}`;
      if (objTerms.length === 0) {
        objTerms.push(sign === '-' ? `-${term}` : term);
      } else {
        objTerms.push(`${sign} ${term}`);
      }
    });

    const objLine = `${objType === 'max' ? 'Max' : 'Min'} Z = ${
      objTerms.length > 0 ? objTerms.join(' ') : '0'
    }`;

    const constraintLines = constraints.map((c) => {
      const terms: string[] = [];
      vars.forEach((v) => {
        const raw = (c.coeffs[v] || '0').trim();
        if (raw === '0' || raw === '') return;
        let sign = '+';
        let val = raw;
        if (val.startsWith('-')) {
          sign = '-';
          val = val.substring(1).trim();
        }
        const term = val === '1' ? v : `${val}${v}`;
        if (terms.length === 0) {
          terms.push(sign === '-' ? `-${term}` : term);
        } else {
          terms.push(`${sign} ${term}`);
        }
      });
      const lhs = terms.length > 0 ? terms.join(' ') : '0';
      return `${lhs} ${c.op} ${c.rhs || '0'}`;
    });

    const nonNegLine = `${vars.join(', ')} >= 0`;

    return `${objLine}\ns.a.\n${constraintLines.join('\n')}\n${nonNegLine}`;
  };

  /**
   * Sincroniza el estado del constructor visual (formulario) hacia el modelo canónico LPModel
   */
  const syncFormToModel = () => {
    try {
      const objCoeffs: Record<string, Fraction> = {};
      for (const v of formVars) {
        objCoeffs[v] = Fraction.parse(formObjCoeffs[v] || '0');
      }

      const constraints = formConstraints.map((c, idx) => {
        const coeffs: Record<string, Fraction> = {};
        for (const v of formVars) {
          coeffs[v] = Fraction.parse(c.coeffs[v] || '0');
        }
        return {
          id: `R${idx + 1}`,
          coefficients: coeffs,
          operator: c.op,
          rhs: Fraction.parse(c.rhs || '0'),
        };
      });

      const model: LPModel = {
        objectiveType: formObjType,
        objectiveCoefficients: objCoeffs,
        constraints,
        variables: formVars,
        nonNegativity: true,
      };

      setCurrentModel(model);
      setParseError(null);
      onModelChange(model);
    } catch (e: any) {
      setParseError(`Error en el constructor: ${e.message}`);
    }
  };

  // Efecto reactivo para actualizar el modelo al modificar cualquier campo del formulario
  useEffect(() => {
    if (inputMode === 'form') {
      syncFormToModel();
    }
  }, [formObjType, formVars, formObjCoeffs, formConstraints, inputMode]);

  /**
   * Conmuta a modo Texto Libre transfiriendo la formulación actual del constructor
   */
  const handleSelectTextMode = () => {
    if (inputMode === 'form') {
      const formatted = formatFormToText(formObjType, formVars, formObjCoeffs, formConstraints);
      setRawText(formatted);
    }
    setInputMode('text');
  };

  /**
   * Conmuta a modo Constructor Visual sincronizando desde el modelo parsed actual
   */
  const handleSelectFormMode = () => {
    if (currentModel) {
      setFormObjType(currentModel.objectiveType);
      setFormVars([...currentModel.variables]);

      const newObj: Record<string, string> = {};
      currentModel.variables.forEach((v) => {
        newObj[v] = currentModel.objectiveCoefficients[v]
          ? currentModel.objectiveCoefficients[v].toString()
          : '0';
      });
      setFormObjCoeffs(newObj);

      const newConstraints = currentModel.constraints.map((c, i) => {
        const coeffs: Record<string, string> = {};
        currentModel.variables.forEach((v) => {
          coeffs[v] = c.coefficients[v] ? c.coefficients[v].toString() : '0';
        });
        return {
          id: `R${i + 1}`,
          coeffs,
          op: c.operator,
          rhs: c.rhs.toString(),
        };
      });
      setFormConstraints(newConstraints);
    }
    setInputMode('form');
  };

  /**
   * Ajusta la cantidad total de variables preservando datos existentes
   */
  const handleVariableCountChange = (targetCount: number) => {
    const count = Math.max(2, Math.min(16, targetCount));
    if (count === formVars.length) return;

    if (count > formVars.length) {
      const updatedVars = [...formVars];
      const updatedObjCoeffs = { ...formObjCoeffs };
      const updatedConstraints = formConstraints.map((c) => ({ ...c, coeffs: { ...c.coeffs } }));

      while (updatedVars.length < count) {
        let k = 1;
        while (updatedVars.includes(`x${k}`)) k++;
        const newVar = `x${k}`;
        updatedVars.push(newVar);
        updatedObjCoeffs[newVar] = '1';
        for (const c of updatedConstraints) {
          c.coeffs[newVar] = '0';
        }
      }

      setFormVars(updatedVars);
      setFormObjCoeffs(updatedObjCoeffs);
      setFormConstraints(updatedConstraints);
    } else {
      const keptVars = formVars.slice(0, count);
      setFormVars(keptVars);
    }
  };

  /**
   * Ajusta la cantidad total de restricciones preservando datos existentes
   */
  const handleConstraintCountChange = (targetCount: number) => {
    const count = Math.max(1, Math.min(25, targetCount));
    if (count === formConstraints.length) return;

    if (count > formConstraints.length) {
      const updated = [...formConstraints];
      while (updated.length < count) {
        const defaultCoeffs: Record<string, string> = {};
        formVars.forEach((v) => (defaultCoeffs[v] = '1'));
        updated.push({
          id: `R${updated.length + 1}`,
          coeffs: defaultCoeffs,
          op: '<=',
          rhs: '10',
        });
      }
      setFormConstraints(updated);
    } else {
      setFormConstraints(formConstraints.slice(0, count));
    }
  };

  /** Agrega una nueva variable de decisión asegurando nombre único */
  const addVariable = () => {
    handleVariableCountChange(formVars.length + 1);
  };

  /** Elimina una variable específica y limpia sus referencias */
  const removeVariable = (varName: string) => {
    if (formVars.length <= 2) return;
    const newVars = formVars.filter((v) => v !== varName);
    const newObjCoeffs = { ...formObjCoeffs };
    delete newObjCoeffs[varName];
    const newConstraints = formConstraints.map((c) => {
      const newCoeffs = { ...c.coeffs };
      delete newCoeffs[varName];
      return { ...c, coeffs: newCoeffs };
    });
    setFormVars(newVars);
    setFormObjCoeffs(newObjCoeffs);
    setFormConstraints(newConstraints);
  };

  /** Agrega una nueva fila de restricción */
  const addConstraint = () => {
    handleConstraintCountChange(formConstraints.length + 1);
  };

  /** Elimina una fila de restricción por su índice */
  const removeConstraint = (idx: number) => {
    if (formConstraints.length <= 1) return;
    setFormConstraints(formConstraints.filter((_, i) => i !== idx));
  };

  /** Limpia todos los coeficientes a cero */
  const clearAllCoeffs = () => {
    const newObjCoeffs: Record<string, string> = {};
    formVars.forEach((v) => (newObjCoeffs[v] = '0'));
    const newConstraints = formConstraints.map((c) => {
      const coeffs: Record<string, string> = {};
      formVars.forEach((v) => (coeffs[v] = '0'));
      return { ...c, coeffs, rhs: '0' };
    });
    setFormObjCoeffs(newObjCoeffs);
    setFormConstraints(newConstraints);
  };

  /** Helper para formatear subíndices de variables en KaTeX (ej: x1 -> x_{1}) */
  const formatVarLatex = (v: string): string => {
    if (v.includes('_') || v.includes('{')) return v;
    return v.replace(/([a-zA-Z]+)(\d+)/g, '$1_{$2}');
  };

  return (
    <div className="flex flex-col gap-4 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all">
      {/* Barra de Acciones Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        {/* Selector de Modo de Entrada (Texto vs Formulario) */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={handleSelectTextMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              inputMode === 'text'
                ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Texto Libre</span>
          </button>
          <button
            type="button"
            onClick={handleSelectFormMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              inputMode === 'form'
                ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Constructor Visual</span>
          </button>
        </div>

        {/* Acciones del lado derecho: Alternar expansión y Cargar ejemplos */}
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isExpanded
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-sm'
                  : 'bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 border-white/[0.08]'
              }`}
              title={isExpanded ? 'Volver a vista dividida (5:7)' : 'Expandir editor a ancho completo (12 columnas)'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vista Dividida</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Expandir Editor</span>
                </>
              )}
            </button>
          )}

          {/* Botón para Abrir el Banco de Problemas Predefinidos */}
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/[0.08] hover:bg-amber-500/[0.15] border border-amber-500/20 text-amber-300 rounded-lg text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/90" />
            <span>Cargar Ejemplos</span>
          </button>
        </div>
      </div>

      {/* Vista de Modo Texto Libre */}
      {inputMode === 'text' ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Formulación en lenguaje algebraico estándar:</span>
            <span className="text-[11px] text-zinc-500 font-mono">Max Z = 3x1 + 5x2 + 4x3</span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            className="w-full bg-black/25 focus:bg-black/35 border border-white/[0.08] focus:border-blue-500/50 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-y shadow-inner leading-relaxed"
            placeholder={`Max Z = 3x1 + 5x2 + 2x3\ns.a.\n2x1 + x2 + 3x3 <= 100\nx1 + 2x2 + x3 <= 80\nx1, x2, x3 >= 0`}
          />
        </div>
      ) : (
        /* Vista de Modo Constructor Visual */
        <div className="flex flex-col gap-4">
          {/* Barra de Configuración de Dimensiones y Visualización */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/25 p-3 rounded-xl border border-white/[0.06]">
            {/* Tipo de Objetivo: Maximizar vs Minimizar */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setFormObjType('max')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  formObjType === 'max'
                    ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Maximizar (Max)
              </button>
              <button
                type="button"
                onClick={() => setFormObjType('min')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  formObjType === 'min'
                    ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Minimizar (Min)
              </button>
            </div>

            {/* Steppers de Dimensiones (Cantidad de Variables y Restricciones) */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Stepper de Variables */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Variables:</span>
                <div className="flex items-center bg-black/30 border border-white/[0.08] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => handleVariableCountChange(formVars.length - 1)}
                    disabled={formVars.length <= 2}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none hover:bg-white/[0.05] rounded transition font-bold"
                    title="Reducir variables (mínimo 2)"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-mono font-semibold text-zinc-100">
                    {formVars.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleVariableCountChange(formVars.length + 1)}
                    disabled={formVars.length >= 16}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none hover:bg-white/[0.05] rounded transition font-bold"
                    title="Aumentar variables (hasta 16)"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper de Restricciones */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Restricciones:</span>
                <div className="flex items-center bg-black/30 border border-white/[0.08] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => handleConstraintCountChange(formConstraints.length - 1)}
                    disabled={formConstraints.length <= 1}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none hover:bg-white/[0.05] rounded transition font-bold"
                    title="Reducir restricciones (mínimo 1)"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-mono font-semibold text-zinc-100">
                    {formConstraints.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleConstraintCountChange(formConstraints.length + 1)}
                    disabled={formConstraints.length >= 25}
                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none hover:bg-white/[0.05] rounded transition font-bold"
                    title="Aumentar restricciones (hasta 25)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Alternador de Vista Visual: Matriz vs Ecuaciones */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setVisualView('matrix')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  visualView === 'matrix'
                    ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Vista Matriz Tabular (columnas 100% alineadas, ideal para muchas variables)"
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Matriz</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualView('equations')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  visualView === 'equations'
                    ? 'bg-white/[0.14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Vista de Ecuaciones en Línea"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ecuaciones</span>
              </button>
            </div>
          </div>

          {/* VISTA 1: MATRIZ TABULAR INTERACTIVA (Recomendada para Multivariables) */}
          {visualView === 'matrix' ? (
            <div className="flex flex-col gap-2">
              <div className="w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-black/30 shadow-inner scrollbar-thin">
                <table className="w-full min-w-max border-collapse text-xs text-center">
                  <thead>
                    <tr className="bg-white/[0.04] text-zinc-400 font-medium border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3.5 text-left sticky left-0 z-20 bg-[#16171c] shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap min-w-[90px]">
                        Ecuación
                      </th>
                      {formVars.map((v) => (
                        <th key={v} className="py-2.5 px-2 min-w-[76px] whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md shadow-sm">
                            <span className="font-mono text-zinc-200 font-semibold">
                              <LatexMath math={formatVarLatex(v)} />
                            </span>
                            {formVars.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeVariable(v)}
                                className="text-zinc-500 hover:text-rose-400 text-xs transition ml-0.5"
                                title={`Eliminar variable ${v}`}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="py-2.5 px-3 min-w-[80px] text-zinc-400 font-medium whitespace-nowrap">
                        Operador
                      </th>
                      <th className="py-2.5 px-3 min-w-[85px] text-zinc-400 font-medium whitespace-nowrap">
                        Lado Der. (b)
                      </th>
                      <th className="py-2.5 px-2 w-10 text-center text-zinc-500 whitespace-nowrap">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-200">
                    {/* Fila Z: Función Objetivo */}
                    <tr className="bg-blue-500/[0.03] border-b-2 border-white/[0.08]">
                      <td className="py-2.5 px-3.5 text-left sticky left-0 z-10 bg-[#171922] shadow-[1px_0_0_0_rgba(255,255,255,0.08)] whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-blue-300 bg-blue-500/15 border border-blue-500/25 shadow-sm font-mono">
                          {formObjType === 'max' ? 'Max Z' : 'Min Z'}
                        </span>
                      </td>
                      {formVars.map((v) => (
                        <td key={v} className="py-2 px-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={formObjCoeffs[v] ?? ''}
                            onChange={(e) =>
                              setFormObjCoeffs({ ...formObjCoeffs, [v]: e.target.value })
                            }
                            className="w-16 bg-white/[0.05] border border-white/[0.08] focus:border-blue-500/60 rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                            placeholder="0"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-3 font-mono text-zinc-500 text-xs whitespace-nowrap font-medium">
                        =
                      </td>
                      <td className="py-2 px-3 font-mono text-blue-400 text-xs font-bold whitespace-nowrap">
                        Z (óptimo)
                      </td>
                      <td className="py-2 px-2 text-zinc-600 text-center whitespace-nowrap">—</td>
                    </tr>

                    {/* Filas de Restricciones R1..Rn */}
                    {formConstraints.map((c, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3.5 text-left sticky left-0 z-10 bg-[#16171c] shadow-[1px_0_0_0_rgba(255,255,255,0.08)] font-mono text-xs font-medium text-zinc-400 whitespace-nowrap">
                          R{rIdx + 1}
                        </td>
                        {formVars.map((v) => (
                          <td key={v} className="py-2 px-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={c.coeffs[v] ?? ''}
                              onChange={(e) => {
                                const updated = [...formConstraints];
                                updated[rIdx].coeffs = { ...c.coeffs, [v]: e.target.value };
                                setFormConstraints(updated);
                              }}
                              className="w-16 bg-white/[0.04] border border-white/[0.08] focus:border-blue-500/60 rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                              placeholder="0"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-2 whitespace-nowrap">
                          <select
                            value={c.op}
                            onChange={(e) => {
                              const updated = [...formConstraints];
                              updated[rIdx].op = e.target.value as ConstraintOperator;
                              setFormConstraints(updated);
                            }}
                            className="bg-zinc-800/90 border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
                          >
                            <option value="<=">&le; (&le;)</option>
                            <option value=">=">&ge; (&ge;)</option>
                            <option value="=">= (=)</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={c.rhs}
                            onChange={(e) => {
                              const updated = [...formConstraints];
                              updated[rIdx].rhs = e.target.value;
                              setFormConstraints(updated);
                            }}
                            className="w-16 bg-white/[0.04] border border-white/[0.08] focus:border-blue-500/60 rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/20 font-medium"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          {formConstraints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeConstraint(rIdx)}
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                              title={`Eliminar restricción R${rIdx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* VISTA 2: ECUACIONES EN LÍNEA (Con Scroll Horizontal Suave, Sin Saltos Rotos) */
            <div className="flex flex-col gap-3">
              {/* Función Objetivo Z */}
              <div className="flex items-center gap-2 bg-black/20 p-3 rounded-xl border border-white/[0.06] overflow-x-auto whitespace-nowrap scrollbar-thin">
                <span className="text-xs font-semibold text-zinc-300 font-mono shrink-0">
                  {formObjType === 'max' ? 'Max Z =' : 'Min Z ='}
                </span>
                {formVars.map((v, i) => (
                  <div key={v} className="inline-flex items-center gap-1 shrink-0">
                    {i > 0 && <span className="text-zinc-500 text-xs font-bold">+</span>}
                    <input
                      type="text"
                      value={formObjCoeffs[v] || ''}
                      onChange={(e) =>
                        setFormObjCoeffs({ ...formObjCoeffs, [v]: e.target.value })
                      }
                      className="w-14 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                      placeholder="1"
                    />
                    <span className="text-xs font-mono text-blue-400 font-medium">
                      <LatexMath math={formatVarLatex(v)} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Lista de Filas de Restricciones */}
              <div className="flex flex-col gap-2">
                {formConstraints.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/[0.06] overflow-x-auto whitespace-nowrap scrollbar-thin"
                  >
                    <span className="text-xs font-mono text-zinc-500 w-7 shrink-0 font-medium">
                      R{idx + 1}:
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {formVars.map((v, vIdx) => (
                        <div key={v} className="inline-flex items-center gap-1 shrink-0">
                          {vIdx > 0 && <span className="text-zinc-600 text-xs">+</span>}
                          <input
                            type="text"
                            value={c.coeffs[v] || ''}
                            onChange={(e) => {
                              const newCoeffs = { ...c.coeffs, [v]: e.target.value };
                              const updated = [...formConstraints];
                              updated[idx].coeffs = newCoeffs;
                              setFormConstraints(updated);
                            }}
                            className="w-14 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20"
                            placeholder="0"
                          />
                          <span className="text-xs font-mono text-zinc-400">
                            <LatexMath math={formatVarLatex(v)} />
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto shrink-0 pl-2 border-l border-white/[0.06]">
                      <select
                        value={c.op}
                        onChange={(e) => {
                          const updated = [...formConstraints];
                          updated[idx].op = e.target.value as ConstraintOperator;
                          setFormConstraints(updated);
                        }}
                        className="bg-zinc-800/90 border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-medium text-zinc-200 focus:outline-none"
                      >
                        <option value="<=">&le; (Menor o igual)</option>
                        <option value=">=">&ge; (Mayor o igual)</option>
                        <option value="=">= (Igual)</option>
                      </select>

                      <input
                        type="text"
                        value={c.rhs}
                        onChange={(e) => {
                          const updated = [...formConstraints];
                          updated[idx].rhs = e.target.value;
                          setFormConstraints(updated);
                        }}
                        className="w-16 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs font-mono text-center text-zinc-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 font-medium"
                        placeholder="0"
                      />

                      {formConstraints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConstraint(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barra Inferior de Acciones Rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addVariable}
                disabled={formVars.length >= 16}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-300 rounded-lg font-medium transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Añadir Variable</span>
              </button>
              <button
                type="button"
                onClick={addConstraint}
                disabled={formConstraints.length >= 25}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-300 rounded-lg font-medium transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Añadir Restricción</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-300 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                <LatexMath math={`${formVars.map(formatVarLatex).join(', ')} \\ge 0`} />
              </span>
              <button
                type="button"
                onClick={clearAllCoeffs}
                className="flex items-center gap-1 px-2.5 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition text-xs"
                title="Poner todos los coeficientes en 0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Error en caso de sintaxis incorrecta */}
      {parseError && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/[0.08] border border-rose-500/20 rounded-xl text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Renderizado de la Formulación Matemática en KaTeX */}
      {currentModel && !parseError && (
        <div className="flex flex-col gap-1.5 bg-black/20 border border-white/[0.06] p-3.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Formulación Matemática del Modelo ({currentModel.variables.length} vars, {currentModel.constraints.length} restr.):
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Renderizado KaTeX
            </span>
          </div>
          <div className="overflow-x-auto text-zinc-200 py-1 scrollbar-thin">
            <LatexMath math={LPParser.toLatex(currentModel)} block />
          </div>
        </div>
      )}
    </div>
  );
};
