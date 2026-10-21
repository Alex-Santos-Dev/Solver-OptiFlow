# OptiFlow 🚀 (Versión Beta 0.0.1)
**Plataforma Integral de Optimización Matemática e Investigación de Operaciones Paso a Paso**

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC.svg)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX%20Math-00d084.svg)](https://katex.org/)
[![Status](https://img.shields.io/badge/Status-Beta%200.0.1-amber.svg)]()

> **Nota de Versión:** Esta es la versión **Beta 0.0.1** de **OptiFlow**, sujeta a mejoras activas, optimizaciones y retroalimentación pedagógica.

---

## 📖 Descripción General

**OptiFlow** es un entorno interactivo de alta fidelidad diseñado para estudiantes, profesores y profesionales de **Investigación de Operaciones**, **Ingeniería Industrial** y **Ciencias de la Computación**. 

A diferencia de los solvers comerciales tradicionales ("cajas negras") que únicamente devuelven el resultado numérico final, **OptiFlow** desglosa la **resolución matemática exhaustiva paso a paso**, con matrices comentadas, deducción de variables básicas/no básicas, operaciones elementales de fila en LaTeX tipográfico, planos cartesianos interactivos y grafos de redes de distribución.

---

## ✨ Características Principales

### 1. Aritmética de Fracciones Exactas sin Pérdida Decimal (`BigInt`)
* Cada coeficiente numérico se almacena como una fracción irreducible $\frac{a}{b}$ basada en enteros gigantes de precisión arbitraria (`BigInt`).
* **Cero error de redondeo:** Olvídate de problemas como $0.33333333$ al calcular pivotes o razones mínimas; todas las tablas muestran valores racionales exactos ($\frac{1}{3}, \frac{7}{2}, \frac{18}{5}$).

### 2. Método Gráfico 2D Interactivo
* Canvas HTML5 con plano cartesiano responsive, semiplanos sombreados y polígono convexo de la región factible.
* Cálculo analítico exacto de intersecciones y vértices mediante la Regla de Cramer.
* Animación y desplazamiento continuo de la recta de la función objetivo ($Z$) para identificar el vértice óptimo.

### 3. Método Simplex Tabular en $n$ Dimensiones
* Soporte para problemas de 2 a 16+ variables de decisión.
* **Simplex Estándar:** Restricciones puras $\le$ con variables de holgura.
* **Método de la Gran M:** Manejo simbólico dual $c + m \cdot M$ sin aproximaciones numéricas.
* **Método de las Dos Fases:** Fase 1 con función auxiliar $W = \sum a_i$ y transición automática a la Fase 2.
* Matrices comentadas con pivotes destacados y operaciones Gauss-Jordan en KaTeX.

### 4. Módulo de Transporte y Optimización de Redes de Distribución
* **Algoritmos de Solución Básica Factible Inicial (SBFI):**
  * *Regla de la Esquina Noroeste*
  * *Método del Costo Mínimo*
  * *Método de Aproximación de Vogel (VAM)* con penalizaciones calculadas por fila y columna.
* **Optimización Global con Método MODI:**
  * Deducción de multiplicadores $u_i + v_j = c_{ij}$ para celdas básicas.
  * Cálculo de costos marginales de oportunidad $\Delta_{ij} = u_i + v_j - c_{ij}$.
  * Detección y trazado del ciclo cerrado del **Cruce del Arroyo (Stepping Stone)** con reasignación alternante $+ / -$.
* **Visualización Dual:**
  * **Tablero Matricial:** Con celdas de costo unitario, asignaciones en esmeralda y ciclo de stepping stone interactivo.
  * **Grafo Bipartito de Red SVG:** Nodos de Fuentes (Orígenes) y Sumideros (Destinos) con curvas Bézier cuyo grosor y resplandor dependen del flujo transportado.

### 5. Diagnóstico Automático de Casos Especiales en Tiempo Real
* **En Programación Lineal:**
  * Solución Óptima Única.
  * Soluciones Óptimas Múltiples (Infinitas).
  * Problema No Acotado (*Unbounded*).
  * Problema Infactible (Sin solución factible).
  * Degeneración y Prevención de Ciclos con la **Regla de Bland (Subíndice Mínimo)**.
* **En Problemas de Transporte:**
  * **Problema Desbalanceado:** Creación automática de Origen o Destino Ficticio con costo $0$.
  * **Degeneración ($m + n - 1$):** Inserción automática de un valor infinitesimal $\varepsilon = 0$ en celdas independientes para completar el árbol generador.
  * **Óptimos Múltiples:** Alerta cuando una celda no básica alcanza $\Delta = 0$ en la tabla óptima.
  * **Rutas Prohibidas:** Bloqueo de rutas mediante penalización astronómica $M$.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + TypeScript | Arquitectura reactiva y tipado estricto |
| **Estilos y UI** | Tailwind CSS v4 + Vanilla CSS | Sistema de diseño estilo macOS (vidrio esmerilado y modo oscuro) |
| **Tipografía Matemática**| KaTeX | Renderizado LaTeX de matrices y fórmulas a velocidad nativa |
| **Aritmética Exacta** | JavaScript BigInt | Álgebra fraccionaria irreducible sin pérdida de punto flotante |
| **Herramientas de Build**| Vite 8 + Oxlint | Compilación ultrarrápida y análisis estático de código |

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
* `npm`, `pnpm` o `yarn`

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Alex-Santos-Dev/Solver-OptiFlow.git
   cd Solver-OptiFlow
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:5173/`

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📚 Documentación Técnica Completa

El repositorio incluye un manual técnico exhaustivo en Markdown:
* [`DOCUMENTACION_COMPLETA_SOLVER_IO.md`](DOCUMENTACION_COMPLETA_SOLVER_IO.md): Fundamentos matemáticos, demostraciones, glosario didáctico de más de 20 conceptos de IO, patrones de diseño GoF y guía de algoritmos.

---

## 👨‍💻 Autor y Licencia

* **Desarrollador:** Alex Santos ([@Alex-Santos-Dev](https://github.com/Alex-Santos-Dev))
* **Materia:** Investigación de Operaciones / Programación Lineal
* **Licencia:** [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
