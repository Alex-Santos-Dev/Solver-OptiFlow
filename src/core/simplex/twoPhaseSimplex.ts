import { Fraction } from '../math/fraction';
import { BigMValue } from '../math/bigM';
import { LPModel } from '../parser/lpTypes';
import { SimplexResult, SimplexStep, TableauRow, PivotInfo, SimplexStatus } from './simplexTypes';

/**
 * Clase TwoPhaseSimplexSolver (Método de las Dos Fases)
 * -----------------------------------------------------------------------------
 * El Método de las Dos Fases es una alternativa al Método de la Gran M que
 * evita manipular algebraicamente la constante M.
 *
 * Se estructura en dos fases secuenciales:
 *
 * 1. FASE 1 (Búsqueda de una Solución Básica Factible Inicial):
 *    - Se ignora temporalmente la función objetivo original.
 *    - Se define una función objetivo auxiliar: Minimizar W = sumatoria(a_i)
 *      donde a_i son las variables artificiales.
 *    - Si al optimizar W, el valor mínimo es estrictamente mayor que 0 (min W > 0),
 *      significa que es imposible hacer cero las variables artificiales, por lo
 *      que el problema original es INFACTIBLE (no tiene solución).
 *    - Si min W = 0, se ha encontrado un vértice factible original.
 *
 * 2. FASE 2 (Optimización de la Función Objetivo Original):
 *    - Se eliminan de la tabla todas las columnas de variables artificiales.
 *    - Se reincorpora la función objetivo original (Z).
 *    - Se realizan operaciones elementales de fila para expresar la fila Z en forma canónica
 *      (coeficiente 0 en todas las variables que quedaron en la base al final de la Fase 1).
 *    - Se continúa iterando con Simplex estándar hasta alcanzar la solución óptima.
 */
export class TwoPhaseSimplexSolver {
  static solve(model: LPModel): SimplexResult {
    const isMax = model.objectiveType === 'max';
    const phase1Steps: SimplexStep[] = [];
    const phase2Steps: SimplexStep[] = [];
    const allSteps: SimplexStep[] = [];
    const standardFormEquations: string[] = [];

    const decisionVars = [...model.variables];
    const slackVars: string[] = [];
    const excessVars: string[] = [];
    const artificialVars: string[] = [];

    const initialBasis: string[] = [];
    const rowCoeffs: Record<string, Fraction>[] = [];
    const rowRhs: Fraction[] = [];

    let slackCount = 1;
    let excessCount = 1;
    let artificialCount = 1;

    // 1. Conversión de restricciones a forma estándar
    for (let i = 0; i < model.constraints.length; i++) {
      const c = model.constraints[i];
      const coeffs: Record<string, Fraction> = {};

      for (const v of decisionVars) {
        coeffs[v] = c.coefficients[v] || Fraction.ZERO;
      }

      let eqStrParts: string[] = [];
      for (const v of decisionVars) {
        const val = c.coefficients[v] || Fraction.ZERO;
        if (!val.isZero()) eqStrParts.push(`${val.toString()} ${v}`);
      }

      if (c.operator === '<=') {
        const sName = `s_{${slackCount++}}`;
        slackVars.push(sName);
        coeffs[sName] = Fraction.ONE;
        initialBasis.push(sName);
        eqStrParts.push(`+ ${sName}`);
      } else if (c.operator === '>=') {
        const eName = `e_{${excessCount++}}`;
        const aName = `a_{${artificialCount++}}`;
        excessVars.push(eName);
        artificialVars.push(aName);
        coeffs[eName] = Fraction.ONE.neg();
        coeffs[aName] = Fraction.ONE;
        initialBasis.push(aName);
        eqStrParts.push(`- ${eName} + ${aName}`);
      } else {
        const aName = `a_{${artificialCount++}}`;
        artificialVars.push(aName);
        coeffs[aName] = Fraction.ONE;
        initialBasis.push(aName);
        eqStrParts.push(`+ ${aName}`);
      }

      rowCoeffs.push(coeffs);
      rowRhs.push(c.rhs);
      standardFormEquations.push(`${eqStrParts.join(' ')} = ${c.rhs.toString()}`);
    }

    // Si el problema no tiene restricciones >= o =, no requiere variables artificiales
    if (artificialVars.length === 0) {
      return {
        method: 'twoPhase',
        status: 'optimal',
        statusMessage: 'No se requieren variables artificiales; se resuelve directamente en Fase 2.',
        steps: [],
        optimalValue: null,
        variableValues: {},
        slackValues: {},
        artificialValues: {},
        standardFormEquations,
      };
    }

    const phase1Columns = [...decisionVars, ...slackVars, ...excessVars, ...artificialVars];

    for (const r of rowCoeffs) {
      for (const col of phase1Columns) {
        if (!r[col]) r[col] = Fraction.ZERO;
      }
    }

    // Función auxiliar para convertir filas de Fraction a BigMValue para la interfaz
    const toBigMRows = (
      basisList: string[],
      rows: Record<string, Fraction>[],
      rhsList: Fraction[],
      ratios: (Fraction | null)[]
    ): TableauRow[] => {
      return rows.map((r, idx) => {
        const bmCoeffs: Record<string, BigMValue> = {};
        for (const [k, v] of Object.entries(r)) {
          bmCoeffs[k] = BigMValue.fromFraction(v);
        }
        return {
          basicVar: basisList[idx],
          coefficients: bmCoeffs,
          rhs: BigMValue.fromFraction(rhsList[idx]),
          ratio: ratios[idx],
        };
      });
    };

    // =========================================================================
    // FASE 1: MINIMIZAR W = SUMATORIA(a_i)
    // =========================================================================
    // Ecuación inicial: W - sum(a_i) = 0
    // Coeficientes iniciales de W: -1 para cada variable artificial a_i.
    let wCoeffs: Record<string, Fraction> = {};
    for (const col of phase1Columns) wCoeffs[col] = Fraction.ZERO;
    for (const a of artificialVars) wCoeffs[a] = Fraction.ONE.neg();
    let wRhs = Fraction.ZERO;

    // Para poner el renglón W en forma canónica (coeficiente 0 en las artificiales básicas),
    // sumamos cada renglón que contenga una variable artificial básica: R_W <- R_W + R_i
    const phase1InitOps: string[] = [];
    for (let i = 0; i < model.constraints.length; i++) {
      if (artificialVars.includes(initialBasis[i])) {
        phase1InitOps.push(`R_W \\leftarrow R_W + R_{${i + 1}}`);
        for (const col of phase1Columns) {
          wCoeffs[col] = wCoeffs[col].add(rowCoeffs[i][col]);
        }
        wRhs = wRhs.add(rowRhs[i]);
      }
    }

    let basis = [...initialBasis];
    let currentRows = rowCoeffs.map((r) => ({ ...r }));
    let currentRhs = [...rowRhs];
    let currentW = { ...wCoeffs };
    let currentWRhs = wRhs;
    let ratios: (Fraction | null)[] = currentRows.map(() => null);

    let stepNum = 1;

    // Registrar paso inicial de Fase 1
    const initialP1Step: SimplexStep = {
      stepNumber: stepNum++,
      title: 'Fase 1: Tabla Inicial',
      description:
        'FASE 1: El objetivo es minimizar la suma de variables artificiales \\(W = \\sum a_i\\). Se sumaron las filas que contienen variables artificiales a la fila W para expresarla en forma canónica.',
      tableau: {
        columns: phase1Columns,
        rows: toBigMRows(basis, currentRows, currentRhs, ratios),
        zRow: {
          coefficients: Object.fromEntries(
            Object.entries(currentW).map(([k, v]) => [k, BigMValue.fromFraction(v)])
          ),
          rhs: BigMValue.fromFraction(currentWRhs),
        },
      },
      rowOperations: phase1InitOps,
      status: 'iterating',
    };
    phase1Steps.push(initialP1Step);
    allSteps.push(initialP1Step);

    // Iteraciones de Fase 1 (Minimización: entra el coeficiente más positivo en W)
    while (stepNum <= 30) {
      let enteringCol: string | null = null;
      let maxCoeff: Fraction | null = null;

      for (const col of phase1Columns) {
        if (artificialVars.includes(col)) continue; // Las artificiales no deben volver a entrar a la base
        const val = currentW[col];
        if (val.isPositive()) {
          if (maxCoeff === null || val.compare(maxCoeff) > 0) {
            maxCoeff = val;
            enteringCol = col;
          }
        }
      }

      // Si no hay coeficientes positivos en el renglón W, Fase 1 ha terminado
      if (!enteringCol) {
        break;
      }

      // Prueba de la razón mínima en Fase 1
      let leavingIdx = -1;
      let minRatio: Fraction | null = null;
      ratios = currentRows.map(() => null);

      for (let i = 0; i < currentRows.length; i++) {
        const a = currentRows[i][enteringCol];
        const b = currentRhs[i];
        if (a.isPositive()) {
          const r = b.div(a);
          ratios[i] = r;
          if (minRatio === null || r.compare(minRatio) < 0) {
            minRatio = r;
            leavingIdx = i;
          }
        }
      }

      if (leavingIdx === -1 || minRatio === null) {
        break;
      }

      const leavingVar = basis[leavingIdx];
      const pivotVal = currentRows[leavingIdx][enteringCol];

      const pInfo: PivotInfo = {
        rowIndex: leavingIdx,
        colName: enteringCol,
        value: BigMValue.fromFraction(pivotVal),
        enteringVar: enteringCol,
        leavingVar: leavingVar,
        minimumRatio: minRatio,
      };

      allSteps[allSteps.length - 1].pivot = pInfo;
      allSteps[allSteps.length - 1].description += ` | Fase 1: Entra \\(${enteringCol}\\), sale \\(${leavingVar}\\) (Cociente mínimo \\(\\theta = ${minRatio.toLatex()}\\)).`;

      // Operaciones de Gauss-Jordan en Fase 1
      const p1Ops: string[] = [];
      p1Ops.push(`R_{${leavingIdx + 1}} \\leftarrow \\frac{1}{${pivotVal.toLatex()}} R_{${leavingIdx + 1}}`);

      for (const col of phase1Columns) {
        currentRows[leavingIdx][col] = currentRows[leavingIdx][col].div(pivotVal);
      }
      currentRhs[leavingIdx] = currentRhs[leavingIdx].div(pivotVal);
      basis[leavingIdx] = enteringCol;

      for (let i = 0; i < currentRows.length; i++) {
        if (i !== leavingIdx) {
          const factor = currentRows[i][enteringCol];
          if (!factor.isZero()) {
            p1Ops.push(
              `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${factor.toLatex()}) R_{${leavingIdx + 1}}`
            );
            for (const col of phase1Columns) {
              currentRows[i][col] = currentRows[i][col].sub(currentRows[leavingIdx][col].mul(factor));
            }
            currentRhs[i] = currentRhs[i].sub(currentRhs[leavingIdx].mul(factor));
          }
        }
      }

      const wFactor = currentW[enteringCol];
      if (!wFactor.isZero()) {
        p1Ops.push(`R_W \\leftarrow R_W - (${wFactor.toLatex()}) R_{${leavingIdx + 1}}`);
        for (const col of phase1Columns) {
          currentW[col] = currentW[col].sub(currentRows[leavingIdx][col].mul(wFactor));
        }
        currentWRhs = currentWRhs.sub(currentRhs[leavingIdx].mul(wFactor));
      }

      const p1Step: SimplexStep = {
        stepNumber: stepNum++,
        title: `Fase 1: Iteración ${stepNum - 2}`,
        description: `Iteración de Fase 1 completada. Variable entrante: ${enteringCol}.`,
        tableau: {
          columns: phase1Columns,
          rows: toBigMRows(basis, currentRows, currentRhs, ratios),
          zRow: {
            coefficients: Object.fromEntries(
              Object.entries(currentW).map(([k, v]) => [k, BigMValue.fromFraction(v)])
            ),
            rhs: BigMValue.fromFraction(currentWRhs),
          },
        },
        rowOperations: p1Ops,
        status: 'iterating',
      };
      phase1Steps.push(p1Step);
      allSteps.push(p1Step);
    }

    // Verificación de Factibilidad: W debe ser exactamente 0 al final de la Fase 1
    if (!currentWRhs.isZero()) {
      allSteps[allSteps.length - 1].status = 'infeasible';
      return {
        method: 'twoPhase',
        status: 'infeasible',
        statusMessage:
          'Problema Infactible: El valor mínimo de W en la Fase 1 es estrictamente mayor a 0, lo que demuestra que no existe región factible.',
        steps: allSteps,
        optimalValue: null,
        variableValues: {},
        slackValues: {},
        artificialValues: {},
        standardFormEquations,
        phase1Steps,
      };
    }

    // =========================================================================
    // FASE 2: RESOLVER CON LA FUNCIÓN OBJETIVO ORIGINAL
    // =========================================================================
    // Se eliminan por completo las columnas de variables artificiales
    const phase2Columns = [...decisionVars, ...slackVars, ...excessVars];

    // Reincorporar la función objetivo original Z
    let z2Coeffs: Record<string, Fraction> = {};
    for (const col of phase2Columns) z2Coeffs[col] = Fraction.ZERO;
    for (const v of decisionVars) {
      const cj = model.objectiveCoefficients[v] || Fraction.ZERO;
      z2Coeffs[v] = cj.neg(); // En Z - sum(c_j * x_j) = 0
    }
    let z2Rhs = Fraction.ZERO;

    // Eliminar las variables básicas de la fila Z mediante operaciones de fila
    const phase2InitOps: string[] = [];
    for (let i = 0; i < currentRows.length; i++) {
      const bVar = basis[i];
      if (phase2Columns.includes(bVar)) {
        const factor = z2Coeffs[bVar];
        if (!factor.isZero()) {
          phase2InitOps.push(`R_Z \\leftarrow R_Z - (${factor.toLatex()}) R_{${i + 1}}`);
          for (const col of phase2Columns) {
            z2Coeffs[col] = z2Coeffs[col].sub(currentRows[i][col].mul(factor));
          }
          z2Rhs = z2Rhs.sub(currentRhs[i].mul(factor));
        }
      }
    }

    ratios = currentRows.map(() => null);
    const initialP2Step: SimplexStep = {
      stepNumber: stepNum++,
      title: 'Fase 2: Tabla Inicial',
      description:
        'FASE 2: Como el valor de \\(W = 0\\), se eliminan todas las columnas artificiales y se reincorpora la función objetivo original. Se ajusta la fila Z para eliminar los coeficientes de las variables actualmente en la base.',
      tableau: {
        columns: phase2Columns,
        rows: toBigMRows(basis, currentRows, currentRhs, ratios),
        zRow: {
          coefficients: Object.fromEntries(
            Object.entries(z2Coeffs).map(([k, v]) => [k, BigMValue.fromFraction(v)])
          ),
          rhs: BigMValue.fromFraction(z2Rhs),
        },
      },
      rowOperations: phase2InitOps,
      status: 'iterating',
    };
    phase2Steps.push(initialP2Step);
    allSteps.push(initialP2Step);

    // Iteraciones regulares de Simplex sobre la Fase 2
    let p2Status: SimplexStatus = 'iterating';
    while (stepNum <= 60) {
      let enteringCol: string | null = null;
      let extremeVal: Fraction | null = null;

      for (const col of phase2Columns) {
        const val = z2Coeffs[col];
        if (isMax) {
          if (val.isNegative()) {
            if (extremeVal === null || val.compare(extremeVal) < 0) {
              extremeVal = val;
              enteringCol = col;
            }
          }
        } else {
          if (val.isPositive()) {
            if (extremeVal === null || val.compare(extremeVal) > 0) {
              extremeVal = val;
              enteringCol = col;
            }
          }
        }
      }

      if (!enteringCol) {
        const nonBasicZero = phase2Columns.some(
          (col) => !basis.includes(col) && z2Coeffs[col].isZero()
        );
        p2Status = nonBasicZero ? 'alternative_optima' : 'optimal';
        allSteps[allSteps.length - 1].status = p2Status;
        allSteps[allSteps.length - 1].description =
          p2Status === 'alternative_optima'
            ? 'Fase 2 finalizada: Soluciones Óptimas Múltiples.'
            : 'Fase 2 finalizada: ¡Solución Óptima Encontrada!';
        break;
      }

      // Prueba de la razón mínima en Fase 2
      let leavingIdx = -1;
      let minRatio: Fraction | null = null;
      ratios = currentRows.map(() => null);

      for (let i = 0; i < currentRows.length; i++) {
        const a = currentRows[i][enteringCol];
        const b = currentRhs[i];
        if (a.isPositive()) {
          const r = b.div(a);
          ratios[i] = r;
          if (minRatio === null || r.compare(minRatio) < 0) {
            minRatio = r;
            leavingIdx = i;
          }
        }
      }

      if (leavingIdx === -1 || minRatio === null) {
        p2Status = 'unbounded';
        allSteps[allSteps.length - 1].status = 'unbounded';
        allSteps[allSteps.length - 1].description =
          'Fase 2: Problema No Acotado (todos los elementos en la columna pivote son <= 0).';
        break;
      }

      const leavingVar = basis[leavingIdx];
      const pivotVal = currentRows[leavingIdx][enteringCol];

      const pInfo: PivotInfo = {
        rowIndex: leavingIdx,
        colName: enteringCol,
        value: BigMValue.fromFraction(pivotVal),
        enteringVar: enteringCol,
        leavingVar: leavingVar,
        minimumRatio: minRatio,
      };

      allSteps[allSteps.length - 1].pivot = pInfo;
      allSteps[allSteps.length - 1].description += ` | Fase 2: Entra \\(${enteringCol}\\), sale \\(${leavingVar}\\) (Cociente mínimo \\(\\theta = ${minRatio.toLatex()}\\)).`;

      // Gauss-Jordan en Fase 2
      const p2Ops: string[] = [];
      p2Ops.push(`R_{${leavingIdx + 1}} \\leftarrow \\frac{1}{${pivotVal.toLatex()}} R_{${leavingIdx + 1}}`);

      for (const col of phase2Columns) {
        currentRows[leavingIdx][col] = currentRows[leavingIdx][col].div(pivotVal);
      }
      currentRhs[leavingIdx] = currentRhs[leavingIdx].div(pivotVal);
      basis[leavingIdx] = enteringCol;

      for (let i = 0; i < currentRows.length; i++) {
        if (i !== leavingIdx) {
          const factor = currentRows[i][enteringCol];
          if (!factor.isZero()) {
            p2Ops.push(
              `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${factor.toLatex()}) R_{${leavingIdx + 1}}`
            );
            for (const col of phase2Columns) {
              currentRows[i][col] = currentRows[i][col].sub(currentRows[leavingIdx][col].mul(factor));
            }
            currentRhs[i] = currentRhs[i].sub(currentRhs[leavingIdx].mul(factor));
          }
        }
      }

      const zFactor = z2Coeffs[enteringCol];
      if (!zFactor.isZero()) {
        p2Ops.push(`R_Z \\leftarrow R_Z - (${zFactor.toLatex()}) R_{${leavingIdx + 1}}`);
        for (const col of phase2Columns) {
          z2Coeffs[col] = z2Coeffs[col].sub(currentRows[leavingIdx][col].mul(zFactor));
        }
        z2Rhs = z2Rhs.sub(currentRhs[leavingIdx].mul(zFactor));
      }

      const p2Step: SimplexStep = {
        stepNumber: stepNum++,
        title: `Fase 2: Iteración ${stepNum - 2}`,
        description: `Iteración de Fase 2 completada. Variable pivote: ${enteringCol}.`,
        tableau: {
          columns: phase2Columns,
          rows: toBigMRows(basis, currentRows, currentRhs, ratios),
          zRow: {
            coefficients: Object.fromEntries(
              Object.entries(z2Coeffs).map(([k, v]) => [k, BigMValue.fromFraction(v)])
            ),
            rhs: BigMValue.fromFraction(z2Rhs),
          },
        },
        rowOperations: p2Ops,
        status: 'iterating',
      };
      phase2Steps.push(p2Step);
      allSteps.push(p2Step);
    }

    // Extraer valores de variables finales
    const variableValues: Record<string, Fraction> = {};
    const slackValues: Record<string, Fraction> = {};

    for (const v of decisionVars) variableValues[v] = Fraction.ZERO;
    for (const s of [...slackVars, ...excessVars]) slackValues[s] = Fraction.ZERO;

    for (let i = 0; i < currentRows.length; i++) {
      const bVar = basis[i];
      const val = currentRhs[i];
      if (decisionVars.includes(bVar)) {
        variableValues[bVar] = val;
      } else if (slackVars.includes(bVar) || excessVars.includes(bVar)) {
        slackValues[bVar] = val;
      }
    }

    return {
      method: 'twoPhase',
      status: p2Status,
      statusMessage:
        p2Status === 'optimal'
          ? 'Solución Óptima Encontrada mediante el Método de las Dos Fases.'
          : p2Status === 'alternative_optima'
          ? 'Soluciones Óptimas Múltiples.'
          : 'Problema no acotado.',
      steps: allSteps,
      optimalValue: z2Rhs,
      variableValues,
      slackValues,
      artificialValues: {},
      standardFormEquations,
      phase1Steps,
      phase2Steps,
    };
  }
}
