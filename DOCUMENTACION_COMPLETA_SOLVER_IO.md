# Documentación Completa y Manual Técnico: OptiFlow (Beta 0.0.1)
**Materia:** Investigación de Operaciones / Programación Lineal  
**Software:** OptiFlow (Versión Beta 0.0.1) - Motor de Optimización y Resolución Paso a Paso  
**Repositorio GitHub:** https://github.com/Alex-Santos-Dev/Solver-OptiFlow  
**Tecnologías:** React 19, TypeScript, Tailwind CSS v4, KaTeX, BigInt  
**Arquitectura:** MVC (Modelo - Vista - Controlador) + Patrones GoF (Strategy, Value Object, Facade, Parser, Observer)

---

## Índice General
1. [Introducción y Justificación del Proyecto](#1-introducción-y-justificación-del-proyecto)
2. [Glosario Didáctico Integral: De lo Simple a lo Técnico](#2-glosario-didáctico-integral-de-lo-simple-a-lo-técnico)
3. [Fundamentos Matemáticos y Algorítmicos](#3-fundamentos-matemáticos-y-algorítmicos)
   - 3.1. [Método Gráfico Bidimensional (2D)](#31-método-gráfico-bidimensional-2d)
   - 3.2. [Método Simplex Estándar](#32-método-simplex-estándar)
     - 3.2.1. [Demostración y Justificación: ¿Por qué las Variables No Básicas valen cero?](#321-demostración-y-justificación-por-qué-las-variables-no-básicas-valen-cero)
     - 3.2.2. [Anatomía de la Tabla Simplex y Ubicación Superior de la Fila Z (Renglón 0)](#322-anatomía-de-la-tabla-simplex-y-ubicación-superior-de-la-fila-z-renglón-0)
     - 3.2.3. [Comparativa de Convenciones de Lectura de la Fila Z (Ecuación Canónica vs Costos Relativos)](#323-comparativa-de-convenciones-de-lectura-de-la-fila-z)
   - 3.3. [Método de la Gran M (Penalización Simbólica)](#33-método-de-la-gran-m-penalización-simbólica)
   - 3.4. [Método de las Dos Fases](#34-método-de-las-dos-fases)
   - 3.5. [Aritmética de Fracciones Exactas sin Pérdida Decimal](#35-aritmética-de-fracciones-exactas-sin-pérdida-decimal)
   - 3.6. [Teoría de Dualidad y Lectura de Precios Sombra (Shadow Prices)](#36-teoría-de-dualidad-y-lectura-de-precios-sombra-shadow-prices)
   - 3.7. [Modelos de Transporte, Redes de Distribución y Casos Especiales](#37-modelos-de-transporte-redes-de-distribución-y-casos-especiales)
     - 3.7.1. [Formulación Canónica y Propiedad de Unimodularidad Total](#371-formulación-canónica-y-propiedad-de-unimodularidad-total)
     - 3.7.2. [Métodos de Solución Inicial: Esquina Noroeste, Costo Mínimo y Vogel (VAM)](#372-métodos-de-solución-inicial-esquina-noroeste-costo-mínimo-y-vogel-vam)
     - 3.7.3. [Optimización con el Método MODI y Ciclos del Cruce del Arroyo](#373-optimización-con-el-método-modi-y-ciclos-del-cruce-del-arroyo)
     - 3.7.4. [Diagnóstico y Gestión Automática de Casos Especiales en Transporte](#374-diagnóstico-y-gestión-automática-de-casos-especiales-en-transporte)
4. [Diagnóstico Exhaustivo de Casos de Paro y Comportamientos Especiales](#4-diagnóstico-exhaustivo-de-casos-de-paro-y-comportamientos-especiales)
   - 4.1. [Diagrama de Flujo del Árbol de Decisión de Paro](#41-diagrama-de-flujo-del-árbol-de-decisión-de-paro)
   - 4.2. [Caso 1: Solución Óptima Única](#42-caso-1-solución-óptima-única)
   - 4.3. [Caso 2: Soluciones Óptimas Múltiples (Infinitas Soluciones)](#43-caso-2-soluciones-óptimas-múltiples-infinitas-soluciones)
   - 4.4. [Caso 3: Problema No Acotado (Unbounded)](#44-caso-3-problema-no-acotado-unbounded)
   - 4.5. [Caso 4: Problema Infactible (Sin Región Factible)](#45-caso-4-problema-infactible-sin-región-factible)
   - 4.6. [Caso 5: Degeneración y Prevención de Ciclos con la Regla de Bland](#46-caso-5-degeneración-y-prevención-de-ciclos-con-la-regla-de-bland)
5. [Arquitectura del Sistema, Diseño Visual y Patrones de Software](#5-arquitectura-del-sistema-diseño-visual-y-patrones-de-software)
   - 5.1. [Patrón MVC (Modelo - Vista - Controlador)](#51-patrón-mvc-modelo---vista---controlador)
   - 5.2. [Patrones de Diseño GoF (Strategy, Value Object, Facade, Interpreter, Observer)](#52-patrones-de-diseño-adicionales)
   - 5.3. [Sistema de Diseño Visual e Interfaz de Usuario Estilo macOS (Sonoma / Sequoia)](#53-sistema-de-diseño-visual-e-interfaz-de-usuario-estilo-macos)
   - 5.4. [Pipeline de Parseo, Sintaxis Formal Aceptada y Flujo End-to-End](#54-pipeline-de-parseo-sintaxis-formal-aceptada-y-flujo-end-to-end)
6. [Estructura y Desglose Modular del Código Fuente](#6-estructura-y-desglose-modular-del-código-fuente)
7. [Catálogo de Casos de Estudio y Ejemplos Resueltos](#7-catálogo-de-casos-de-estudio-y-ejemplos-resueltos)
8. [Guía de Instalación, Comandos CLI y Exportación Académica](#8-guía-de-instalación-comandos-cli-y-exportación-académica)
9. [Referencias Bibliográficas (Formato APA 7.ª Edición)](#9-referencias-bibliográficas-formato-apa-7ª-edición)

---

## 1. Introducción y Justificación del Proyecto

En el ámbito empresarial, logístico, financiero e industrial, los recursos fundamentales (presupuesto, inventario, horas de máquina, mano de obra, materias primas) son intrínsecamente escasos. La **Investigación de Operaciones (IO)** es la rama de la ciencia aplicada que utiliza modelos matemáticos, estadística y algoritmos para determinar la asignación óptima de dichos recursos, alcanzando la máxima eficiencia operativa.

Dentro de la IO, la **Programación Lineal (PL)** representa la técnica cuantitativa de mayor impacto económico a nivel mundial. Permite modelar problemas donde tanto el objetivo perseguido como las limitaciones del entorno son funciones lineales de las variables de decisión.

### La Problemática Académica
A pesar de la enorme trascendencia de la materia, los estudiantes universitarios enfrentan obstáculos comunes con las herramientas tradicionales:
1. **Opacidad de software comercial ("Caja Negra"):** Herramientas como Excel Solver, LINGO o MATLAB entregan directamente la solución numérica final, pero omiten los pasos intermedios, las tablas simplex iterativas y la deducción geométrica.
2. **Errores de redondeo de punto flotante:** Al utilizar números decimales estándar (IEEE 754 de 64 bits), operaciones con fracciones como $1/3$, $2/7$ o $5/6$ sufren pérdida de precisión decimal acumulada (ej. $0.33333333$), arruinando la verificación de pivotes y operaciones de fila de Gauss-Jordan en tareas y exámenes.
3. **Falta de conexión entre el Álgebra y la Geometría:** Muchos estudiantes memorizan las tablas simplex sin comprender que cada tabla representa exactamente un vértice en el espacio geométrico dimensional.

### La Solución: Solver IO
**Solver IO** fue desarrollado como un entorno educativo y profesional interactivo que:
* Muestra la **resolución matemática exhaustiva paso a paso**, con matrices comentadas, operaciones elementales de fila en LaTeX tipográfico y deducciones analíticas formales.
* Funciona con **fracciones racionales exactas ($\frac{a}{b}$)** basadas en enteros de precisión arbitraria (`BigInt`), garantizando cero error de redondeo.
* Proporciona un **Método Gráfico interactivo** con plano cartesiano HTML5, sombreado de polígonos convexos, tabla de coordenadas y animación de la recta de la función objetivo.
* Ofrece tres variantes de resolución lineal: **Simplex Estándar**, **Método de la Gran M** (con álgebra simbólica dual $c + m \cdot M$) y **Método de Dos Fases** (con función objetivo auxiliar $W$).

---

## 2. Glosario Didáctico Integral: De lo Simple a lo Técnico

Para dominar tanto las intuiciones cotidianas como el vocabulario riguroso exigido en exámenes y exposiciones:

| Término / Concepto | Explicación Sencilla (Analogía Práctica) | Definición Formal en Investigación de Operaciones |
| :--- | :--- | :--- |
| **Función Objetivo ($Z$)** | Es la meta que persigues: ganar la mayor cantidad de dinero posible (maximizar) o gastar lo mínimo indispensable (minimizar). | Expresión lineal $Z = \sum_{j=1}^n c_j x_j$ que cuantifica matemáticamente el criterio de optimización sujeto al conjunto de restricciones del sistema. |
| **Variables de Decisión ($x_j$)** | Son las preguntas que debes responder: *¿Cuántas mesas ($x_1$) y cuántas sillas ($x_2$) debo producir esta semana?* | Incógnitas $x_j \in \mathbb{R}$ cuyos valores cuantitativos deben determinarse para optimizar la función objetivo respetando las limitaciones impuestas. |
| **Restricciones Lineales** | Son los límites reales: *Solo tengo 40 horas de carpintería y 120 pies de madera en el almacén*. | Desigualdades o igualdades lineales $\sum_{j=1}^n a_{ij} x_j \ \{\le, \ge, =\} \ b_i$ que delimitan la disponibilidad de recursos o cuotas mínimas obligatorias. |
| **Condición de No Negatividad** | Es el sentido común: no puedes fabricar $-5$ sillas ni contratar $-2$ camiones de transporte. | Restricción axiomática $x_j \ge 0, \forall j$, que confina el espacio de soluciones al primer cuadrante (u ortante positivo) del espacio vectorial $\mathbb{R}^n$. |
| **Región Factible (Espacio de Soluciones)** | Es la *zona permitida*: el conjunto de todas las combinaciones posibles que no violan ninguna restricción del problema. | Polítopo o poliedro convexo formado por la intersección finita de los semiespacios cerrados definidos por las restricciones del modelo: $\mathcal{F} = \{ \mathbf{x} \in \mathbb{R}^n \mid \mathbf{A}\mathbf{x} \le \mathbf{b}, \mathbf{x} \ge \mathbf{0} \}$. |
| **Puntos Extremos (Vértices)** | Son las *esquinas* de la zona permitida. La matemática demuestra que la mejor solución siempre estará en al menos una de estas esquinas. | Puntos frontera $\mathbf{x} \in \mathcal{F}$ que no pueden expresarse como combinación convexa estricta de dos puntos distintos de la región factible: $\mathbf{x} \neq \alpha \mathbf{y} + (1-\alpha)\mathbf{z}$ con $\alpha \in (0,1)$. |
| **Variable de Holgura ($s_i$)** | Es el *recurso sobrante*: si disponías de 100 horas y la producción consumió 80, la holgura vale 20 horas no utilizadas. | Variable no negativa $s_i \ge 0$ sumada a una restricción de tipo $\le$ para convertirla en ecuación canónica: $\sum a_{ij}x_j + s_i = b_i$. |
| **Variable de Exceso ($e_i$)** | Es lo que te *pasaste por encima* del mínimo exigido: si debías entregar al menos 50 piezas y entregaste 65, el exceso vale 15. | Variable no negativa $e_i \ge 0$ restada en una restricción de tipo $\ge$ para convertirla en igualdad canónica: $\sum a_{ij}x_j - e_i = b_i$. |
| **Variable Artificial ($a_i$)** | Es una *muleta matemática temporal*: como las restricciones $\ge$ o $=$ no tienen holgura positiva en el origen, se inventa esta variable para poder arrancar el algoritmo. | Variable no negativa $a_i \ge 0$ introducida artificialmente para proveer un vector unitario en la base canónica inicial cuando no existe una solución básica factible obvia. Debe valer 0 al final. |
| **La Gran M ($M$)** | Es una *multa gigantesca*: se cobra un castigo tan astronómico a las variables artificiales que el algoritmo se ve forzado a expulsarlas de la solución. | Parámetro de penalización simbólica $M \gg 0$ ($M \to +\infty$) con coeficiente $-M$ (en Max) o $+M$ (en Min) asignado a cada variable artificial en la fila de costos relativos de la función objetivo. |
| **Método de Dos Fases** | Es *separar la tarea en dos partes*: la Fase 1 busca una solución válida cualquiera eliminando las muletas; la Fase 2 optimiza la ganancia real. | Procedimiento en dos etapas: la Fase 1 resuelve el problema auxiliar $\min W = \sum a_i$. Si $W^* = 0$, la Fase 2 restaura la función objetivo original $Z$ y continúa la optimización ordinaria. |
| **Pivoteo de Gauss-Jordan** | Es el *movimiento algebraico para mudarse de esquina*: se elige una variable que entra a la base y se desaloja a la variable que frena primero. | Transformación elemental de matrices donde la fila pivote se normaliza dividiendo entre el elemento pivote $a_{rk}$, y las demás filas se reducen a cero: $R_i \leftarrow R_i - a_{ik} R_r$. |
| **Regla de la Razón Mínima** | Es la *prueba del freno*: calcula qué recurso se agotará primero al aumentar la variable entrante para no salirse jamás de la zona permitida. | Criterio de salida de Dantzig: $\min_{i} \{ b_i / a_{ik} \mid a_{ik} > 0 \}$, que determina la fila pivote para garantizar que el nuevo vector de términos independientes continúe siendo no negativo ($b_i \ge 0$). |
| **Línea de Isocosto / Isobeneficio** | Es una regla recta que representa una ganancia fija. Se empuja a lo largo del dibujo y el último punto que toca antes de abandonar la región es el óptimo. | Línea de nivel $\{ (x_1, x_2) \mid c_1 x_1 + c_2 x_2 = k \}$ ortogonal al vector gradiente $\nabla Z$, que barre la región factible en la dirección de máximo crecimiento o decrecimiento. |
| **Variables Básicas (VB)** | Son las variables *activas en la solución*: las que tienen permiso de tomar valores positivos en la esquina actual y determinan el inventario o producción. | Subconjunto de $m$ variables asociadas a las columnas linealmente independientes que forman la base invertible $\mathbf{B}$ en el sistema particionado $\mathbf{B}\mathbf{x}_B = \mathbf{b}$. Su valor numérico es $\mathbf{x}_B = \mathbf{B}^{-1}\mathbf{b}$. |
| **Variables No Básicas (VNB)** | Son las variables *apagadas o fijadas en cero*: recursos que no se han tocado o productos que no conviene fabricar en esa esquina. | Subconjunto de $n - m$ variables fijadas estrictamente en cero ($\mathbf{x}_N = \mathbf{0}$) para eliminar los grados de libertad del sistema y forzar una solución básica única en un vértice del poliedro. |
| **Grados de Libertad ($n - m$)** | Es la cantidad de variables que *sobran* respecto a las restricciones disponibles. Como sobran, se apagan fijándolas en 0. | Dimensión del espacio nulo de la matriz de coeficientes $\mathbf{A} \in \mathbb{R}^{m \times n}$. Al fijar $n - m$ variables en cero, el sistema indeterminado se colapsa a un sistema determinado $m \times m$. |
| **Solución Básica Factible (SBF)** | Es una solución que coincide exactamente con una *esquina válida* de la región factible, sin violar ninguna regla. | Solución básica $\mathbf{x} = (\mathbf{x}_B, \mathbf{x}_N)$ donde $\mathbf{x}_N = \mathbf{0}$ y el vector de variables básicas satisface la no negatividad: $\mathbf{x}_B = \mathbf{B}^{-1}\mathbf{b} \ge \mathbf{0}$. Corresponde biunívocamente a un punto extremo de $\mathcal{F}$. |
| **Costos Reducidos (Fila $Z$)** | Es el *termómetro de rentabilidad*: indica cuánto dinero extra ganarías por cada unidad que decidas producir de una variable apagada. | Coeficientes $\bar{c}_j = c_j - \mathbf{c}_B \mathbf{B}^{-1}\mathbf{A}_j$ (o su negativo en la forma canónica de ecuación). Representan la derivada direccional de $Z$ respecto al incremento de una variable no básica. |
| **Regla de Bland (Anti-ciclado)** | Es la *regla de desempate por orden alfabético*: cuando hay empate para entrar o salir, se elige siempre la variable con el subíndice más chico para no dar vueltas en círculo. | Criterio de selección determinista que ante empates en la variable entrante o saliente, selecciona la de menor índice $j$ o $i$. Garantiza formalmente la ausencia de ciclos infinitos en presencia de soluciones degeneradas. |

---

## 3. Fundamentos Matemáticos y Algorítmicos

### 3.1. Método Gráfico Bidimensional (2D)
Apto exclusivamente para problemas con dos variables de decisión ($x_1, x_2$). Su algoritmo consta de 5 pasos estructurados:
1. **Conversión a Rectas Frontera:** Cada inecuación $a_{i1} x_1 + a_{i2} x_2 \le b_i$ se convierte en la recta frontera $a_{i1} x_1 + a_{i2} x_2 = b_i$.
2. **Determinación de Intersecciones:** Se calculan las intersecciones con los ejes cartesianos:
   * Eje $X$ ($x_2 = 0$): $x_1 = b_i / a_{i1}$.
   * Eje $Y$ ($x_1 = 0$): $x_2 = b_i / a_{i2}$.
3. **Evaluación de Semiplanos:** Se toma un punto de prueba, típicamente el origen $(0,0)$. Si satisface la desigualdad original, el semiplano factible apunta hacia el origen; si no, apunta en sentido contrario.
4. **Cálculo de Vértices mediante la Regla de Cramer:** Para cada par de rectas secantes, se resuelve el sistema lineal $2 \times 2$:
   $$\det(A) = a_{11} a_{22} - a_{12} a_{21}$$
   Si $\det(A) \neq 0$, la intersección exacta es:
   $$x_1 = \frac{b_1 a_{22} - a_{12} b_2}{\det(A)}, \quad x_2 = \frac{a_{11} b_2 - b_1 a_{21}}{\det(A)}$$
   Se verifica si el punto $(x_1, x_2)$ satisface todas las demás restricciones y la no negatividad ($x_1 \ge 0, x_2 \ge 0$).
5. **Ordenamiento Polar y Evaluación de $Z$:** Para renderizar el polígono en el lienzo, los vértices factibles se ordenan angularmente alrededor de su centroide $(\bar{x}_1, \bar{x}_2)$ calculando $\theta = \text{atan2}(x_2 - \bar{x}_2, x_1 - \bar{x}_1)$. Se evalúa $Z(x_1, x_2)$ en cada vértice; el mayor (en Max) o menor (en Min) es la solución óptima global.

---

### 3.2. Método Simplex Estándar
Diseñado para problemas de optimización lineal donde todas las restricciones son de tipo $\le$ con términos independientes no negativos ($b_i \ge 0$):
1. **Forma Estándar:** Se agregan variables de holgura $s_i \ge 0$:
   $$\mathbf{A}\mathbf{x} + \mathbf{I}\mathbf{s} = \mathbf{b}, \quad \mathbf{x}, \mathbf{s} \ge \mathbf{0}$$
2. **Tabla Inicial:** Las variables de holgura forman la base canónica inicial $\mathbf{B} = \mathbf{I}$.
3. **Criterio de Optimalidad (Condición de Entrada):**
   * *Maximización:* Si todos los coeficientes de la fila $Z$ son $\ge 0$ (en convención $Z - \sum c_j x_j = 0$, ningún negativo), la tabla es óptima. Si hay negativos, la variable con el coeficiente más negativo entra a la base (columna pivote $k$).
   * *Minimización:* Entra la variable con el coeficiente positivo más alto.
4. **Criterio de Factibilidad (Condición de Salida):** Se calcula la razón mínima:
   $$\theta = \min_{i} \left\{ \frac{b_i}{a_{ik}} \ \middle|\ a_{ik} > 0 \right\}$$
   La fila que alcanza el mínimo $\theta$ es la fila pivote $r$ y su variable básica abandona la base.
5. **Operaciones de Fila de Gauss-Jordan:**
   * Fila pivote: $R_r \leftarrow R_r / a_{rk}$.
   * Resto de filas: $R_i \leftarrow R_i - a_{ik} R_r, \quad \forall i \neq r$.

#### 3.2.1. Demostración y Justificación: ¿Por qué las Variables No Básicas valen cero?
Una de las dudas más recurrentes en el aprendizaje del Método Simplex es la razón por la cual las **Variables No Básicas (VNB)** se muestran siempre con valor $0$ en cada paso del algoritmo.

**1. Demostración Matricial por Grados de Libertad:**
Dado el sistema lineal en forma estándar:
$$\mathbf{A}\mathbf{x} = \mathbf{b}, \quad \mathbf{A} \in \mathbb{R}^{m \times n}, \quad \mathbf{b} \in \mathbb{R}^m, \quad n > m$$
El sistema tiene $m$ ecuaciones y $n$ incógnitas. Al haber más incógnitas que ecuaciones, el sistema es indeterminado con **$n - m$ grados de libertad** (infinitas combinaciones de variables satisfacen las ecuaciones).

Para obtener una solución particular finita y computable:
* Se particiona la matriz $\mathbf{A}$ en dos bloques: $\mathbf{A} = [\mathbf{B} \mid \mathbf{N}]$, donde $\mathbf{B} \in \mathbb{R}^{m \times m}$ es una matriz no singular (invertible) llamada **Base**, y $\mathbf{N} \in \mathbb{R}^{m \times (n-m)}$ es la submatriz de columnas no básicas.
* El vector de incógnitas se particiona análogamente: $\mathbf{x} = \begin{bmatrix} \mathbf{x}_B \\ \mathbf{x}_N \end{bmatrix}$.
* La ecuación matricial se reescribe como:
  $$\mathbf{B}\mathbf{x}_B + \mathbf{N}\mathbf{x}_N = \mathbf{b}$$
* Para eliminar los $n - m$ grados de libertad de forma determinista, **se fija axiomáticamente:**
  $$\mathbf{x}_N = \mathbf{0} \quad \text{(Variables No Básicas = 0)}$$
* Al anular $\mathbf{N}\mathbf{x}_N = \mathbf{0}$, la ecuación se reduce a un sistema cuadrado invertible de $m \times m$:
  $$\mathbf{B}\mathbf{x}_B = \mathbf{b} \implies \mathbf{x}_B = \mathbf{B}^{-1}\mathbf{b}$$
El vector resultante $\mathbf{x}_B$ corresponde exactamente a los valores numéricos reflejados en la columna de **Solución (RHS)** de la tabla Simplex.

**2. Interpretación Económica y Práctica (Tabla Inicial):**
* Al plantear un problema de producción (ej. mesas $x_1$ y sillas $x_2$), en el momento cero todavía no se ha fabricado ningún producto:
  $$x_1 = 0, \quad x_2 = 0 \quad (\text{Variables No Básicas = 0})$$
* En consecuencia, todos los recursos disponibles en almacén (madera, horas de carpintería) permanecen completamente intactos y sin consumir. Por ende, las holguras toman el valor total disponible:
  $$s_1 = b_1, \quad s_2 = b_2, \quad \dots, \quad s_m = b_m \quad (\text{Variables Básicas = RHS})$$

**3. Dinámica del Pivoteo (Intercambio en la Frontera):**
* Geométricamente, cada variable igualada a cero representa un plano frontera que delimita la región factible. El punto donde se intersectan $n - m$ de estas fronteras es un **vértice extremo** del poliedro.
* En cada iteración del Simplex:
  1. Una variable no básica (que valía 0) es seleccionada para **entrar a la base**, incrementando su valor desde 0 hasta $\theta > 0$.
  2. Al mismo tiempo, una variable básica se reduce gradualmente hasta llegar a $0$ y **abandona la base** (se convierte en no básica).
  3. De este modo, en todo momento el número de variables con valor 0 es exactamente $n - m$, desplazando la solución de un vértice del poliedro al vértice adyacente más prometedor.

#### 3.2.2. Anatomía de la Tabla Simplex y Ubicación Superior de la Fila Z (Renglón 0)
En `Solver IO`, la tabla simplex sitúa la **Fila Objetivo ($Z$ o $W$) en la parte superior (Renglón 0)**, inmediatamente debajo del encabezado de columnas y por encima de las filas de restricciones:

| Base | $x_1$ | $x_2$ | $\dots$ | $s_1$ | $s_2$ | Solución (RHS) | Razón $\theta$ |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$Z$ (Renglón 0)** | $-c_1$ | $-c_2$ | $\dots$ | $0$ | $0$ | $Z_{\text{actual}}$ | — |
| **$s_1$ (Fila 1)** | $a_{11}$ | $a_{12}$ | $\dots$ | $1$ | $0$ | $b_1$ | $b_1 / a_{1k}$ |
| **$s_2$ (Fila 2)** | $a_{21}$ | $a_{22}$ | $\dots$ | $0$ | $1$ | $b_2$ | $b_2 / a_{2k}$ |

**Ventajas Pedagógicas de la Fila Z en Cabecera:**
1. **Prioridad Cognitiva:** El estudiante evalúa en primer lugar el criterio de optimalidad (si quedan coeficientes negativos en Max) y la variable entrante antes de descender al cálculo de cocientes $\theta$.
2. **Coherencia con la Literatura Internacional:** Sigue el estándar adoptado por autores clásicos de Investigación de Operaciones como Hillier & Lieberman, Bazaraa y Winston.
3. **Resaltado Sincronizado:** La celda de la Fila $Z$ correspondiente a la columna pivote comparte el resaltado azul translúcido con el resto de la columna, haciendo evidente la contribución de la variable entrante a la función objetivo.

#### 3.2.3. Comparativa de Convenciones de Lectura de la Fila Z
Dependiendo de la bibliografía docente consultada, la fila $Z$ puede expresarse bajo dos formas matemáticas equivalentes:

| Aspecto | Convención 1: Forma de Ecuación Canónica (Usada en Solver IO) | Convención 2: Costos Relativos Directos ($c_j - z_j$) |
| :--- | :--- | :--- |
| **Planteamiento Algebraico** | $Z - \sum_{j=1}^n c_j x_j = 0$ | Fila dedicada al diferencial de costo neto $c_j - z_j$ |
| **Signo en Tabla Inicial** | Los coeficientes iniciales aparecen con signo cambiado: **$-c_j$** | Los coeficientes iniciales conservan el signo de la función objetivo: **$+c_j$** |
| **Criterio de Entrada (Max)** | Entra la variable con el coeficiente **más negativo** ($< 0$) | Entra la variable con el coeficiente **más positivo** ($> 0$) |
| **Criterio de Paro (Max)** | Se detiene cuando **todos los coeficientes son $\ge 0$** | Se detiene cuando **todos los coeficientes son $\le 0$** |
| **Criterio de Entrada (Min)** | Entra la variable con el coeficiente **más positivo** ($> 0$) | Entra la variable con el coeficiente **más negativo** ($< 0$) |
| **Criterio de Paro (Min)** | Se detiene cuando **todos los coeficientes son $\le 0$** | Se detiene cuando **todos los coeficientes son $\ge 0$** |

*Nota:* Ambas formulaciones son matemáticamente idénticas; una es simplemente el producto escalar por $-1$ de la otra. `Solver IO` utiliza la Convención 1 debido a que mantiene la consistencia estricta de las operaciones elementales de Gauss-Jordan aplicadas a todo el sistema aumentado.

---

### 3.3. Método de la Gran M (Penalización Simbólica)
Cuando existen restricciones $\ge$ o $=$:
* En $\ge$: Se resta exceso $e_i \ge 0$ y se suma artificial $a_i \ge 0$:
  $$a_{i1} x_1 + \dots - e_i + a_i = b_i$$
* En $=$: Se suma artificial $a_i \ge 0$:
  $$a_{i1} x_1 + \dots + a_i = b_i$$
* **Penalización en la Función Objetivo:**
  $$\text{Max } Z = \sum c_j x_j - M \sum a_i \quad \Longleftrightarrow \quad \text{Min } Z = \sum c_j x_j + M \sum a_i$$
* **Álgebra Simbólica Dual:** En `Solver IO`, cada número de la tabla se modela como:
  $$V = c + m \cdot M, \quad c, m \in \mathbb{Q}$$
  Al comparar dos valores $V_1$ y $V_2$, se evalúa primero el coeficiente de $M$ ($m_1$ vs $m_2$); solo si son iguales se desempata con la parte escalar ($c_1$ vs $c_2$). Esto elimina totalmente los errores de desbordamiento decimal producidos por sustituir $M = 100,000$.

---

### 3.4. Método de las Dos Fases
Resuelve el problema en dos etapas bien diferenciadas sin necesidad de la constante simbólica $M$:
* **Fase 1:** Se ignora temporalmente la función objetivo original y se minimiza la suma de las variables artificiales:
  $$\text{Min } W = \sum_{i} a_i$$
  * Se construye la fila $W$ en forma canónica sumando las filas que contienen variables artificiales: $R_W = \sum R_i$.
  * Se itera con Simplex estándar. Al terminar:
    * Si $W^* > 0$, el problema es **INFACTIBLE** (no existe ninguna solución que cumpla todas las restricciones).
    * Si $W^* = 0$, se ha hallado una Solución Básica Factible válida y se pasa a la Fase 2.
* **Fase 2:**
  * Se eliminan de la matriz todas las columnas correspondientes a las variables artificiales $a_i$.
  * Se reincorpora la función objetivo original $Z$.
  * Se ajusta la fila $Z$ para que las variables básicas actuales tengan coeficiente cero mediante eliminación de Gauss-Jordan.
  * Se itera con Simplex ordinario hasta alcanzar el óptimo global $Z^*$.

---

### 3.5. Aritmética de Fracciones Exactas sin Pérdida Decimal
Implementada en [`src/core/math/fraction.ts`](file:///home/alexs/Projects/Solver/src/core/math/fraction.ts). Todo número se almacena como un par de enteros gigantes `(n: bigint, d: bigint)`.
* **Algoritmo de Euclides para el Máximo Común Divisor (MCD):**
  $$\gcd(a, b) = \begin{cases} a & \text{si } b = 0 \\ \gcd(b, a \pmod b) & \text{en otro caso} \end{cases}$$
* **Aritmética Racional Canónica:**
  $$\frac{a}{b} + \frac{c}{d} = \frac{a \cdot d + b \cdot c}{b \cdot d}, \quad \frac{a}{b} \cdot \frac{c}{d} = \frac{a \cdot c}{b \cdot d}, \quad \frac{a}{b} \div \frac{c}{d} = \frac{a \cdot d}{b \cdot c}$$
* **Resultado:** Las matrices del Simplex muestran valores exactos como $\frac{1}{3}$, $\frac{2}{5}$ o $\frac{17}{5}$ en vez de decimales truncados o imprecisos.

---

### 3.6. Teoría de Dualidad y Lectura de Precios Sombra (Shadow Prices)
Todo problema de Programación Lineal (denominado **Problema Primal**) posee un problema simétrico asociado denominado **Problema Dual**. Ambos comparten la misma información tecnológica y económica, pero desde perspectivas complementarias:

| Dimensión | Problema Primal (Asignación) | Problema Dual (Valoración de Recursos) |
| :--- | :--- | :--- |
| **Variables** | $x_j$ (cantidades físicas a producir) | $y_i$ (precios sombra o valor marginal de los recursos) |
| **Función Objetivo** | $\text{Max } Z = \mathbf{c}^T \mathbf{x}$ | $\text{Min } W = \mathbf{b}^T \mathbf{y}$ |
| **Restricciones** | $\mathbf{A}\mathbf{x} \le \mathbf{b}$ (disponibilidad de recursos) | $\mathbf{A}^T \mathbf{y} \ge \mathbf{c}$ (costos imputados $\ge$ utilidades) |
| **Relación Óptima** | **Teorema Fuerte de Dualidad:** Si el primal tiene solución óptima finita $Z^*$, el dual también la tiene y $Z^* = W^*$. |

#### 1. ¿Cómo se leen los Precios Sombra directamente de la Tabla Simplex Final?
En un problema estándar de maximización, **los precios sombra de los recursos ($y_i^*$) se leen directamente en la Fila $Z$ de la tabla óptima final**, ubicados exactamente debajo de las columnas de las **variables de holgura ($s_i$)**:
$$y_i^* = z_{s_i}^{\text{coef}} \quad (\text{Coeficiente de la holgura } s_i \text{ en la Fila } Z \text{ final})$$

#### 2. Interpretación Económica y Gerencial
El precio sombra $y_i^*$ cuantifica la **tasa marginal de cambio en la función objetivo por cada unidad adicional disponible del recurso $i$**:
$$y_i^* = \frac{\partial Z^*}{\partial b_i}$$
* Si el recurso de carpintería tiene un precio sombra $y_1^* = 1.5$ USD/hora, disponer de 1 hora adicional de carpintería en el taller incrementará la ganancia óptima global en exactamente $1.5$ USD.
* **Toma de Decisiones:** La empresa sabe exactamente cuál es el precio máximo que estaría dispuesta a pagar por adquirir horas extras o materia prima adicional en el mercado.

#### 3. Teorema de Holgura Complementaria (*Complementary Slackness*)
El vínculo matemático entre el Primal y el Dual establece que en el punto óptimo:
$$y_i^* \cdot s_i^* = 0, \quad \forall i = 1, \dots, m$$
* **Si un recurso sobra ($s_i^* > 0$, holgura positiva):** Su precio sombra es obligatoriamente cero ($y_i^* = 0$). Un recurso del que ya sobra inventario no aporta ningún beneficio marginal si se compra más cantidad.
* **Si el precio sombra es positivo ($y_i^* > 0$):** La restricción es un **cuello de botella activo** y el recurso se encuentra totalmente saturado y agotado ($s_i^* = 0$).

---

### 3.7. Modelos de Transporte, Redes de Distribución y Casos Especiales

El **Problema de Transporte** es una clase especializada de Programación Lineal y modelos de redes que aborda la distribución física y logística óptima de bienes homogéneos desde $m$ fuentes u orígenes (fábricas, almacenes, plantas) hacia $n$ destinos o sumideros (tiendas, clientes, depósitos).

#### 3.7.1. Formulación Canónica y Propiedad de Unimodularidad Total
El modelo algebraico formal se define como:
$$\min Z = \sum_{i=1}^m \sum_{j=1}^n c_{ij} x_{ij}$$
Sujeto a:
$$\sum_{j=1}^n x_{ij} = S_i, \quad \forall i = 1, \dots, m \quad (\text{Restricciones de Oferta})$$
$$\sum_{i=1}^m x_{ij} = D_j, \quad \forall j = 1, \dots, n \quad (\text{Restricciones de Demanda})$$
$$x_{ij} \ge 0, \quad \forall i, j$$

Donde:
* $x_{ij}$: Cantidad física de unidades transportadas desde el origen $i$ hacia el destino $j$.
* $c_{ij}$: Costo unitario de transporte asociado a la ruta $(i, j)$.
* $S_i$: Capacidad o existencia disponible en el origen $i$.
* $D_j$: Requerimiento o demanda obligatoria del destino $j$.

> [!IMPORTANT]
> **Teorema de Unimodularidad Total:** La matriz de coeficientes tecnológicos de un problema de transporte estándar es totalmente unimodular (el determinante de cualquier submatriz cuadrada invertible es $\pm 1$ o $0$). Por lo tanto, si las ofertas $S_i$ y las demandas $D_j$ son números enteros, **toda solución básica factible generada por el algoritmo será estrictamente un número entero**, sin necesidad de imponer algoritmos de programación entera como Branch & Bound.

---

#### 3.7.2. Métodos de Solución Básica Factible Inicial (SBFI)

El sistema integra los tres algoritmos clásicos de la literatura para obtener la primera asignación factible en la matriz $m \times n$:

1. **Regla de la Esquina Noroeste:**
   * Inicia en la celda $(1, 1)$ superior izquierda.
   * Asigna $x_{11} = \min(S_1, D_1)$.
   * Se ajusta la oferta y demanda restante. Si la oferta se agota ($S_1 = 0$), se desplaza hacia abajo a la fila siguiente. Si la demanda se satisface ($D_1 = 0$), se desplaza hacia la derecha a la siguiente columna.
   * *Ventaja:* Computacionalmente trivial y directo.
   * *Desventaja:* Es completamente ciego respecto a los costos de transporte $c_{ij}$, por lo que suele producir un costo total $Z$ inicial elevado.

2. **Método del Costo Mínimo (Matriz de Costos):**
   * Busca en toda la matriz la celda disponible con el menor costo unitario de transporte $c_{ij}$.
   * Asigna la máxima cantidad posible $x_{ij} = \min(S_i, D_j)$.
   * Tacha la fila o columna saturada y repite el proceso sobre las celdas restantes.
   * *Ventaja:* Considera la economía del problema desde el primer paso, alcanzando una solución inicial de menor costo que la Esquina Noroeste.

3. **Método de Aproximación de Vogel (VAM):**
   * En cada iteración calcula para cada fila y columna activa una **penalización ($P$)**, definida como la diferencia absoluta entre los dos costos unitarios más pequeños:
     $$P_i = c_{i, \text{segundo menor}} - c_{i, \text{mínimo}}$$
   * Identifica la fila o columna con la **máxima penalización global** ($\max \{ P_i, P_j \}$). La intuición radica en que ignorar esa fila o columna causaría el mayor sobrecosto forzado en pasos futuros.
   * En la línea seleccionada, asigna la máxima cantidad en la celda con el menor costo unitario.
   * *Ventaja:* Es el método heurístico más avanzado de la literatura, proporcionando con frecuencia la solución óptima directa o una solución a solo 1 o 2 iteraciones del óptimo global.

---

#### 3.7.3. Optimización con el Método MODI y Ciclos del Cruce del Arroyo

Una vez hallada una SBFI, se requiere verificar si es posible reducir aún más el costo total de distribución mediante la prueba de optimalidad de los multiplicadores:

1. **Ecuaciones de Multiplicadores MODI ($u_i, v_j$):**
   Para cada **celda básica** activa $(i, j) \in \text{Base}$:
   $$u_i + v_j = c_{ij}$$
   Existen $m + n - 1$ ecuaciones y $m + n$ incógnitas. Se fija arbitrariamente $u_1 = 0$ (o la fila con mayor número de asignaciones) y se despeja el resto mediante propagación de componentes conexas.

2. **Evaluación de Celdas No Básicas (Costos de Oportunidad):**
   Para cada celda vacía o no básica $(i, j) \notin \text{Base}$, se calcula su índice de mejora marginal $\Delta_{ij}$:
   $$\Delta_{ij} = u_i + v_j - c_{ij} \quad (\text{o en términos de costo reducido: } \bar{c}_{ij} = c_{ij} - u_i - v_j)$$
   * **Criterio de Optimalidad:** Si $\forall (i, j) \notin \text{Base}, \ \Delta_{ij} \le 0$ (o $c_{ij} - u_i - v_j \ge 0$), la solución actual es **ÓPTIMA**.
   * **Criterio de Entrada:** Si existe algún $\Delta_{ij} > 0$, la variable con mayor valor positivo entra a la base para reducir el costo del sistema.

3. **Ciclo Cerrado de Reasignación (Cruce del Arroyo / Stepping Stone):**
   * Se traza un polígono cerrado único que parte de la celda entrante y tiene todos sus vértices de giro situados exclusivamente en celdas básicas.
   * Se asignan signos alternantes: $+$ en la celda entrante, $-$ en la siguiente básica, $+$ en la posterior, y así sucesivamente.
   * Se determina el flujo transferible $\theta$:
     $$\theta = \min \{ x_{ij} \mid \text{celdas del ciclo con signo } - \}$$
   * Se suma $\theta$ a las celdas con signo $+$ y se resta $\theta$ a las celdas con signo $-$. La celda con signo $-$ que llega a cero abandona la base.

---

#### 3.7.4. Diagnóstico y Gestión Automática de Casos Especiales en Transporte

El módulo de transporte de `Solver IO` incorpora un evaluador reactivo que detecta y notifica en pantalla la activación de los 4 casos especiales clásicos:

| Caso Especial de Transporte | Condición Matemática de Activación | Gestión Algorítmica y Notificación en Interfaz |
| :--- | :--- | :--- |
| **Problema Desbalanceado (Oferta > Demanda)** | $\sum_{i=1}^m S_i > \sum_{j=1}^n D_j$ | Se incorpora un **Destino Ficticio** con demanda $D_{\text{ficticio}} = \sum S_i - \sum D_j$ y costos $c_{i, \text{ficticio}} = 0$. Representa inventario sobrante no despachado. |
| **Problema Desbalanceado (Demanda > Oferta)** | $\sum_{j=1}^n D_j > \sum_{i=1}^m S_i$ | Se crea un **Origen Ficticio** con capacidad $S_{\text{ficticio}} = \sum D_j - \sum S_i$ y costos $0$. Representa demanda insatisfecha o faltante. |
| **Solución Degenerada** | $\text{Celdas Básicas} < m + n - 1$ | Ocurre cuando una asignación satisface en paralelo la oferta de una fila y la demanda de una columna. El solver **asigna automáticamente un valor infinitesimal $\varepsilon = 0$** en una celda independiente para completar el árbol generador y permitir calcular los multiplicadores $u_i, v_j$. |
| **Soluciones Óptimas Múltiples** | $\exists (i, j) \notin \text{Base} \mid \Delta_{ij} = 0$ | Al completarse la prueba de optimalidad MODI, una celda no básica tiene costo marginal 0. El solver alerta que el flujo puede redistribuirse por esa ruta alternativa manteniendo el mismo costo total $Z^*$. |
| **Rutas Prohibidas / Restringidas** | La ruta $(i, j)$ está inhabilitada | Se le asigna una penalización de costo astronómica **Gran M ($M \to +\infty$)**, garantizando que el algoritmo asigne $x_{ij} = 0$ en el óptimo. |

---

## 4. Diagnóstico Exhaustivo de Casos de Paro y Comportamientos Especiales

El motor de `Solver IO` incorpora un evaluador heurístico y algebraico que analiza el estado del tableau en cada paso de iteración para clasificar formalmente la solución alcanzada en una de las categorías estándar de la Programación Lineal.

### 4.1. Diagrama de Flujo del Árbol de Decisión de Paro

```
                    [ Examen de la Fila Z (Renglón 0) ]
                                     |
               ¿Existe candidato para entrar a la base?
               (En Max: Coeficiente < 0 | En Min: Coeficiente > 0)
                                     |
              ------------------------------------------------
             |                                                |
            NO                                               SÍ
             |                                                |
[ ¿Condición de Optimalidad? ]                      Variable Entrante $x_k$
             |                                                |
  ¿Hay variables artificiales en la base             [ Examen de la Columna Pivote ]
       con valor estricto b_i > 0?                            |
             |                                      ¿Todos los elementos $a_{ik} \le 0$?
      -----------------                                       |
     |                 |                             -------------------
    SÍ                NO                            |                   |
     |                 |                           SÍ                  NO
[ INFACTIBLE ]  ¿Alguna variable no básica          |                   |
(Sin solución)   tiene coeficiente = 0 en Z?  [ NO ACOTADO ]      Se calcula la razón
                       |                      (Z -> +/- inf)     mínima $\theta = b_i/a_{ik}$
                ---------------                                         |
               |               |                                  ¿Empate en $\theta$?
              SÍ              NO                                        |
               |               |                                 -----------------
          [ ÓPTIMOS         [ ÓPTIMO                            |                 |
          MÚLTIPLES ]        ÚNICO ]                           SÍ                NO
         (Infinitas)                                            |                 |
                                                           [ DEGENERADA ]    Pivoteo ordinario
                                                           Regla de Bland    hacia siguiente paso
```

---

### 4.2. Caso 1: Solución Óptima Única
* **Criterio Algebraico de Paro:** En la Fila $Z$ (forma canónica de ecuación $Z - \sum c_j x_j = 0$):
  * **Maximización:** $\forall j, \ z_j^{\text{coef}} \ge 0$ (ningún coeficiente es estrictamente negativo).
  * **Minimización:** $\forall j, \ z_j^{\text{coef}} \le 0$ (ningún coeficiente es estrictamente positivo).
* **Condición de Unicidad:** Todas las variables no básicas ($x_j \notin \text{Base}$) tienen costos reducidos estrictamente mayores a cero en Max ($> 0$) o menores a cero en Min ($< 0$).
* **Condición de Factibilidad:** Ninguna variable artificial ($a_i$) permanece en la base con valor mayor a cero.
* **Interpretación Geométrica (2D):** El hiperplano de la función objetivo hace contacto tangencial con la región factible en un único vértice extremo. Cualquier desplazamiento de la recta disminuye la ganancia o viola las restricciones.

---

### 4.3. Caso 2: Soluciones Óptimas Múltiples (Infinitas Soluciones)
* **Criterio Algebraico de Paro:**
  1. Se cumple la condición de optimalidad del Caso 1 (todos los coeficientes cumplen el signo de paro).
  2. **Existe al menos una variable NO BÁSICA ($x_k \notin \text{Base}$) cuyo coeficiente en la Fila $Z$ es exactamente CERO ($z_k^{\text{coef}} = 0$).**
* **Mecanismo Matemático:**
  * Dado que su costo reducido es nulo, introducir $x_k$ a la base mediante un paso adicional de pivoteo **no alterará el valor óptimo de $Z$** ($\Delta Z = 0 \cdot \theta = 0$), pero conducirá a un nuevo vector de variables básicas $\mathbf{x}_B'$ (un segundo vértice óptimo).
  * Cualquier combinación convexa de ambos vértices es también una solución factible con el mismo valor óptimo:
    $$\mathbf{x}^*(\alpha) = \alpha \mathbf{x}^{(1)} + (1-\alpha) \mathbf{x}^{(2)}, \quad \forall \alpha \in [0, 1]$$
* **Interpretación Geométrica (2D):** La pendiente de la recta de la función objetivo coincide de forma idéntica con la pendiente de una de las restricciones activas en la frontera. La solución óptima no es un punto solitario, sino todo el segmento de recta que une dos vértices contiguos.

---

### 4.4. Caso 3: Problema No Acotado (*Unbounded*)
* **Criterio Algebraico de Paro:**
  1. Existe una variable entrante candidata $x_k$ con gradiente favorable (coeficiente $< 0$ en Max o $> 0$ en Min).
  2. Al evaluar la columna pivote correspondiente:
     $$\forall i \in \{1, \dots, m\}, \quad a_{ik} \le 0$$
* **Demostración de Imposibilidad de Salida:**
  * La prueba de la razón mínima $\theta = \min \{ b_i / a_{ik} \mid a_{ik} > 0 \}$ no puede calcularse porque no existe ningún denominador estrictamente positivo.
  * Ninguna restricción impone un límite superior al crecimiento de la variable entrante. Por ende, $x_k$ puede incrementarse arbitrariamente hacia $+\infty$ sin forzar a ninguna variable básica a volverse negativa:
    $$x_k \to +\infty \implies Z \to +\infty \quad (\text{en Max})$$
* **Interpretación Geométrica (2D):** El poliedro de la región factible está abierto infinitamente en una dirección no acotada (es un poliedro no compacto o conoide), y el vector gradiente $\nabla Z$ apunta hacia el infinito dentro de esa apertura.

---

### 4.5. Caso 4: Problema Infactible (Sin Región Factible)
Ocurre cuando el sistema de desigualdades e igualdades es mutuamente contradictorio, haciendo que el conjunto de soluciones factibles sea estrictamente el conjunto vacío ($\mathcal{F} = \emptyset$).

#### 1. ¿Por qué el Simplex Estándar NUNCA es Infactible?
En el **Simplex Estándar puro** (restricciones $\le$ con $b_i \ge 0$):
* La solución inicial consiste en fijar todas las variables de decisión en cero ($x_j = 0$) y asignar a las variables de holgura el valor de los términos independientes ($s_i = b_i \ge 0$).
* Como todos los $b_i \ge 0$, el origen $\mathbf{x} = \mathbf{0}$ **siempre es una Solución Básica Factible (SBF)** garantizada. Por axioma estructural, el Simplex Estándar jamás puede arrojar infactibilidad.

#### 2. Detección en el Método de la Gran M:
* El algoritmo realiza iteraciones normales hasta que la Fila $Z$ satisface la condición de optimalidad (no quedan coeficientes de mejora).
* **Condición de Infactibilidad:** Al detenerse, **al menos una variable artificial ($a_i$) permanece dentro de la base con valor estrictamente positivo ($b_i > 0$)**.
* *Justificación:* Al tener un coeficiente de penalización $-M$ de magnitud infinita, si el algoritmo no pudo expulsar a la variable artificial de la base a pesar de agotar todos los pivoteos posibles, significa que es matemáticamente imposible satisfacer las restricciones originales sin recurrir a la variable artificial.

#### 3. Detección en el Método de Dos Fases:
* Durante la **Fase 1**, el problema auxiliar minimiza la suma de artificiales: $\min W = \sum a_i$.
* Al alcanzarse la condición de optimalidad de la Fase 1:
  * **Si $W^* = 0$:** Existe al menos una solución básica factible para el problema original. Se eliminan las columnas artificiales y se prosigue con la Fase 2.
  * **Si $W^* > 0$:** El problema es **estrictamente infactible**. Como el valor mínimo absoluto que puede alcanzar la suma de variables artificiales es positivo, es imposible satisfacer simultáneamente las restricciones originales. El software interrumpe la ejecución e informa infactibilidad sin pasar a la Fase 2.

---

### 4.6. Caso 5: Degeneración y Prevención de Ciclos con la Regla de Bland
* **Definición de Degeneración:** Una solución básica factible es degenerada si al menos una de las variables básicas tiene un valor igual a cero ($x_{B_i} = 0$).
* **Origen Algebraico:** Ocurre cuando se produce un **empate en la razón mínima**:
  $$\theta_r = \theta_s = \min_{i} \left\{ \frac{b_i}{a_{ik}} \right\}$$
  Ambas filas $r$ y $s$ alcanzan el mismo cociente. Una de ellas saldrá de la base, pero la otra permanecerá en la base y su nuevo valor en el RHS será exactamente cero ($b_s' = 0$).
* **Efecto en el Pivoteo:** En la iteración subsiguiente, el incremento de la función objetivo es nulo:
  $$\Delta Z = z_k \cdot \theta = z_k \cdot 0 = 0$$
  El algoritmo pivotea algebraicamente cambiando de base, pero geométricamente **permanece en el mismo vértice físico**.
* **El Peligro del Ciclaje Infinito:** Si se pivotea sucesivamente a través de varias bases degeneradas, existe la posibilidad teórica de volver a una base previamente visitada, entrando en un bucle infinito que nunca terminaría.
* **Implementación de la Regla de Bland en `Solver IO`:**
  Para prevenir de forma matemáticamente garantizada cualquier posibilidad de ciclo, el motor implementa la **Regla de Bland (Subíndice Mínimo)**:
  1. **Variable Entrante:** Si varias variables no básicas empatan en el coeficiente más prometedor de la Fila $Z$, se selecciona aquella con el subíndice natural más bajo ($x_1$ sobre $x_2$).
  2. **Variable Saliente:** Si varias filas básicas empatan en el cociente mínimo $\theta$, se selecciona aquella cuya variable básica tenga el subíndice más bajo.
  *Teorema de Bland:* Con esta regla, el Método Simplex converge hacia el óptimo en un número finito de pasos sin ciclar jamás.

---

### 4.7. Tabla Resumen de Diagnósticos del Motor

| Diagnóstico del Modelo | Señal en la Fila $Z$ | Señal en Restricciones / Columna Pivote | Variables Artificiales |
| :--- | :--- | :--- | :--- |
| **Óptimo Único** | Todos $\ge 0$ (Max) o $\le 0$ (Min) | VNB tienen coeficientes estrictamente $\ne 0$ | Ninguna en la base con $b_i > 0$ |
| **Óptimos Múltiples** | Todos cumplen optimalidad | Al menos una variable No Básica tiene coeficiente $= 0$ | Ninguna en la base con $b_i > 0$ |
| **No Acotado (Unbounded)** | Hay variable entrante válida | Todos los elementos de la columna pivote son $\le 0$ | No aplica |
| **Infactible (Gran M)** | Fila $Z$ óptima | No hay candidatos válidos | Al menos una variable $a_i \in \text{Base}$ con $b_i > 0$ |
| **Infactible (Dos Fases)** | Fase 1 óptima finalizada | No hay candidatos válidos en Fase 1 | Valor óptimo auxiliar $W^* > 0$ |
| **Degeneración** | Iterando normalmente | Empate en el cociente mínimo $\theta$ o algún $b_i = 0$ | No altera factibilidad |

---

## 5. Arquitectura del Sistema, Diseño Visual y Patrones de Software

El sistema está construido bajo principios de **Clean Architecture**, asegurando que la lógica matemática del núcleo sea $100\%$ agnóstica de la interfaz gráfica y desacoplada del framework visual.

### 5.1. Patrón MVC (Modelo - Vista - Controlador)

```
        +-------------------------------------------------------------+
        |                     USUARIO / BROWSER                       |
        +-------------------------------------------------------------+
                                       |
                   Interacción: Teclado, Sliders, Clics
                                       v
        +-------------------------------------------------------------+
        |                 CONTROLADOR (Controller)                    |
        |  - src/App.tsx (Orquestador de Estado Reactivo)              |
        |  - src/core/parser/lpParser.ts (Validador y Normalizador)    |
        |  - src/core/simplex/simplexSolver.ts (Despachador Simplex)  |
        |  - src/core/graphic/graphicSolver.ts (Coordinador 2D)        |
        +-------------------------------------------------------------+
                   /                                   \
        Pide Parseo / Cálculo              Envía Datos Inmutables
                 v                                       v
+-------------------------------+       +-------------------------------+
|        MODELO (Model)         |       |         VISTA (View)          |
|  - Fraction (Aritmética a/b)  |       |  - Header (macOS Chrome)      |
|  - BigMValue (Álgebra Dual)   |       |  - MethodSelector (Segmented) |
|  - LPModel / LPConstraint     |       |  - SimplexTableau (Renglón 0) |
|  - SimplexTableau / Result    |       |  - GraphicCanvas (HTML5 2D)   |
|  - GraphicSolution / Vertices |       |  - SimplexStepCard (Pasos)    |
|  - StepByStep Deductions      |       |  - LatexMath (KaTeX Fórmulas) |
+-------------------------------+       +-------------------------------+
```

* **MODELO (`src/core/`):** Almacena las entidades y la lógica matemática pura. No tiene código HTML, CSS ni React. Puede ser ejecutado en entornos headless o Node.js.
* **VISTA (`src/components/`):** Componentes reactivos que renderizan tablas, canvas interactivo y fórmulas tipográficas KaTeX con estética de vidrio esmerilado.
* **CONTROLADOR (`src/App.tsx` y Solvers Hub):** Captura las acciones del usuario, invoca el parser y los algoritmos, y actualiza el estado reactivo.

### 5.2. Patrones de Diseño GoF (Gang of Four)

1. **Patrón Estrategia (Strategy Pattern):**
   * *Dónde:* [`MethodSelector.tsx`](file:///home/alexs/Projects/Solver/src/components/MethodSelector.tsx) y [`simplexSolver.ts`](file:///home/alexs/Projects/Solver/src/core/simplex/simplexSolver.ts).
   * *Beneficio:* Permite intercambiar en tiempo de ejecución la familia de algoritmos: Método Gráfico vs Simplex Estándar vs Gran M vs Dos Fases, sin alterar la estructura del resto del programa.
2. **Patrón Objeto de Valor (Value Object Pattern):**
   * *Dónde:* [`fraction.ts`](file:///home/alexs/Projects/Solver/src/core/math/fraction.ts) y [`bigM.ts`](file:///home/alexs/Projects/Solver/src/core/math/bigM.ts).
   * *Beneficio:* Objetos inmutables. Dos fracciones con el mismo valor son idénticas por contenido. Toda operación genera una instancia nueva, eliminando errores por efectos secundarios y mutabilidad accidental.
3. **Patrón Fachada (Facade Pattern):**
   * *Dónde:* `SimplexSolver.solve()` y `GraphicSolver.solve()`.
   * *Beneficio:* Esconden la compleja maquinaria interna (cálculo de holguras, normalización de signos, inversión matricial, pivoteos sucesivos) detrás de una llamada simple de una sola línea.
4. **Patrón Intérprete / Parser (Interpreter Pattern):**
   * *Dónde:* [`lpParser.ts`](file:///home/alexs/Projects/Solver/src/core/parser/lpParser.ts).
   * *Beneficio:* Analiza cadenas de texto en formato algebraico natural libre (ej. `Max Z = 3x1 + 5x2 \n s.a. \n x1 <= 4`) y genera el modelo formal de objetos tipados.
5. **Patrón Observador y Reactividad (Observer Pattern):**
   * *Dónde:* Hooks de React (`useState`, `useMemo`, `useEffect`).
   * *Beneficio:* La interfaz reacciona instantáneamente cuando el usuario escribe una restricción o arrastra el deslizador de la función objetivo a 60 fotogramas por segundo.

### 5.3. Sistema de Diseño Visual e Interfaz de Usuario Estilo macOS (Sonoma / Sequoia)

La interfaz de `Solver IO` fue rediseñada para ofrecer una experiencia de usuario de nivel profesional inspirada en el lenguaje visual de **macOS**: minimalista, sutil, con efecto vidrio esmerilado (*frosted glass / Mica*), bordes finos de alta fidelidad (*hairline borders*) y una paleta cromática desaturada y de bajo cansancio visual.

1. **Fondo Carbón Ambiental (`--macos-bg: #0d0e12`):**
   * Se sustituyeron los negros absolutos o fondos planos por un tono carbón profundo con gradientes radiales sutiles (`.macos-ambient`), creando una sensación de profundidad espacial.
2. **Paneles de Cristal Esmerilado (*Frosted Glass / Mica*):**
   * Implementados mediante clases `.macos-panel` y `.macos-panel-subtle` con `backdrop-filter: blur(20px)` y fondos translúcidos `rgba(24, 25, 30, 0.70)`.
3. **Bordes Finos y Reflejos Interiores (*Hairline Borders & Highlights*):**
   * Bordes de 1 píxel al 8% de opacidad (`border-white/[0.08]`) combinados con sutiles luces cenitales interiores `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]`, emulando el biselado de las ventanas de Apple.
4. **Barra de Título con Semáforos de Ventana (*Traffic Lights*):**
   * [`Header.tsx`](file:///home/alexs/Projects/Solver/src/components/Header.tsx) incorpora los tres botones icónicos de macOS con sus códigos de color exactos: Rojo Cerrar (`#ff5f56`), Amarillo Minimizar (`#febc2e`) y Verde Pantalla Completa (`#27c93f`), con micro-bordes oscuros integrados.
5. **Controles Segmentados (*Segmented Controls*):**
   * [`MethodSelector.tsx`](file:///home/alexs/Projects/Solver/src/components/MethodSelector.tsx) utiliza conmutadores tipo píldora (*squircle pills*) con elevación suave y transición fluida para alternar entre el Método Gráfico y Simplex, así como chips sutiles para variantes de Dos Fases o Gran M.
6. **Modal Estilo Hoja Emergente (*macOS Sheet*):**
   * [`PresetsModal.tsx`](file:///home/alexs/Projects/Solver/src/components/PresetsModal.tsx) presenta el catálogo de problemas como una hoja modal de macOS que desciende suavemente sobre un fondo desenfocado (*backdrop blur*).
7. **Lienzo Gráfico 2D con Controles Flotantes y Slider de Nivel $Z$:**
   * Botones de zoom, paneo y reinicio dispuestos en una píldora flotante translúcida en la esquina superior del canvas.
   * Deslizador de precisión para trasladar interactivamente la recta de la función objetivo sobre los vértices factibles.
8. **Tipografía y Renderizado Matemático KaTeX:**
   * Fórmulas vectoriales nítidas mediante KaTeX sin fluctuaciones de diseño (*layout shift*).
9. **Modo de Impresión Académica Impecable (`@media print`):**
   * Transforma automáticamente la interfaz a un formato sobre fondo blanco puro, ocultando controles de navegación interactivos y asegurando tablas nítidas para entrega de tareas y reportes universitarios.

### 5.4. Pipeline de Parseo, Normalización y Flujo de Datos End-to-End

El ciclo completo de procesamiento desde la entrada del usuario hasta la renderización de la solución óptima sigue una secuencia rigurosa:

```
[ Texto del Usuario / Constructor Visual ]
                   |
                   v
[ lpParser.ts: Tokenización y Detección de Objetivo ]
  - Extrae si es 'Max' o 'Min' y el vector de costos c_j.
  - Detecta automáticamente el número de variables de decisión.
                   |
                   v
[ Normalización de Restricciones (Lados Derechos b_i) ]
  - Si b_i < 0: multiplica toda la inecuación por -1 e invierte el operador (<= pasa a >=).
  - Asegura axiomáticamente que todo b_i >= 0.
                   |
                   v
[ Despachador de Estrategia (simplexSolver.ts / graphicSolver.ts) ]
  - Si variables = 2 y el usuario eligió 'Gráfico' -> Invoca graphicSolver.ts.
  - Si el usuario eligió 'Simplex':
      * Restricciones <= puras -> Simplex Estándar.
      * Restricciones >= o = -> Gran M o Dos Fases (según preferencia o auto-detección).
                   |
                   v
[ Ejecución del Algoritmo con Aritmética Exacta BigInt / BigMValue ]
  - Generación de matrices intermedias de Gauss-Jordan.
  - Registro de explicaciones paso a paso, cocientes theta y elementos pivote.
                   |
                   v
[ Diagnóstico de Estado Final ]
  - Clasifica en: optimal, alternative_optima, unbounded o infeasible.
                   |
                   v
[ Renderizado Reactivo en Pantalla ]
  - SimplexSolutionView / SimplexTableau (con Fila Z en Renglón 0).
  - GraphicCanvas con polígono convexo sombreado y tabla de coordenadas.
```

#### Especificación Formal de Sintaxis Soportada por el Parser (`LPParser`)
El analizador sintáctico [`lpParser.ts`](file:///home/alexs/Projects/Solver/src/core/parser/lpParser.ts) cuenta con tolerancia a variaciones comunes de escritura para facilitar el uso a estudiantes y profesionales:

1. **Función Objetivo:**
   * Admite prefijos en español e inglés: `Max`, `Min`, `Maximizar`, `Minimizar`, `max Z =`, `min Z =`, `Z =`.
   * Ejemplo: `Max Z = 3x1 + 5x2 - 1/2 x3`.
2. **Nombres de Variables:**
   * Letras con índices numéricos: `x1, x2, x3, ...`
   * Letras individuales clásicas: `x, y, z, w, a, b`.
   * Caracteres alfanuméricos con guion bajo: `x_1, y_2`.
3. **Formatos de Coeficientes:**
   * Enteros: `3x1`, `-5x2`.
   * Coeficientes implícitos: `+x1` (equivale a `+1`), `-x2` (equivale a `-1`).
   * Decimales: `2.5x1`, `0.75x2`.
   * Fracciones exactas: `3/4 x1`, `-17/5 x2`.
4. **Operadores de Restricción:**
   * Desigualdad menor o igual: `<=`, `<`.
   * Desigualdad mayor o igual: `>=`, `>`.
   * Igualdad estricta: `=`.
5. **Transposición Automática de Términos:**
   * El usuario puede escribir variables y constantes a ambos lados del signo: `3x1 + 10 <= x2 + 50`.
   * El parser calcula automáticamente los términos netos: $(3)x_1 + (-1)x_2 \le 50 - 10 \implies 3x_1 - x_2 \le 40$.
6. **Normalización de Lados Derechos Negativos ($b_i < 0$):**
   * Si el usuario ingresa $2x_1 - 3x_2 \le -10$, el sistema multiplica automáticamente por $-1$ e invierte el operador, convirtiéndola en $-2x_1 + 3x_2 \ge 10$, asegurando que los términos independientes sean siempre positivos para el Simplex.
7. **Líneas Omitidas o Informativas:**
   * Las líneas de no negatividad (`x1, x2 >= 0` o `x, y >= 0`) son reconocidas y validadas sin introducirlas como filas innecesarias a la matriz del tableau.
   * Se ignoran comentarios que inicien con `//` o `#`, así como cabeceras decorativas como `s.a.`, `sujeto a:` o `s.t.`.

---

## 6. Estructura y Desglose Modular del Código Fuente

A continuación se detalla la función técnica de cada archivo del proyecto:

* [`src/core/math/fraction.ts`](file:///home/alexs/Projects/Solver/src/core/math/fraction.ts): Clase `Fraction` que maneja aritmética exacta con `BigInt`, simplificación mediante el algoritmo de Euclides, parseo decimal y salida formateada para KaTeX.
* [`src/core/math/bigM.ts`](file:///home/alexs/Projects/Solver/src/core/math/bigM.ts): Clase `BigMValue` para álgebra simbólica $c + m \cdot M$, comparaciones lexicográficas y sumas ponderadas.
* [`src/core/parser/lpTypes.ts`](file:///home/alexs/Projects/Solver/src/core/parser/lpTypes.ts): Definiciones TypeScript para el modelo de optimización lineal (`LPModel`, `LPConstraint`, `ObjectiveType`).
* [`src/core/parser/lpParser.ts`](file:///home/alexs/Projects/Solver/src/core/parser/lpParser.ts): Parser sintáctico con expresiones regulares que lee texto algebraico y normaliza restricciones ($b_i \ge 0$).
* [`src/core/simplex/simplexTypes.ts`](file:///home/alexs/Projects/Solver/src/core/simplex/simplexTypes.ts): Tipos de matrices, filas, pasos de Gauss-Jordan y diagnóstico de soluciones.
* [`src/core/simplex/bigMSimplex.ts`](file:///home/alexs/Projects/Solver/src/core/simplex/bigMSimplex.ts): Motor de Simplex Estándar y Método de la Gran M con registro paso a paso de cada operación de fila.
* [`src/core/simplex/twoPhaseSimplex.ts`](file:///home/alexs/Projects/Solver/src/core/simplex/twoPhaseSimplex.ts): Motor del Método de Dos Fases que orquesta la minimización auxiliar de artificiales en Fase 1 y la optimización en Fase 2.
* [`src/core/simplex/simplexSolver.ts`](file:///home/alexs/Projects/Solver/src/core/simplex/simplexSolver.ts): Despachador y fachada central de los métodos Simplex.
* [`src/core/graphic/graphicTypes.ts`](file:///home/alexs/Projects/Solver/src/core/graphic/graphicTypes.ts): Estructuras de datos para el plano cartesiano 2D, rectas y polígonos convexos.
* [`src/core/graphic/graphicSolver.ts`](file:///home/alexs/Projects/Solver/src/core/graphic/graphicSolver.ts): Motor de resolución gráfica 2D con Regla de Cramer, ordenamiento polar convexo y generación de los 5 pasos analíticos.
* [`src/core/presets.ts`](file:///home/alexs/Projects/Solver/src/core/presets.ts): Catálogo con 7 problemas clásicos emblemáticos listos para ser resueltos en demostraciones interactivas.
* [`src/index.css`](file:///home/alexs/Projects/Solver/src/index.css): Tokens de diseño visual macOS, fondo carbón ambiental `.macos-ambient`, paneles de cristal esmerilado `.macos-panel` y `.macos-panel-subtle`, scrollbars discretos y reglas de impresión `@media print`.
* [`src/components/Header.tsx`](file:///home/alexs/Projects/Solver/src/components/Header.tsx): Barra de título inspirada en la ventana de macOS con semáforos activos (*traffic lights* `#ff5f56`, `#febc2e`, `#27c93f`), badges translúcidos y botones tipo píldora para presets y exportación a PDF.
* [`src/components/MethodSelector.tsx`](file:///home/alexs/Projects/Solver/src/components/MethodSelector.tsx): Selector segmentado estilo Apple (*Segmented Control*) con animación fluida para alternar entre Método Gráfico y Simplex, además de chips sutiles para variantes algorítmicas (Gran M vs Dos Fases).
* [`src/components/ProblemInput.tsx`](file:///home/alexs/Projects/Solver/src/components/ProblemInput.tsx): Panel inspector con editor dual: entrada en texto libre algebraico o mediante constructor visual interactivo con campos de texto translúcidos.
* [`src/components/SimplexView/SimplexTableau.tsx`](file:///home/alexs/Projects/Solver/src/components/SimplexView/SimplexTableau.tsx): Renderizador de la matriz Simplex con la **Fila Objetivo ($Z$ o $W$) en la parte superior (Renglón 0)**, badge distintivo rosado, divisor de doble trazo y resaltado sincronizado de la columna pivote (azul), fila pivote (ámbar) y elemento pivote (dorado).
* [`src/components/SimplexView/SimplexStepCard.tsx`](file:///home/alexs/Projects/Solver/src/components/SimplexView/SimplexStepCard.tsx): Tarjeta de iteración estilo cristal esmerilado que expone el análisis del elemento pivote, las operaciones de fila de Gauss-Jordan y el desglose formal de Variables Básicas (VB = RHS) y Variables No Básicas (VNB = 0).
* [`src/components/SimplexView/SimplexSolutionView.tsx`](file:///home/alexs/Projects/Solver/src/components/SimplexView/SimplexSolutionView.tsx): Vista general de la solución óptima, controlador de reproducción de pasos multimedia y acordeón desplegable de iteraciones.
* [`src/components/GraphicView/GraphicCanvas.tsx`](file:///home/alexs/Projects/Solver/src/components/GraphicView/GraphicCanvas.tsx): Lienzo interactivo en `<canvas>` HTML5 con controles flotantes de zoom/paneo, sombreado de región factible convexa, vértices numerados y animación del deslizador de la función objetivo a 60 FPS.
* [`src/components/GraphicView/GraphicVerticesTable.tsx`](file:///home/alexs/Projects/Solver/src/components/GraphicView/GraphicVerticesTable.tsx): Tabla comparativa estilo Apple que evalúa la función objetivo en cada vértice e identifica el punto óptimo $Z^*$.
* [`src/components/GraphicView/GraphicStepsView.tsx`](file:///home/alexs/Projects/Solver/src/components/GraphicView/GraphicStepsView.tsx): Desglose didáctico de los 5 pasos analíticos del Método Gráfico con fórmulas en LaTeX.
* [`src/components/PresetsModal.tsx`](file:///home/alexs/Projects/Solver/src/components/PresetsModal.tsx): Modal tipo hoja emergente (*macOS Sheet*) con desenfoque de fondo (*backdrop blur*) para explorar los 7 casos clásicos de estudio.
* [`src/components/LatexMath.tsx`](file:///home/alexs/Projects/Solver/src/components/LatexMath.tsx): Componente envoltorio de alto rendimiento para renderizar fórmulas matemáticas vectoriales con KaTeX sin parpadeos.
* [`src/App.tsx`](file:///home/alexs/Projects/Solver/src/App.tsx): Orquestador principal y Controlador reactivo que administra el ciclo de vida, la sincronización de estado y la reactividad de la aplicación.

---

## 7. Catálogo de Casos de Estudio y Ejemplos Resueltos

### Caso 1: Producción y Maximización Estándar (2D)
```
Max Z = 3x1 + 5x2
s.a.
x1 <= 4
2x2 <= 12
3x1 + 2x2 <= 18
x1, x2 >= 0
```
* **Contexto:** Producción de mesas ($x_1$) y sillas ($x_2$). Restricciones puras de tipo $\le$ con holguras positivas inmediatas.
* **Solución Óptima:** $x_1^* = 2, \ x_2^* = 6$, con un Beneficio Máximo $Z^* = 36$.

### Caso 2: Problema de la Dieta (Minimización con Gran M y Dos Fases)
```
Min Z = 2x1 + 3x2
s.a.
x1 + x2 >= 5
x1 + 2x2 >= 6
x1, x2 >= 0
```
* **Contexto:** Minimización de costos de nutrientes con restricciones de ingesta mínima ($\ge$). Demuestra la inserción de variables de exceso y artificiales.
* **Solución Óptima:** $x_1^* = 4, \ x_2^* = 1$, con un Costo Mínimo $Z^* = 11$.

### Caso 3: Mezcla Química con Igualdad (Dos Fases)
```
Min Z = 4x1 + x2
s.a.
3x1 + x2 = 3
4x1 + 3x2 >= 6
x1 + 2x2 <= 4
x1, x2 >= 0
```
* **Contexto:** Modelo que combina simultáneamente $=$, $\ge$ y $\le$. Ideal para examinar la minimización de $W = a_1 + a_2$ en Fase 1 y la optimización de $Z$ en Fase 2.
* **Solución Óptima Exacta:** $x_1^* = \frac{2}{5}, \ x_2^* = \frac{9}{5}$, con Costo Mínimo $Z^* = \frac{17}{5} = 3.4$.

### Caso 4: Soluciones Óptimas Múltiples
```
Max Z = 2x1 + 4x2
s.a.
x1 + 2x2 <= 10
x1 + x2 <= 6
x1, x2 >= 0
```
* **Contexto:** La función objetivo tiene pendiente idéntica a la restricción $x_1 + 2x2 \le 10$.
* **Solución:** $Z^* = 20$ en los vértices $(2, 4)$ y $(0, 5)$, y en cualquier punto del segmento que los une.

### Caso 5: Problema Multivariable de 3 Dimensiones
```
Max Z = 50x1 + 30x2 + 80x3
s.a.
x1 + 2x2 + x3 <= 120
2x1 + x2 + 3x3 <= 180
x1 + x2 + x3 <= 100
x1, x2, x3 >= 0
```
* **Contexto:** Fábrica con 3 líneas de productos (mesas, sillas y escritorios). Demuestra la superioridad del Método Simplex tabular en espacios de dimensión $n > 2$.
* **Solución Óptima:** $x_1^* = 0, \ x_2^* = 40, \ x_3^* = 40$, con Utilidad Máxima $Z^* = 4,400$.

---

## 8. Guía de Instalación, Comandos CLI y Exportación Académica

### Requisitos Previos
* **Node.js:** Versión 18.0 o superior instalada.
* **Navegador Web:** Google Chrome, Microsoft Edge, Mozilla Firefox, Brave o Safari.

### Comandos de Ejecución y Scripts de Terminal

El proyecto cuenta con un conjunto completo de comandos en `package.json` para desarrollo, verificación y producción:

| Comando | Acción / Propósito | Detalle Técnico |
| :--- | :--- | :--- |
| `npm install` | Instalación de Dependencias | Instala React 19, Tailwind CSS v4, KaTeX, Lucide Icons y herramientas de compilación. |
| `npm run dev` | Servidor de Desarrollo | Inicia el servidor local Vite con Hot Module Replacement (HMR) instantáneo. |
| `npm run compile` | Verificación de Tipos TypeScript | Ejecuta `tsc -b` para verificar estáticamente que el $100\%$ del código no tenga errores de tipos. |
| `npm run watch` | Compilación Continua | Ejecuta `tsc -b --watch` para monitorear cambios en el código TypeScript en tiempo real. |
| `npm run build` | Empaquetado para Producción | Compila TypeScript y genera el bundle minificado de alto rendimiento en la carpeta `dist/`. |
| `npm run lint` | Auditoría de Código | Ejecuta el linter ultrarrápido `oxlint` para garantizar calidad y estándares de código limpio. |
| `npm run preview` | Previsualización Local | Levanta un servidor local para probar la versión de producción empaquetada en `dist/`. |

### Flujo de Inicio Rápido
1. Abrir la terminal en el directorio del proyecto:
   ```bash
   cd /home/alexs/Projects/Solver
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor local:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   ```
   http://localhost:5173
   ```

### Exportación e Impresión a PDF
Para generar un reporte académico impecable para entregar a un docente o incorporar en una tesis:
1. Haga clic en el botón tipo píldora **"Exportar / Imprimir"** en la barra de título superior (o presione `Ctrl + P`).
2. Las reglas `@media print` de CSS configuradas en [`src/index.css`](file:///home/alexs/Projects/Solver/src/index.css) transformarán la interfaz automáticamente:
   * Ocultan los botones interactivos, semáforos de ventana, barras de navegación y fondos oscuros.
   * Cambian el fondo a **blanco puro** y la tipografía a negro de alto contraste.
   * Mantienen intactas todas las fórmulas vectoriales de KaTeX, las matrices de Gauss-Jordan y las tablas de coordenadas.
3. Seleccione la opción **"Guardar como PDF"** en el cuadro de diálogo del navegador.

---

## 9. Referencias Bibliográficas (Formato APA 7.ª Edición)

A continuación se listan las fuentes teóricas, algorítmicas, arquitectónicas y tecnológicas fundamentales empleadas para el diseño, rigor matemático e implementación del sistema `Solver IO`:

### Fundamentos de Investigación de Operaciones y Programación Lineal
* Bazaraa, M. S., Jarvis, J. J., & Sherali, H. D. (2010). *Linear programming and network flows* (4th ed.). John Wiley & Sons.
* Bland, R. G. (1977). New finite pivoting rules for the simplex method. *Mathematics of Operations Research*, 2(2), 103–107. https://doi.org/10.1287/moor.2.2.103
* Dantzig, G. B. (1963). *Linear programming and extensions*. Princeton University Press.
* Hillier, F. S., & Lieberman, G. J. (2015). *Introducción a la investigación de operaciones* (10.ª ed.). McGraw-Hill Interamericana de España.
* Taha, H. A. (2017). *Investigación de operaciones* (10.ª ed.). Pearson Educación de México.
* Winston, W. L. (2004). *Operations research: Applications and algorithms* (4th ed.). Thomson Brooks/Cole.

### Métodos Numéricos, Álgebra Lineal y Computación
* Cramer, G. (1750). *Introduction à l'analyse des lignes courbes algébriques*. Frères Cramer & C. Philibert.
* Golub, G. H., & Van Loan, C. F. (2013). *Matrix computations* (4th ed.). Johns Hopkins University Press.
* Knuth, D. E. (1997). *The art of computer programming: Seminumerical algorithms* (Vol. 2, 3rd ed.). Addison-Wesley Professional.
* Strang, G. (2016). *Introduction to linear algebra* (5th ed.). Wellesley-Cambridge Press.

### Arquitectura de Software y Patrones de Diseño
* Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley Professional.
* Martin, R. C. (2018). *Clean architecture: A craftsman's guide to software structure and design*. Prentice Hall.
* Fowler, M. (2002). *Patterns of enterprise application architecture*. Addison-Wesley Professional.

### Estándares Web, Tipografía Matemática y Diseño de Interfaz
* Apple Inc. (2024). *Human interface guidelines: macOS design principles, window controls, and materials*. Apple Developer Documentation. https://developer.apple.com/design/human-interface-guidelines/
* KaTeX Team. (2024). *KaTeX: The fastest math typesetting library for the web* (Version 0.18.7) [Software]. GitHub. https://katex.org/
* World Wide Web Consortium (W3C). (2023). *CSS color module level 4 and backdrop-filter specification*. W3C Recommendation. https://www.w3.org/TR/css-color-4/
* World Wide Web Consortium (W3C). (2024). *HTML5 Canvas 2D context specification*. W3C Recommendation. https://www.w3.org/TR/2dcontext/
