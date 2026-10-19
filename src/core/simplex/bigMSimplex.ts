import { Fraction } from '../math/fraction';
import { BigMValue } from '../math/bigM';
import { LPModel } from '../parser/lpTypes';
import { SimplexResult, SimplexStep, TableauRow, PivotInfo, SimplexStatus } from './simplexTypes';

/**
 * Clase BigMSimplexSolver (Solucionador Simplex Estándar y Método de la Gran M)
 * -----------------------------------------------------------------------------
 * Implementa el algoritmo Simplex tabular clásico de libros de Investigación de
 * Operaciones (Taha, Hillier-Lieberman, Winston).
 *
 * Características fundamentales:
 * 1. Forma estándar automática:
 *    - Restricción '<=': Agrega variable de holgura (+s_i >= 0).
 *    - Restricción '>=': Resta variable de exceso (-e_i >= 0) y agrega variable artificial (+a_i >= 0).
 *    - Restricción '=': Agrega variable artificial (+a_i >= 0).
 *
 * 2. Penalización en la Función Objetivo:
 *    - Maximizar: Penaliza con -M * a_i (restando M a la ganancia).
 *    - Minimizar: Penaliza con +M * a_i (sumando M al costo).
 *
 * 3. Operaciones elementales de fila de Gauss-Jordan exactas y generación paso a paso.
 */
export class BigMSimplexSolver {
  /**
   * Resuelve el problema de programación lineal paso a paso.
   * @param model Modelo lineal analizado
   * @returns Resultado con todas las tablas intermedias, pivotes, operaciones de fila y solución
   */
  static solve(model: LPModel): SimplexResult {
    const isMax = model.objectiveType === 'max';
    const steps: SimplexStep[] = [];
    const standardFormEquations: string[] = [];

    // =========================================================================
    // FASE 1: CLASIFICACIÓN DE VARIABLES Y CONVERSIÓN A FORMA ESTÁNDAR
    // =========================================================================
    const decisionVars = [...model.variables];
    const slackVars: string[] = [];
    const excessVars: string[] = [];
    const artificialVars: string[] = [];

    const initialBasis: string[] = [];
    const rowCoeffs: Record<string, BigMValue>[] = [];
    const rowRhs: BigMValue[] = [];

    let slackCount = 1;
    let excessCount = 1;
    let artificialCount = 1;

    for (let i = 0; i < model.constraints.length; i++) {
      const c = model.constraints[i];
      const coeffs: Record<string, BigMValue> = {};

      // Asignar coeficientes de las variables de decisión originales
      for (const v of decisionVars) {
        coeffs[v] = BigMValue.fromFraction(c.coefficients[v] || Fraction.ZERO);
      }

      let eqStrParts: string[] = [];
      for (const v of decisionVars) {
        const val = c.coefficients[v] || Fraction.ZERO;
        if (!val.isZero()) eqStrParts.push(`${val.toString()} ${v}`);
      }

      // Reglas de adición de variables según el tipo de desigualdad
      if (c.operator === '<=') {
        // Holgura (+s_i): permite convertir una cota superior en igualdad
        const sName = `s_{${slackCount++}}`;
        slackVars.push(sName);
        coeffs[sName] = BigMValue.ONE;
        initialBasis.push(sName);
        eqStrParts.push(`+ ${sName}`);
      } else if (c.operator === '>=') {
        // Exceso (-e_i) y Artificial (+a_i): para proporcionar base canónica inicial
        const eName = `e_{${excessCount++}}`;
        const aName = `a_{${artificialCount++}}`;
        excessVars.push(eName);
        artificialVars.push(aName);
        coeffs[eName] = BigMValue.ONE.neg();
        coeffs[aName] = BigMValue.ONE;
        initialBasis.push(aName);
        eqStrParts.push(`- ${eName} + ${aName}`);
      } else {
        // Igualdad estricta: requiere únicamente una variable artificial (+a_i)
        const aName = `a_{${artificialCount++}}`;
        artificialVars.push(aName);
        coeffs[aName] = BigMValue.ONE;
        initialBasis.push(aName);
        eqStrParts.push(`+ ${aName}`);
      }

      rowCoeffs.push(coeffs);
      rowRhs.push(BigMValue.fromFraction(c.rhs));
      standardFormEquations.push(`${eqStrParts.join(' ')} = ${c.rhs.toString()}`);
    }

    // Orden de todas las columnas en la tabla Simplex
    const allColumns = [...decisionVars, ...slackVars, ...excessVars, ...artificialVars];

    // Asegurar que cada fila tenga inicializados los coeficientes de todas las columnas
    for (const r of rowCoeffs) {
      for (const col of allColumns) {
        if (!r[col]) r[col] = BigMValue.ZERO;
      }
    }

    // =========================================================================
    // FASE 2: CONSTRUCCIÓN DEL RENGLÓN DE LA FUNCIÓN OBJETIVO (RENGLÓN Z)
    // =========================================================================
    // En la convención canónica de Taha: la ecuación se escribe con Z a la izquierda:
    // Z - sum(c_j * x_j) + [penalización por artificiales] = 0
    // Por lo tanto, los coeficientes iniciales en la fila Z son (-c_j).
    let zCoeffs: Record<string, BigMValue> = {};
    for (const col of allColumns) {
      zCoeffs[col] = BigMValue.ZERO;
    }

    for (const v of decisionVars) {
      const cj = model.objectiveCoefficients[v] || Fraction.ZERO;
      zCoeffs[v] = BigMValue.fromFraction(cj.neg());
    }

    let zRhs = BigMValue.ZERO;

    // Penalización en el renglón Z para variables artificiales:
    // Para Max: Z = ... - M*a_i  =>  Z + M*a_i = ... (coeficiente +M en renglón Z)
    // Para Min: Z = ... + M*a_i  =>  Z - M*a_i = ... (coeficiente -M en renglón Z)
    for (const a of artificialVars) {
      if (isMax) {
        zCoeffs[a] = BigMValue.M;
      } else {
        zCoeffs[a] = BigMValue.NEG_M;
      }
    }

    // =========================================================================
    // FASE 3: AJUSTE CANÓNICO INICIAL (ELIMINAR ARTIFICIALES DE LA FILA Z)
    // =========================================================================
    // En una tabla Simplex válida, toda variable básica debe tener coeficiente 0
    // en la fila Z. Las variables artificiales están en la base inicial, por lo
    // que debemos restarlas o sumarlas usando las filas correspondientes.
    const initialEliminationOperations: string[] = [];
    if (artificialVars.length > 0) {
      for (let i = 0; i < model.constraints.length; i++) {
        const basicVar = initialBasis[i];
        if (artificialVars.includes(basicVar)) {
          // Si Max: R_Z <- R_Z - M * R_i
          // Si Min: R_Z <- R_Z + M * R_i
          initialEliminationOperations.push(
            `R_Z \\leftarrow R_Z ${isMax ? '-' : '+'} M \\cdot R_{${i + 1}}`
          );

          for (const col of allColumns) {
            if (isMax) {
              zCoeffs[col] = zCoeffs[col].sub(rowCoeffs[i][col].mulM());
            } else {
              zCoeffs[col] = zCoeffs[col].add(rowCoeffs[i][col].mulM());
            }
          }
          if (isMax) {
            zRhs = zRhs.sub(rowRhs[i].mulM());
          } else {
            zRhs = zRhs.add(rowRhs[i].mulM());
          }
        }
      }
    }

    // Estado inicial de la base y filas
    let basis = [...initialBasis];
    let currentRows = rowCoeffs.map((r, idx) => ({
      basicVar: basis[idx],
      coefficients: { ...r },
      rhs: rowRhs[idx],
      ratio: null as Fraction | null,
    }));
    let currentZ = {
      coefficients: { ...zCoeffs },
      rhs: zRhs,
    };

    let stepNumber = 1;
    let status: SimplexStatus = 'iterating';
    const maxIterations = 50;

    // Función auxiliar para clonar filas sin mutaciones no deseadas
    const cloneRows = (rows: TableauRow[]): TableauRow[] =>
      rows.map((r) => ({
        basicVar: r.basicVar,
        coefficients: { ...r.coefficients },
        rhs: r.rhs,
        ratio: r.ratio,
      }));

    // Registrar el Paso 1: Tabla Inicial
    steps.push({
      stepNumber: stepNumber++,
      title: 'Tabla Inicial',
      description:
        artificialVars.length > 0
          ? `Se construyó la tabla inicial aplicando el Método de la Gran M. Se ajustó la fila Z mediante operaciones elementales para que las variables artificiales tengan coeficiente 0 en la fila Z.`
          : 'Se construyó la tabla inicial en forma estándar con variables de holgura.',
      tableau: {
        columns: allColumns,
        rows: cloneRows(currentRows),
        zRow: { coefficients: { ...currentZ.coefficients }, rhs: currentZ.rhs },
      },
      rowOperations: initialEliminationOperations,
      status: 'iterating',
    });

    // =========================================================================
    // FASE 4: CICLO PRINCIPAL DE ITERACIONES SIMPLEX
    // =========================================================================
    while (stepNumber <= maxIterations) {
      // -----------------------------------------------------------------------
      // Criterio 1: Condición de Optimalidad (Variable Entrante a la Base)
      // -----------------------------------------------------------------------
      // En la convención Z - cX = 0:
      // - Para Maximizar: entra la variable con el coeficiente MÁS NEGATIVO (z_j < 0).
      // - Para Minimizar: entra la variable con el coeficiente MÁS POSITIVO (z_j > 0).
      let enteringCol: string | null = null;
      let extremeVal: BigMValue | null = null;

      for (const col of allColumns) {
        const val = currentZ.coefficients[col];
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

      // Si no hay candidatos para entrar, se detiene el algoritmo
      if (!enteringCol) {
        // Verificar si alguna variable artificial sigue en la base con valor positivo
        const hasArtificialInBasisWithNonZero = currentRows.some(
          (r) => artificialVars.includes(r.basicVar) && !r.rhs.c.isZero()
        );

        if (hasArtificialInBasisWithNonZero) {
          status = 'infeasible';
          steps[steps.length - 1].status = 'infeasible';
          steps[steps.length - 1].description +=
            ' El problema es INFACTIBLE ya que una o más variables artificiales permanecen en la base con valor positivo y no hay más variables candidatas para entrar.';
        } else {
          // Comprobar si existen óptimos alternativos (variable no básica con costo reducido 0)
          const nonBasicZeroCost = allColumns.some(
            (col) => !basis.includes(col) && currentZ.coefficients[col].isZero()
          );

          status = nonBasicZeroCost ? 'alternative_optima' : 'optimal';
          steps[steps.length - 1].status = status;
          steps[steps.length - 1].description =
            status === 'alternative_optima'
              ? 'Se alcanzó la condición de optimalidad, pero existe al menos una variable no básica con costo reducido 0, lo que indica SOLUCIONES ÓPTIMAS MÚLTIPLES (infinitas soluciones).'
              : 'Se alcanzó la SOLUCIÓN ÓPTIMA. Todos los coeficientes en la fila Z cumplen con el criterio de paro.';
        }
        break;
      }

      // -----------------------------------------------------------------------
      // Criterio 2: Prueba de la Razón Mínima / Cociente (Variable Saliente)
      // -----------------------------------------------------------------------
      // theta_i = b_i / a_ik para todo elemento estrictamente positivo a_ik > 0
      // La fila con el menor cociente no negativo theta es la fila pivote.
      let leavingRowIdx = -1;
      let minRatio: Fraction | null = null;

      for (let i = 0; i < currentRows.length; i++) {
        const coeff = currentRows[i].coefficients[enteringCol];
        const rhs = currentRows[i].rhs.c; // El RHS en restricciones siempre es constante Fraction

        if (coeff.c.isPositive()) {
          const ratio = rhs.div(coeff.c);
          currentRows[i].ratio = ratio;

          if (minRatio === null || ratio.compare(minRatio) < 0) {
            minRatio = ratio;
            leavingRowIdx = i;
          }
        } else {
          currentRows[i].ratio = null;
        }
      }

      // Si todos los elementos en la columna pivote son <= 0, el problema no está acotado
      if (leavingRowIdx === -1 || minRatio === null) {
        status = 'unbounded';
        steps[steps.length - 1].status = 'unbounded';
        steps[steps.length - 1].description = `El problema es NO ACOTADO (Unbounded): todos los elementos en la columna pivote (${enteringCol}) son menores o iguales a cero, por lo que la función objetivo puede crecer o decrecer indefinidamente.`;
        break;
      }

      const leavingVar = basis[leavingRowIdx];
      const pivotValue = currentRows[leavingRowIdx].coefficients[enteringCol];

      const pivotInfo: PivotInfo = {
        rowIndex: leavingRowIdx,
        colName: enteringCol,
        value: pivotValue,
        enteringVar: enteringCol,
        leavingVar: leavingVar,
        minimumRatio: minRatio,
      };

      // Registrar la decisión de pivoteo en el paso actual
      steps[steps.length - 1].pivot = pivotInfo;
      steps[steps.length - 1].description += ` | Entra la variable \\(${enteringCol}\\) y sale de la base \\(${leavingVar}\\) con cociente mínimo \\(\\theta = ${minRatio.toLatex()}\\). Elemento pivote: \\(${pivotValue.toLatex()}\\).`;

      // -----------------------------------------------------------------------
      // Criterio 3: Operaciones Elementales de Fila de Gauss-Jordan
      // -----------------------------------------------------------------------
      const rowOps: string[] = [];
      const newRows: TableauRow[] = cloneRows(currentRows);
      const newZCoeffs = { ...currentZ.coefficients };
      let newZRhs = currentZ.rhs;

      // 1. Normalizar fila pivote: R_r <- (1 / pivote) * R_r para hacer 1 en el pivote
      rowOps.push(
        `R_{${leavingRowIdx + 1}} \\leftarrow \\frac{1}{${pivotValue.toLatex()}} R_{${leavingRowIdx + 1}}`
      );

      for (const col of allColumns) {
        newRows[leavingRowIdx].coefficients[col] = currentRows[leavingRowIdx].coefficients[col].div(
          pivotValue.c
        );
      }
      newRows[leavingRowIdx].rhs = currentRows[leavingRowIdx].rhs.div(pivotValue.c);
      newRows[leavingRowIdx].basicVar = enteringCol;
      basis[leavingRowIdx] = enteringCol;

      // 2. Hacer 0 en el resto de los renglones de restricciones
      for (let i = 0; i < currentRows.length; i++) {
        if (i !== leavingRowIdx) {
          const factor = currentRows[i].coefficients[enteringCol];
          if (!factor.isZero()) {
            rowOps.push(
              `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${factor.toLatex()}) \\cdot R_{${leavingRowIdx + 1}}`
            );

            for (const col of allColumns) {
              const term = newRows[leavingRowIdx].coefficients[col].mul(factor.c);
              newRows[i].coefficients[col] = currentRows[i].coefficients[col].sub(term);
            }
            const rhsTerm = newRows[leavingRowIdx].rhs.mul(factor.c);
            newRows[i].rhs = currentRows[i].rhs.sub(rhsTerm);
          }
        }
      }

      // 3. Hacer 0 en la columna de la variable entrante en el renglón Z
      const zFactor = currentZ.coefficients[enteringCol];
      if (!zFactor.isZero()) {
        rowOps.push(`R_Z \\leftarrow R_Z - (${zFactor.toLatex()}) \\cdot R_{${leavingRowIdx + 1}}`);

        for (const col of allColumns) {
          const pivotColVal = newRows[leavingRowIdx].coefficients[col];
          const term = zFactor.mul(pivotColVal.c);
          newZCoeffs[col] = currentZ.coefficients[col].sub(term);
        }
        const pivotRhsVal = newRows[leavingRowIdx].rhs;
        const rhsTerm = zFactor.mul(pivotRhsVal.c);
        newZRhs = currentZ.rhs.sub(rhsTerm);
      }

      // Actualizar estado para la siguiente iteración
      currentRows = newRows;
      currentZ = {
        coefficients: newZCoeffs,
        rhs: newZRhs,
      };

      // Agregar nuevo paso a la lista
      steps.push({
        stepNumber: stepNumber++,
        title: `Iteración ${stepNumber - 1}`,
        description: `Se aplicaron las operaciones de Gauss-Jordan para hacer 1 en el elemento pivote y 0 en el resto de la columna ${enteringCol}.`,
        tableau: {
          columns: allColumns,
          rows: cloneRows(currentRows),
          zRow: { coefficients: { ...currentZ.coefficients }, rhs: currentZ.rhs },
        },
        rowOperations: rowOps,
        status: 'iterating',
      });
    }

    // =========================================================================
    // FASE 5: EXTRACCIÓN Y LECTURA DE LA SOLUCIÓN FINAL
    // =========================================================================
    const variableValues: Record<string, Fraction> = {};
    const slackValues: Record<string, Fraction> = {};
    const artificialValues: Record<string, Fraction> = {};

    // Por teorema de soluciones básicas factibles: toda variable no básica vale 0
    for (const v of decisionVars) variableValues[v] = Fraction.ZERO;
    for (const s of [...slackVars, ...excessVars]) slackValues[s] = Fraction.ZERO;
    for (const a of artificialVars) artificialValues[a] = Fraction.ZERO;

    // Las variables básicas toman el valor del lado derecho (RHS) de su renglón
    for (let i = 0; i < currentRows.length; i++) {
      const bVar = currentRows[i].basicVar;
      const val = currentRows[i].rhs.c;
      if (decisionVars.includes(bVar)) {
        variableValues[bVar] = val;
      } else if (slackVars.includes(bVar) || excessVars.includes(bVar)) {
        slackValues[bVar] = val;
      } else if (artificialVars.includes(bVar)) {
        artificialValues[bVar] = val;
      }
    }

    let optimalValue: Fraction | null = null;
    if (status === 'optimal' || status === 'alternative_optima') {
      optimalValue = currentZ.rhs.c;
    }

    let statusMsg = '';
    if (status === 'optimal') statusMsg = 'Solución Óptima Única Encontrada.';
    else if (status === 'alternative_optima') statusMsg = 'Soluciones Óptimas Múltiples (Infinitas Soluciones).';
    else if (status === 'unbounded') statusMsg = 'Problema No Acotado (El valor de Z puede crecer indefinidamente).';
    else if (status === 'infeasible') statusMsg = 'Problema Infactible (No existe solución que satisfaga todas las restricciones simultáneamente).';

    return {
      method: artificialVars.length > 0 ? 'bigM' : 'standard',
      status,
      statusMessage: statusMsg,
      steps,
      optimalValue,
      variableValues,
      slackValues,
      artificialValues,
      standardFormEquations,
    };
  }
}
