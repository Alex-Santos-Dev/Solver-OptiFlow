/**
 * Clase Fraction (Fracción Racional Exacta)
 * -------------------------------------------------------------
 * En la materia de Investigación de Operaciones (IO), trabajar con números
 * decimales de punto flotante (float/double) suele generar problemas de redondeo
 * (por ejemplo 1/3 se convierte en 0.3333333333333333), lo cual arruina las pruebas
 * de razón mínima en Simplex y desalinea las tablas.
 *
 * Esta clase implementa números racionales exactos de la forma p/q utilizando
 * BigInt en JavaScript para garantizar precisión infinita sin desbordamientos
 * ni errores de redondeo numérico.
 */
export class Fraction {
  /** Numerador entero (p) */
  readonly n: bigint;

  /** Denominador entero positivo (q > 0) */
  readonly d: bigint;

  /**
   * Crea una fracción irreducible a partir de un numerador y denominador.
   * @param numerator Numerador (bigint, number o string)
   * @param denominator Denominador (bigint, number o string). Debe ser distinto de cero.
   */
  constructor(numerator: bigint | number | string = 0n, denominator: bigint | number | string = 1n) {
    let n = typeof numerator === 'bigint' ? numerator : BigInt(Math.round(Number(numerator)));
    let d = typeof denominator === 'bigint' ? denominator : BigInt(Math.round(Number(denominator)));

    if (d === 0n) {
      throw new Error('Error matemático: División entre cero en el constructor de Fraction.');
    }

    // Normalizar signo: el denominador siempre debe ser estrictamente positivo (d > 0)
    if (d < 0n) {
      n = -n;
      d = -d;
    }

    // Simplificar a su forma irreducible mediante el Máximo Común Divisor (MCD)
    const g = Fraction.gcd(n < 0n ? -n : n, d);
    this.n = n / g;
    this.d = d / g;
  }

  /** Constante para el valor 0 (0/1) */
  static readonly ZERO = new Fraction(0n, 1n);

  /** Constante para el valor 1 (1/1) */
  static readonly ONE = new Fraction(1n, 1n);

  /**
   * Algoritmo de Euclides para calcular el Máximo Común Divisor (MCD) entre dos BigInt.
   */
  private static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Convierte texto o números a una Fracción exacta.
   * Soporta formatos:
   * - Enteros: "5", "-12"
   * - Fracciones: "3/4", "-7/2"
   * - Decimales: "0.25", "-2.75", ".5"
   */
  static parse(val: string | number | Fraction): Fraction {
    if (val instanceof Fraction) return val;
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return new Fraction(BigInt(val), 1n);
      return Fraction.fromDecimal(val.toString());
    }

    const str = val.trim();
    if (!str) return Fraction.ZERO;

    // Si contiene barra de división "/", se separan numerador y denominador
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 2) {
        const num = Fraction.parse(parts[0]);
        const den = Fraction.parse(parts[1]);
        return num.div(den);
      }
    }

    // Si contiene punto decimal ".", se convierte a fracción exacta
    if (str.includes('.')) {
      return Fraction.fromDecimal(str);
    }

    // Quitar signo positivo explícito "+5" -> "5"
    const cleaned = str.replace(/^\+/, '');
    try {
      return new Fraction(BigInt(cleaned), 1n);
    } catch {
      const floatVal = parseFloat(cleaned);
      if (isNaN(floatVal)) return Fraction.ZERO;
      return Fraction.fromDecimal(floatVal.toString());
    }
  }

  /**
   * Convierte una cadena decimal (ej: "2.75") en fracción exacta (ej: 11/4).
   */
  static fromDecimal(str: string): Fraction {
    const isNeg = str.startsWith('-');
    const cleanStr = isNeg ? str.slice(1) : str;
    const parts = cleanStr.split('.');
    if (parts.length === 1) {
      const n = BigInt(parts[0]);
      return new Fraction(isNeg ? -n : n, 1n);
    }

    const integerPart = parts[0] ? BigInt(parts[0]) : 0n;
    const decimalPartStr = parts[1];
    const decLen = decimalPartStr.length;
    const decimalNumerator = BigInt(decimalPartStr);
    const denominator = 10n ** BigInt(decLen);

    const totalNumerator = integerPart * denominator + decimalNumerator;
    return new Fraction(isNeg ? -totalNumerator : totalNumerator, denominator);
  }

  /** Suma: (a/b) + (c/d) = (a*d + c*b) / (b*d) */
  add(other: Fraction | number | string): Fraction {
    const b = Fraction.parse(other);
    const num = this.n * b.d + b.n * this.d;
    const den = this.d * b.d;
    return new Fraction(num, den);
  }

  /** Resta: (a/b) - (c/d) = (a*d - c*b) / (b*d) */
  sub(other: Fraction | number | string): Fraction {
    const b = Fraction.parse(other);
    const num = this.n * b.d - b.n * this.d;
    const den = this.d * b.d;
    return new Fraction(num, den);
  }

  /** Multiplicación: (a/b) * (c/d) = (a*c) / (b*d) */
  mul(other: Fraction | number | string): Fraction {
    const b = Fraction.parse(other);
    const num = this.n * b.n;
    const den = this.d * b.d;
    return new Fraction(num, den);
  }

  /** División: (a/b) / (c/d) = (a*d) / (b*c) */
  div(other: Fraction | number | string): Fraction {
    const b = Fraction.parse(other);
    if (b.isZero()) {
      throw new Error('Error matemático: División entre cero.');
    }
    const num = this.n * b.d;
    const den = this.d * b.n;
    return new Fraction(num, den);
  }

  /** Opuesto aditivo: -(a/b) = (-a/b) */
  neg(): Fraction {
    return new Fraction(-this.n, this.d);
  }

  /** Valor absoluto: |a/b| */
  abs(): Fraction {
    return new Fraction(this.n < 0n ? -this.n : this.n, this.d);
  }

  /** Inverso multiplicativo: 1 / (a/b) = (b/a) */
  inv(): Fraction {
    if (this.isZero()) throw new Error('No es posible invertir el número cero.');
    return new Fraction(this.d, this.n);
  }

  /** Verifica si dos fracciones representan el mismo valor numérico */
  equals(other: Fraction | number | string): boolean {
    const b = Fraction.parse(other);
    return this.n === b.n && this.d === b.d;
  }

  /** Compara dos fracciones: retorna -1 si this < other, 0 si son iguales, 1 si this > other */
  compare(other: Fraction | number | string): number {
    const b = Fraction.parse(other);
    const diff = this.n * b.d - b.n * this.d;
    if (diff < 0n) return -1;
    if (diff > 0n) return 1;
    return 0;
  }

  /** Indica si la fracción es exactamente igual a cero */
  isZero(): boolean {
    return this.n === 0n;
  }

  /** Indica si la fracción es estrictamente positiva (> 0) */
  isPositive(): boolean {
    return this.n > 0n;
  }

  /** Indica si la fracción es estrictamente negativa (< 0) */
  isNegative(): boolean {
    return this.n < 0n;
  }

  /** Convierte la fracción a número decimal de JavaScript (útil para gráficos) */
  toNumber(): number {
    return Number(this.n) / Number(this.d);
  }

  /** Formatea como texto legible: "5" si es entero o "3/4" si tiene denominador */
  toString(): string {
    if (this.d === 1n) return this.n.toString();
    return `${this.n.toString()}/${this.d.toString()}`;
  }

  /** Formatea en sintaxis LaTeX para renderizado con KaTeX (ej: \frac{3}{4} o -\frac{1}{2}) */
  toLatex(): string {
    if (this.d === 1n) return this.n.toString();
    const isNeg = this.n < 0n;
    const absN = isNeg ? -this.n : this.n;
    const frac = `\\frac{${absN.toString()}}{${this.d.toString()}}`;
    return isNeg ? `-${frac}` : frac;
  }
}
