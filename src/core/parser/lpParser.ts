import { Fraction } from '../math/fraction';
import { LPModel, LPConstraint, ObjectiveType, ConstraintOperator } from './lpTypes';

/**
 * Clase LPParser (Analizador Sintáctico de Programación Lineal)
 * -------------------------------------------------------------
 * Permite transformar texto en lenguaje natural o matemático a una estructura de datos
 * canónica `LPModel` lista para ser resuelta por el Método Gráfico o el Método Simplex.
 *
 * Soporta entradas como:
 *   Max Z = 3x1 + 5x2
 *   s.a.
 *   2x1 + x2 <= 100
 *   x1 + 2x2 <= 80
 *   x1, x2 >= 0
 */
export class LPParser {
  /**
   * Analiza una expresión lineal individual (ej: "3x1 - 4/5 x2 + x3 - 10")
   * y extrae los coeficientes de cada variable y el término constante.
   *
   * @param expr Cadena con la expresión matemática
   * @returns Diccionario con los coeficientes por variable y la constante neta
   */
  static parseLinearExpression(expr: string): {
    coefficients: Record<string, Fraction>;
    constant: Fraction;
  } {
    // 1. Eliminar todos los espacios en blanco
    const cleaned = expr.replace(/\s+/g, '');
    const coefficients: Record<string, Fraction> = {};
    let constant = Fraction.ZERO;

    if (!cleaned) {
      return { coefficients, constant };
    }

    // 2. Expresión regular para separar términos respetando signos + y -
    const termRegex = /([+-]?)([^+-]+)/g;
    let match: RegExpExecArray | null;

    while ((match = termRegex.exec(cleaned)) !== null) {
      const sign = match[1] === '-' ? -1 : 1;
      const termBody = match[2];

      // Verificar si el término incluye el nombre de una variable (letras seguidas de números)
      const varMatch = termBody.match(/^([0-9./]*)([a-zA-Z_][a-zA-Z0-9_]*)$/);

      if (varMatch) {
        const coeffStr = varMatch[1];
        const varName = varMatch[2];

        let coeff: Fraction;
        // Si no tiene número explícito (ej: "+x" o "-y"), el coeficiente es 1 o -1
        if (!coeffStr || coeffStr === '') {
          coeff = new Fraction(BigInt(sign), 1n);
        } else {
          coeff = Fraction.parse(coeffStr);
          if (sign === -1) coeff = coeff.neg();
        }

        // Acumular coeficiente por si la variable aparece más de una vez
        coefficients[varName] = (coefficients[varName] || Fraction.ZERO).add(coeff);
      } else {
        // Término puramente numérico (constante)
        let constVal = Fraction.parse(termBody);
        if (sign === -1) constVal = constVal.neg();
        constant = constant.add(constVal);
      }
    }

    return { coefficients, constant };
  }

  /**
   * Analiza un problema completo de programación lineal a partir de texto multilinea.
   *
   * @param text Texto del problema ingresado por el usuario
   * @returns Objeto con el modelo analizado o mensaje de error explicativo
   */
  static parse(text: string): { model?: LPModel; error?: string } {
    try {
      // Separar por líneas y omitir líneas en blanco
      const rawLines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (rawLines.length === 0) {
        return { error: 'El texto del problema está vacío.' };
      }

      let objectiveType: ObjectiveType = 'max';
      let objectiveCoefficients: Record<string, Fraction> = {};
      const constraints: LPConstraint[] = [];
      let foundObjective = false;
      const discoveredVars = new Set<string>();

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const lower = line.toLowerCase();

        // Omitir comentarios (# o //) o encabezados como "s.a." (sujeto a)
        if (lower.startsWith('//') || lower.startsWith('#')) continue;
        if (lower === 's.a.' || lower === 'sujeto a:' || lower === 'sujeto a' || lower === 'st:' || lower === 's.t.') {
          continue;
        }

        // Detectar líneas de no negatividad explícita (ej: "x1, x2 >= 0" o "x, y >= 0")
        if (line.includes('>=') && line.endsWith('0')) {
          const lhs = line.split('>=')[0].trim();
          const candidateVars = lhs.split(/[,\s]+/).map((v) => v.trim()).filter(Boolean);
          const isNonNegLine = candidateVars.every((v) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v));
          if (isNonNegLine && candidateVars.length > 0) {
            candidateVars.forEach((v) => discoveredVars.add(v));
            continue; // Se asume no negatividad estándar sin agregarla como restricción regular
          }
        }

        // Detectar si es la línea de la Función Objetivo
        if (!foundObjective && (lower.startsWith('max') || lower.startsWith('min') || lower.startsWith('z'))) {
          objectiveType = lower.startsWith('min') ? 'min' : 'max';

          // Limpiar palabras clave para aislar la expresión matemática
          let objStr = line
            .replace(/^(maximizar|minimizar|max|min)\s*/i, '')
            .replace(/^z\s*=\s*/i, '')
            .replace(/^=\s*/, '');

          const parsed = LPParser.parseLinearExpression(objStr);
          objectiveCoefficients = parsed.coefficients;
          Object.keys(objectiveCoefficients).forEach((v) => discoveredVars.add(v));
          foundObjective = true;
          continue;
        }

        // Detectar operador de restricción (<=, >=, =, <, >)
        let operator: ConstraintOperator | null = null;
        let splitParts: string[] = [];

        if (line.includes('<=')) {
          operator = '<=';
          splitParts = line.split('<=');
        } else if (line.includes('>=')) {
          operator = '>=';
          splitParts = line.split('>=');
        } else if (line.includes('=')) {
          operator = '=';
          splitParts = line.split('=');
        } else if (line.includes('<')) {
          operator = '<=';
          splitParts = line.split('<');
        } else if (line.includes('>')) {
          operator = '>=';
          splitParts = line.split('>');
        }

        if (operator && splitParts.length === 2) {
          const lhsStr = splitParts[0].trim();
          const rhsStr = splitParts[1].trim();

          const lhsParsed = LPParser.parseLinearExpression(lhsStr);
          const rhsParsed = LPParser.parseLinearExpression(rhsStr);

          // Agrupar variables en el lado izquierdo (LHS): Coeficiente Neto = LHS - RHS
          const netCoeffs: Record<string, Fraction> = { ...lhsParsed.coefficients };
          for (const [v, c] of Object.entries(rhsParsed.coefficients)) {
            netCoeffs[v] = (netCoeffs[v] || Fraction.ZERO).sub(c);
          }

          // Agrupar constantes en el lado derecho (RHS): Constante Neta = RHS_const - LHS_const
          let netRhs = rhsParsed.constant.sub(lhsParsed.constant);

          // Normalización clásica en Investigación de Operaciones:
          // Si el RHS es negativo (ej: 2x - 3y <= -10), se multiplica por -1 y se invierte la inecuación
          let finalOp = operator;
          if (netRhs.isNegative() && finalOp !== '=') {
            for (const v of Object.keys(netCoeffs)) {
              netCoeffs[v] = netCoeffs[v].neg();
            }
            netRhs = netRhs.neg();
            finalOp = finalOp === '<=' ? '>=' : '<=';
          }

          Object.keys(netCoeffs).forEach((v) => discoveredVars.add(v));

          constraints.push({
            id: `R${constraints.length + 1}`,
            coefficients: netCoeffs,
            operator: finalOp,
            rhs: netRhs,
          });
          continue;
        }

        // Si la línea no tuvo operador y aún no encontramos objetivo, intentar interpretarla como tal
        if (!foundObjective) {
          const parsed = LPParser.parseLinearExpression(line);
          if (Object.keys(parsed.coefficients).length > 0) {
            objectiveCoefficients = parsed.coefficients;
            Object.keys(objectiveCoefficients).forEach((v) => discoveredVars.add(v));
            foundObjective = true;
            continue;
          }
        }
      }

      if (!foundObjective || Object.keys(objectiveCoefficients).length === 0) {
        return { error: 'No se pudo identificar la función objetivo (ej: Max Z = 3x1 + 5x2).' };
      }

      if (constraints.length === 0) {
        return { error: 'Debes ingresar al menos una restricción (ej: 2x1 + x2 <= 100).' };
      }

      // Ordenar variables de forma natural: x1, x2, ..., x10 o x, y, z
      const sortedVars = Array.from(discoveredVars).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });

      return {
        model: {
          objectiveType,
          objectiveCoefficients,
          constraints,
          variables: sortedVars,
          nonNegativity: true,
        },
      };
    } catch (err: unknown) {
      return { error: `Error al procesar el modelo: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  /**
   * Genera el código LaTeX formal para renderizar el modelo con KaTeX.
   */
  static toLatex(model: LPModel): string {
    const objName = model.objectiveType === 'max' ? '\\max' : '\\min';
    let objTerms: string[] = [];

    // Función auxiliar para formatear nombres de variables como subíndices LaTeX (ej. x1 -> x_{1})
    const formatVarLatex = (v: string): string => {
      if (v.includes('_') || v.includes('{')) return v;
      return v.replace(/([a-zA-Z]+)(\d+)/g, '$1_{$2}');
    };

    // Formatear términos de la función objetivo Z
    for (const v of model.variables) {
      const coeff = model.objectiveCoefficients[v] || Fraction.ZERO;
      if (coeff.isZero()) continue;

      const vLatex = formatVarLatex(v);
      let term = '';
      if (coeff.equals(Fraction.ONE)) {
        term = vLatex;
      } else if (coeff.equals(Fraction.ONE.neg())) {
        term = `-${vLatex}`;
      } else {
        term = `${coeff.toLatex()} ${vLatex}`;
      }

      if (objTerms.length > 0 && !coeff.isNegative()) {
        objTerms.push(`+ ${term}`);
      } else {
        objTerms.push(term);
      }
    }

    const objFormula = objTerms.length > 0 ? objTerms.join(' ') : '0';

    // Formatear cada restricción alineada en LaTeX
    const constraintLines = model.constraints.map((c) => {
      const terms: string[] = [];
      for (const v of model.variables) {
        const coeff = c.coefficients[v] || Fraction.ZERO;
        if (coeff.isZero()) continue;

        const vLatex = formatVarLatex(v);
        let term = '';
        if (coeff.equals(Fraction.ONE)) {
          term = vLatex;
        } else if (coeff.equals(Fraction.ONE.neg())) {
          term = `-${vLatex}`;
        } else {
          term = `${coeff.toLatex()} ${vLatex}`;
        }

        if (terms.length > 0 && !coeff.isNegative()) {
          terms.push(`+ ${term}`);
        } else {
          terms.push(term);
        }
      }
      const lhs = terms.length > 0 ? terms.join(' ') : '0';
      const op = c.operator === '<=' ? '\\le' : c.operator === '>=' ? '\\ge' : '=';
      return `${lhs} & ${op} ${c.rhs.toLatex()}`;
    });

    const nonNeg = `${model.variables.map(formatVarLatex).join(', ')} \\ge 0`;

    return `\\begin{aligned}
${objName} \\; Z &= ${objFormula} \\\\
\\text{sujeto a:} \\\\
${constraintLines.join(' \\\\\n')} \\\\
& ${nonNeg}
\\end{aligned}`;
  }
}
