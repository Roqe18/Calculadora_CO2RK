# Plataforma Digital para Proyectos de Absorción de Carbono (IDAF)
## Reglas y Memoria del Proyecto (GEMINI.md)

Este archivo contiene el contexto permanente, principios de diseño, reglas de negocio, metodología científica aprendida y directrices de seguridad tras la auditoría integral para el desarrollo de la plataforma web de IDAF.

---

### 1. Identidad Corporativa y Marca (IDAF)
- **Empresa:** Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF).
- **Nombre oficial de la plataforma:** *Plataforma Digital para Proyectos de Absorción de Carbono*.
- **Colores Corporativos:**
  - Verde Oscuro Institucional: **Pantone 357 C** (`#005027`).
  - Verde Claro Acento: **Pantone 368 C** (`#76B72B`).
  - Fondos y contrastes: `#f0fdf4`, `#f7faf5`, `#ffffff`.
- **Tipografía Oficial:** `Poppins` (Google Fonts, pesos 300, 400, 500, 600, 700).
- **Recursos Gráficos:** Los logotipos oficiales transparentes y de alta resolución (300 DPI) residen en `Codigo_app/assets/` y `Manual_identidad_IDAF/`.

---

### 2. Arquitectura de Software y Privacidad
- **Tecnología:** 100% Client-Side Vanilla Web (HTML5 semántico, CSS3 corporativo moderno, JavaScript modular ES Modules).
- **Sin Servidor Backend Obligatorio:** Cero costes de computación en nube, compatible con GitHub Pages, Netlify, Vercel o integrado mediante `<iframe>` en la web corporativa de IDAF (WordPress).
- **Privacidad Total (Zero-Data Leakage):** Los inventarios de los propietarios y las geometrías de las fincas se procesan exclusivamente en la memoria local del navegador del usuario (mediante DOMParser y SheetJS) sin enviarse a ningún servidor externo.
- **Acceso:** Login inicial con Google GIS (OAuth 2.0) y botón de acceso Demo para técnicos y clientes de IDAF.
- **Repositorio Oficial:** [`https://github.com/Roqe18/Calculadora_CO2RK.git`](https://github.com/Roqe18/Calculadora_CO2RK.git) (rama `main`).

---

### 3. Flujo Funcional en 3 Pasos (Wizard)
1. **Paso 1: Datos del Proyecto, KML y Elegibilidad:**
   - Metadatos obligatorios de la finca (Nombre, Titular, NIF, Finca, Provincia, Municipio, Ref. Catastral, Especie principal, Régimen y Actuación).
   - Subida de delimitación perimetral en formato `.kml`, representada en mapa interactivo satelital Leaflet con cálculo esférico automático de superficie neta en hectáreas (descontando enclaves e islas interiores de `innerBoundaryIs`).
   - Criterios de elegibilidad interactivos según la actuación elegida y subida obligatoria de la memoria técnica en PDF.
2. **Paso 2: Inventario Forestal Pie a Pie (CSV/Excel) - REGLA DE NO PRECARGA:**
   - **Formato estricto a nivel de árbol:** Columnas `ID`, `Especie`, `DBH` (cm) y `Altura` (m).
   - **Regla de decimales españoles:** Normalizar comas a puntos (`replace(',', '.')`) antes de convertir con `parseFloat()` para evitar truncamientos silenciosos de diámetro o altura.
   - **Cálculo alométrico por árbol:** Aplicación inmediata de las fórmulas de Ruiz-Peinado et al. (2012) por fracciones ($B_f, B_{r7}, B_{r2-7}, B_{r2+h}, B_{rad}$).
   - **Densidad automática y modalidades:** 
     - **En Plantaciones:** La densidad inicial existente es 0 pies/ha (terreno desarbolado). El sistema muestra un aviso dinámico indicando que no se requiere inventario previo y calcula los árboles totales a plantar en la finca: $\text{Total Árboles} = \text{Densidad de plantación (pies/ha)} \times \text{Superficie KML (ha)}$.
     - **En Densificaciones y Cerramientos:** Permite elegir entre *Muestreo en parcelas* (defecto 1.0 ha, $\text{Densidad} = \text{árboles} / \text{superficie muestreada}$, extrapolado a finca $\times \text{Superficie KML}$) o *Censo 100% de la finca* ($\text{superficie muestreada} = \text{superficie KML}$).
   - **Matorral manual (Montero et al., 2020):** Panel interactivo con desplegable de 14 formaciones (A12 a A35 y EC_GENERAL), $FCC$ (%) y altura media en decímetros ($h$, dm).
   - **Parámetros de la masa y actuación:** Edad de la masa, potencialidad (0.85 estándar) y campo específico de la actuación (densidad de nueva plantación, densidad añadida en densificaciones o regeneración y meta de matorral en cerramientos).
   - **Regla de no precarga:** Nunca precargar datos ficticios. Ofrecer la descarga de las plantillas oficiales vacías (`plantilla_inventario_rodales.csv` y `.xlsx`).
3. **Paso 3: Resultados, Proyecciones y Certificación:**
   - Cuadro de mandos con KPIs de absorción, gráficos interactivos Chart.js (evolución temporal de stock y créditos netos anuales/acumulados), tabla año a año, exportación a Excel y botón de emisión de informe técnico pericial imprimible en PDF con identidad IDAF.

---

### 4. Las 3 Actuaciones de Proyecto
- **1. Plantaciones:** Nuevas repoblaciones sobre terrenos desarbolados o agrícolas marginales. Línea base sin absorción arbórea ($0\text{ pies/ha}$); se acredita el 100% de la biomasa adicional de los nuevos árboles.
- **2. Densificaciones:** Enriquecimiento de masas abiertas, dehesas o alcornocales envejecidos con baja espesura. Línea base mantiene el stock adulto existente; se acredita el crecimiento de la nueva cohorte añadida ($N_{añadida}$) modelada considerando la competencia total de la masa ($N_{total} = N_{existente} + N_{añadida}$).
- **3. Cerramientos:** Exclusiones temporales del ganado y ungulados silvestres (ciervo, jabalí) para desbloquear la regeneración natural. Se acredita el reclutamiento de nuevos árboles ($N_{regenerada}$) más el incremento de biomasa por recuperación de cobertura y porte vertical del matorral durante 12 años.

---

### 5. Metodología Científica Aplicada (LIFE Deliverable D6.2 - IDAF)
- **Ecuaciones de Biomasa Arbórea por Fracciones (Ruiz-Peinado et al., 2012 / SUR):**
  - Aditividad estricta: $\text{Biomasa Total} = B_f + B_{r7} + B_{r2-7} + B_{r2+h} + B_{rad}$ en kg de peso seco por árbol en función de $d$ (DBH, cm) y $h$ (altura total, m).
  - Modelos parametrizados para *Quercus suber* (Tabla 2 de D6.2) y 10 especies acompañantes (Tabla 3: *Pinus pinea*, *Quercus ilex*, *Quercus faginea*, *Quercus pyrenaica*, *Quercus canariensis*, *Castanea sativa*, *Ceratonia siliqua*, *Olea europaea*, *Celtis australis*, *Juglans regia*).
- **Biomasa de Matorral (Montero et al., 2020 - Tabla 4 de D6.2):**
  - Estimación en $\text{t/ha}$ a partir de $\theta = \arcsin\left(\sqrt{fcc/100}\right)$ (en radianes) y la altura del matorral en decímetros ($h$, dm) para 14 agrupaciones mediterráneas.
- **Algoritmo de Absorción Ex-Ante para *Quercus suber* (Sección 6.1 de D6.2):**
  $$\text{tCO}_2\text{eq/pie}(t) = 0.0000737 \cdot \text{Edad}^{2.3816} \cdot e^{0.1451 \cdot \text{Potencialidad}}$$
  *(Calibrado con 85 parcelas MLS/TLS e inventarios tradicionales, $R^2 = 0.78$)*.
- **Modelos Dinámicos Ex-Ante eco2for (Tabla 8 de D6.2):**
  - Curvas de crecimiento dinámico dependientes de Edad ($T$), Densidad de rodal ($N$) y variables climáticas ($pp_m$, $t_m$, índice de De Martonne $M$). Para *Quercus pyrenaica* con $N < 372$, se escala mediante alometría individual por árbol según edad para evitar términos negativos de la curva densa.
- **Parámetros Estequiométricos y Factores de Descuento:**
  - Conversión C a $\text{CO}_2$: $\frac{44}{12} \approx 3.6667$.
  - Fracción de carbono: $CF = 0.50$ (Montero et al., 2005 / D6.2).
  - Buffer de permanencia / reserva de riesgo: $15\%$ por defecto.
  - Fugas (*leakage*): $5\%$ por defecto.
  - Créditos Netos Verificables: $\text{Créditos Brutos} \times (1 - \text{Buffer\%} - \text{Fugas\%}) = \text{Créditos Brutos} \times 0.80$.

---

### 6. Reglas de Seguridad y Buenas Prácticas de Código
- **Sanitización HTML obligatoria (Anti-XSS):** Todo dato introducido por el usuario (`projectInfo`), nombres de archivo (`file.name`), mensajes de error (`err.message`), columnas del CSV (`ID`, `Especie`) y textos del mapa deben pasar por `escapeHtml()` antes de asignarse a `innerHTML` o a popups de Leaflet.
- **Chart.js v4:** Al definir gráficos mixtos (barras + líneas), siempre especificar `type: 'bar'` en la raíz de la configuración del gráfico para evitar excepciones en el runtime.
- **Lectura binaria segura:** Emplear `readAsArrayBuffer()` con SheetJS (`{ type: 'array' }`) en lugar de la API obsoleta `readAsBinaryString()` para evitar corrupción de codificación UTF-8.
- **Servidor de desarrollo local:** `dev_server.py` debe enlazar exclusivamente a `127.0.0.1` con cabeceras `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`.
- **Estilos de Impresión (`@media print`):** Mantener visible la cabecera institucional y el logo de IDAF en los peritajes PDF impresos, ocultando botones de acción y barras de navegación.

---

### 7. Estructura de Directorios del Repositorio
```text
Calculadora_CO2RK/
├── README.md                     # Documentación oficial de GitHub con badges y guía técnica
├── LEEME.md                      # Guía de bienvenida en español para el usuario
├── GEMINI.md                     # Memoria técnica y reglas de negocio del asistente (este archivo)
├── .gitignore                    # Reglas de exclusión de Git (Python, OS, IDEs)
├── INICIAR_APP.bat               # Lanzador ejecutable con 1 clic en Windows
├── Manual_Usuario_Calculadora_IDAF.pdf # Manual oficial con maquetas y recuadros
│
├── Codigo_app/                   # Aplicación web completa y código fuente
│   ├── index.html                # Calculadora y visor cartográfico en 3 pasos
│   ├── login.html                # Pantalla de login Google y modo Demo
│   ├── assets/                   # Logotipos corporativos IDAF (300 DPI)
│   ├── css/                      # Hojas de estilo corporativas y print media
│   ├── data/                     # JSON de especies, normativas y plantillas CSV/XLSX
│   ├── js/                       # Módulos JS (auth, calculations, models, parsers, ui)
│   ├── docs/                     # Manuales, arquitectura y guías de integración WordPress
│   └── server/                   # Script dev_server.py enlazado a 127.0.0.1
│
├── Demo/                         # Paquete con datos reales de prueba guiados (Finca La Dehesilla)
├── Documentacion/                # Documento Word D6.2, extractos y tablas JSON/TXT
└── Manual_identidad_IDAF/        # Manual corporativo PDF y resumen de colores
```
