import { Fraction } from './fraction';

/**
 * Clase BigMValue (Álgebra de la Gran M)
 * -------------------------------------------------------------
 * En el Método de la Gran M (Big-M), la función objetivo se penaliza con una
 * constante positiva extremadamente grande M (donde formalmente M -> +infinito).
 *
 * En lugar de asignarle a M un número arbitrario como 100,000 o 1,000,000 (lo cual
 * causa errores numéricos graves en computadoras), esta clase modela los números
 * de forma puramente simbólica y exacta como un binomio:
 *
 *        v = c + m * M
 *
 * donde:
 *  - c: componente constante (número racional Fraction)
 *  - m: coeficiente que multiplica a M (número racional Fraction)
 *
 * Reglas de comparación (con M -> +infinito):
 *  1. Se comparan primero los coeficientes m1 y m2. Si m1 > m2, entonces v1 > v2.
 *  2. Si m1 == m2, el desempate lo decide la constante: c1 > c2 => v1 > v2.
 */
export class BigMValue {
  /** Parte constante (independiente de M) */
  readonly c: Fraction;

  /** Coeficiente que acompaña a M */
  readonly m: Fraction;

  /**
   * Crea un valor algebraico de la forma: c + m*M
   * @param c Constante numérica (Fraction, number o string)
   * @param m Coeficiente de M (Fraction, number o string)
   */
  constructor(c: Fraction | number | string = Fraction.ZERO, m: Fraction | number | string = Fraction.ZERO) {
    this.c = Fraction.parse(c);
    this.m = Fraction.parse(m);
  }

  /** Constante para 0 (0 + 0M) */
  static readonly ZERO = new BigMValue(Fraction.ZERO, Fraction.ZERO);

  /** Constante para 1 (1 + 0M) */
  static readonly ONE = new BigMValue(Fraction.ONE, Fraction.ZERO);

  /** Constante para +M (0 + 1M) */
  static readonly M = new BigMValue(Fraction.ZERO, Fraction.ONE);

  /** Constante para -M (0 - 1M) */
  static readonly NEG_M = new BigMValue(Fraction.ZERO, Fraction.ONE.neg());

  /** Convierte una Fracción pura en BigMValue (con m = 0) */
  static fromFraction(f: Fraction): BigMValue {
    return new BigMValue(f, Fraction.ZERO);
  }

  /**
   * Parsea cadenas como "2 - 3M", "5M", "-M", "3/4 + M" o valores numéricos.
   */
  static parse(val: BigMValue | Fraction | number | string): BigMValue {
    if (val instanceof BigMValue) return val;
    if (val instanceof Fraction) return BigMValue.fromFraction(val);
    if (typeof val === 'number') return BigMValue.fromFraction(Fraction.parse(val));
    
    const str = val.trim();
    if (!str.includes('M')) {
      return BigMValue.fromFraction(Fraction.parse(str));
    }

    // Patrón algebraico para expresiones como "2 - 3M" o "M"
    let clean = str.replace(/\s+/g, '');
    let mCoeff = Fraction.ZERO;
    let constPart = Fraction.ZERO;

    const mIndex = clean.indexOf('M');
    if (mIndex !== -1) {
      let signIdx = -1;
      for (let i = mIndex - 1; i >= 0; i--) {
        if (clean[i] === '+' || clean[i] === '-') {
          signIdx = i;
          break;
        }
      }

      let mStr: string;
      let cStr = '';
      if (signIdx === -1 || signIdx === 0) {
        mStr = clean.slice(0, mIndex);
        cStr = clean.slice(mIndex + 1);
      } else {
        cStr = clean.slice(0, signIdx);
        mStr = clean.slice(signIdx, mIndex);
      }

      if (mStr === '' || mStr === '+') mCoeff = Fraction.ONE;
      else if (mStr === '-') mCoeff = Fraction.ONE.neg();
      else mCoeff = Fraction.parse(mStr);

      if (cStr) {
        constPart = Fraction.parse(cStr);
      }
    }

    return new BigMValue(constPart, mCoeff);
  }

  /** Suma algebraica: (c1 + m1*M) + (c2 + m2*M) = (c1+c2) + (m1+m2)*M */
  add(other: BigMValue | Fraction | number | string): BigMValue {
    const o = BigMValue.parse(other);
    return new BigMValue(this.c.add(o.c), this.m.add(o.m));
  }

  /** Resta algebraica: (c1 + m1*M) - (c2 + m2*M) = (c1-c2) + (m1-m2)*M */
  sub(other: BigMValue | Fraction | number | string): BigMValue {
    const o = BigMValue.parse(other);
    return new BigMValue(this.c.sub(o.c), this.m.sub(o.m));
  }

  /** Multiplicación por un escalar puro k: k * (c + m*M) = (k*c) + (k*m)*M */
  mul(scalar: Fraction | number | string): BigMValue {
    const s = Fraction.parse(scalar);
    return new BigMValue(this.c.mul(s), this.m.mul(s));
  }

  /**
   * Multiplica este valor por M:
   * (c + 0*M) * M = 0 + c*M
   * Crucial para sumar o restar M * (Renglón i) a la fila Z en Simplex.
   */
  mulM(): BigMValue {
    return new BigMValue(Fraction.ZERO, this.c);
  }

  /** Multiplicación general entre dos BigMValue (manteniendo términos lineales en M) */
  mulBigM(other: BigMValue): BigMValue {
    if (other.m.isZero()) {
      return this.mul(other.c);
    }
    if (this.m.isZero()) {
      return other.mul(this.c);
    }
    return new BigMValue(this.c.mul(other.c), this.c.mul(other.m).add(this.m.mul(other.c)));
  }

  /** División por un escalar puro k: (c + m*M) / k = (c/k) + (m/k)*M */
  div(scalar: Fraction | number | string): BigMValue {
    const s = Fraction.parse(scalar);
    return new BigMValue(this.c.div(s), this.m.div(s));
  }

  /** Negación algebraica: -(c + m*M) = (-c - m*M) */
  neg(): BigMValue {
    return new BigMValue(this.c.neg(), this.m.neg());
  }

  /** Retorna true si tanto la constante c como el coeficiente m son cero */
  isZero(): boolean {
    return this.c.isZero() && this.m.isZero();
  }

  /** Retorna true si contiene un término dependiente de M (m != 0) */
  hasM(): boolean {
    return !this.m.isZero();
  }

  /**
   * Comparación estricta con M -> +infinito:
   * - Retorna 1 si this > other
   * - Retorna -1 si this < other
   * - Retorna 0 si this == other
   */
  compare(other: BigMValue | Fraction | number | string): number {
    const o = BigMValue.parse(other);
    const mCmp = this.m.compare(o.m);
    if (mCmp !== 0) return mCmp;
    return this.c.compare(o.c);
  }

  /** Retorna true si el valor es estrictamente positivo (> 0 con M -> +infinito) */
  isPositive(): boolean {
    return this.compare(BigMValue.ZERO) > 0;
  }

  /** Retorna true si el valor es estrictamente negativo (< 0 con M -> +infinito) */
  isNegative(): boolean {
    return this.compare(BigMValue.ZERO) < 0;
  }

  /** Comprueba igualdad exacta de ambos componentes */
  equals(other: BigMValue | Fraction | number | string): boolean {
    const o = BigMValue.parse(other);
    return this.c.equals(o.c) && this.m.equals(o.m);
  }

  /** Evaluación numérica aproximada reemplazando M por un número grande (por defecto 10^6) */
  toNumber(mValue = 1e6): number {
    return this.c.toNumber() + this.m.toNumber() * mValue;
  }

  /** Representación en texto legible (ej: "2 - 3M", "5M", "4/3") */
  toString(): string {
    if (this.m.isZero()) return this.c.toString();

    let mPart = '';
    if (this.m.equals(Fraction.ONE)) mPart = 'M';
    else if (this.m.equals(Fraction.ONE.neg())) mPart = '-M';
    else mPart = `${this.m.toString()}M`;

    if (this.c.isZero()) return mPart;

    if (this.m.isNegative()) {
      return `${this.c.toString()} - ${this.m.neg().toString()}M`;
    }
    return `${this.c.toString()} + ${mPart}`;
  }

  /** Representación en LaTeX para KaTeX (ej: "\frac{1}{2} - 3M") */
  toLatex(): string {
    if (this.m.isZero()) return this.c.toLatex();

    let mPart = '';
    if (this.m.equals(Fraction.ONE)) mPart = 'M';
    else if (this.m.equals(Fraction.ONE.neg())) mPart = '-M';
    else {
      mPart = `${this.m.toLatex()}M`;
    }

    if (this.c.isZero()) return mPart;

    if (this.m.isNegative()) {
      const absM = this.m.neg();
      const absMPart = absM.equals(Fraction.ONE) ? 'M' : `${absM.toLatex()}M`;
      return `${this.c.toLatex()} - ${absMPart}`;
    }

    return `${this.c.toLatex()} + ${mPart}`;
  }
}
