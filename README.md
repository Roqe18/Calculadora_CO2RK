# Plataforma Digital para Proyectos de Absorción de Carbono (IDAF)

<p align="center">
  <img src="Codigo_app/assets/logo_idaf_horizontal.png" alt="IDAF Agroforestal" width="380">
</p>

<p align="center">
  <strong>Herramienta técnica de cuantificación de biomasa viva, absorción de carbono y certificación de créditos forestales</strong><br>
  <em>Desarrollada para el Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tecnolog%C3%ADa-100%25%20Client--Side%20Vanilla%20Web-005027?style=flat-square" alt="Client-Side">
  <img src="https://img.shields.io/badge/Metodolog%C3%ADa-LIFE%20Deliverable%20D6.2-76B72B?style=flat-square" alt="LIFE D6.2">
  <img src="https://img.shields.io/badge/Alometr%C3%ADa-Ruiz--Peinado%202012-005027?style=flat-square" alt="Ruiz-Peinado 2012">
  <img src="https://img.shields.io/badge/Matorral-Montero%20et%20al.%202020-76B72B?style=flat-square" alt="Montero 2020">
  <img src="https://img.shields.io/badge/Privacidad-100%25%20Local%20(Sin%20Servidor)-success?style=flat-square" alt="Privacidad">
</p>

---

## 🌲 Descripción General

La **Plataforma Digital para Proyectos de Absorción de Carbono** es una aplicación web técnica diseñada para ingenieros forestales, evaluadores de proyectos y propietarios de fincas. Permite estimar y proyectar la absorción de $\text{CO}_2$ y la generación de créditos de carbono verificables en masas mediterráneas (con especial calibración para *Quercus suber* y especies acompañantes) mediante un flujo de trabajo en **3 pasos**.

La aplicación opera **100% en el lado del cliente (Client-Side)**: el procesamiento de delimitaciones geográficas (`.kml`), memorias técnicas (`.pdf`) y censos pie a pie (`.csv`, `.xlsx`) se ejecuta en la memoria local del navegador, garantizando **privacidad total** y **cero costes de computación en servidor**.

---

## 🚀 Inicio Rápido

### Opción 1: Ejecución local en Windows (Recomendada con 1 clic)
Haz doble clic sobre el archivo ejecutable de la raíz:
```cmd
INICIAR_APP.bat
```
El script iniciará el servidor local seguro (`127.0.0.1:8000`) y abrirá automáticamente la plataforma en tu navegador.

### Opción 2: Ejecución desde terminal (PowerShell o CMD)
```powershell
# Clona el repositorio
git clone https://github.com/Roqe18/Calculadora_CO2RK.git
cd Calculadora_CO2RK

# Inicia el servidor de desarrollo
python Codigo_app/server/dev_server.py
```
Abre en tu navegador: `http://localhost:8000/login.html`

### Opción 3: Despliegue estático o Integración Web (WordPress)
Al ser 100% web estándar (HTML5 + CSS3 + ES Modules), no requiere base de datos ni backend:
- Compatible con **GitHub Pages**, **Netlify**, **Vercel** o hosting cPanel.
- Embebible en cualquier web de **WordPress** mediante `<iframe>`:
```html
<iframe 
  src="https://tu-dominio.com/calculadora/" 
  style="width: 100%; height: 950px; border: none; border-radius: 12px;"
  title="Plataforma de Absorción de Carbono IDAF">
</iframe>
```

---

## 🧭 Flujo de Operación en 3 Pasos (Wizard)

```text
[ Paso 1: Finca & KML ] ──▶ [ Paso 2: Inventario Forestal ] ──▶ [ Paso 3: Créditos & Reporte ]
  - Metadatos registrales     - Subida de CSV / Excel pie a pie   - Cuadro de mandos con KPIs
  - Memoria técnica (PDF)     - Cálculo fracciones Ruiz-Peinado   - Gráficos interactivos Chart.js
  - Visor Leaflet satélite    - Matorral (Montero et al., 2020)   - Proyección anual año a año
  - Cálculo superficie (ha)   - Densidad y parámetros de masa     - Exportación a Excel y PDF
```

### 1. Paso 1: Datos del Proyecto, Elegibilidad y Delimitación KML
- Recogida de metadatos oficiales: Proyecto, Titular, NIF/CIF, Finca, Término Municipal, Provincia y Referencia Catastral.
- **Subida de Memoria Técnica en PDF** justificativa del cumplimiento de criterios de elegibilidad.
- **Subida de archivo KML perimetral:** visualización sobre ortofotografía satelital (Leaflet/ESRI) con cálculo esférico automático de la superficie neta en hectáreas y descuento de enclaves interiores (`innerBoundaryIs`).

### 2. Paso 2: Inventario Forestal Pie a Pie (CSV / Excel)
- **Regla de no precarga:** No precarga datos ficticios. Ofrece plantillas oficiales vacías descargables (`.csv` y `.xlsx`).
- **Columnas requeridas:** `ID`, `Especie`, `DBH` (cm), `Altura` (m). Soporte tanto de coma decimal (`18,5`) como punto (`18.5`).
- **Cálculo alométrico inmediato:** Asigna por árbol las fracciones de biomasa de Ruiz-Peinado et al. (2012).
- **Tratamiento según la actuación:**
  - *Plantaciones:* Densidad de partida = 0 pies/ha (terreno desarbolado). El sistema calcula el total de árboles a plantar a partir de la densidad prevista y la superficie del KML.
  - *Densificaciones y Cerramientos:* Permite elegir entre *Muestreo en parcelas* (extrapolado a la finca) o *Censo 100% de la finca*.
- **Estrato arbustivo:** Caracterización con desplegable de 14 formaciones mediterráneas, FCC (%) y altura media ($h$, dm).

### 3. Paso 3: Resultados, Curvas de Absorción y Certificación
- **Cuadro de Mandos:** KPIs con Créditos Netos Totales ($\text{t CO}_2\text{e}$), Ritmo Anual ($\text{t CO}_2\text{e/año}$), Rendimiento por hectárea ($\text{t CO}_2\text{e/ha}$), Valoración económica estimada (€) y Depósito de reserva retenido (Buffer).
- **Gráficos Dinámicos (Chart.js):**
  - Evolución del Stock de Carbono (Línea Base vs Proyecto IFM).
  - Generación de Créditos de Carbono (Créditos netos anuales en barras y acumulados en línea).
- **Tabla Detallada:** Serie temporal completa año a año.
- **Exportación:** Informe en Excel (`.xlsx`) y emisión de informe pericial imprimible en PDF optimizado con identidad corporativa de IDAF.

---

## 🔬 Metodología Científica Aplicada (LIFE Deliverable D6.2)

### A. Ecuaciones Alométricas por Fracciones (Ruiz-Peinado et al., 2012)
Cuantificación aditiva individual de biomasa seca en kilogramos:
$$\text{Biomasa Total} = B_f + B_{r7} + B_{r2-7} + B_{r2+h} + B_{rad}$$
- $B_f$: Biomasa del fuste.
- $B_{r7}$: Ramas gruesas ($d > 7\text{ cm}$).
- $B_{r2-7}$: Ramas medias ($2 \le d \le 7\text{ cm}$).
- $B_{r2+h}$: Ramillas finas ($d < 2\text{ cm}$) con hojas o acículas.
- $B_{rad}$: Biomasa subterránea (raíces).

Parametrizada para ***Quercus suber*** (Tabla 2 de D6.2) y **10 especies acompañantes** (Tabla 3: *Pinus pinea*, *Quercus ilex*, *Quercus faginea*, *Quercus pyrenaica*, *Quercus canariensis*, *Castanea sativa*, *Ceratonia siliqua*, *Olea europaea*, *Celtis australis*, *Juglans regia*).

### B. Biomasa de Matorral (Montero et al., 2020)
Estimación de la biomasa arbustiva en $\text{t M.S./ha}$ para 14 agrupaciones mediterráneas a partir del ángulo de recubrimiento $\theta$:
$$\theta = \arcsin\left(\sqrt{\frac{FCC}{100}}\right) \quad (\text{en radianes})$$
$$B_{shrub} = a \cdot (h \cdot \theta)^{b_2} \quad \text{ó} \quad a \cdot ((h^{b_1}) \cdot \theta)^{b_2} \quad (h \text{ en decímetros})$$

### C. Algoritmo de Estimación Ex-Ante de *Quercus suber* (Sección 6.1 D6.2)
$$\text{tCO}_2\text{eq/pie}(t) = 0.0000737 \cdot \text{Edad}^{2.3816} \cdot e^{0.1451 \cdot \text{Potencialidad}}$$
*(Calibrado con 85 parcelas de inventario tradicional, LiDAR terrestre MLS/TLS y fotogrametría aérea UAV, $R^2 = 0.78$)*.

### D. Modelos Dinámicos eco2for (Tabla 8 D6.2)
Curvas de crecimiento dependientes de la Edad ($T$), Densidad total de competencia ($N$) y variables bioclimáticas (precipitación $pp_m$, temperatura $t_m$ e índice de De Martonne $M$).

### E. Estequiometría y Factores de Descuento
- **Ratio molecular $\text{CO}_2 / \text{C}$:** $\frac{44}{12} \approx 3.6667$.
- **Fracción de carbono:** $CF = 0.50$ (Montero et al., 2005 / D6.2).
- **Buffer de permanencia (Permanence Risk Pool):** $15\%$ por defecto.
- **Deducción por fugas (Leakage):** $5\%$ por defecto.
- **Créditos Netos:** $\text{Créditos Brutos} \times (1 - 0.15 - 0.05) = \text{Créditos Brutos} \times 0.80$.

---

## 📋 Las 3 Actuaciones de Proyecto

| Actuación | Línea Base (Escenario Referencia) | Escenario de Proyecto | Acreditación Neta |
| :--- | :--- | :--- | :--- |
| **1. Plantaciones** | Terreno desarbolado o agrícola marginal ($0\text{ pies/ha}$). | Nueva repoblación forestal con densidad planificada. | 100% de la biomasa arbórea adicional fijada. |
| **2. Densificaciones** | Masa abierta o dehesa existente con regeneración insuficiente. | Enriquecimiento con nueva cohorte y protectores. | Crecimiento neto de la cohorte introducida ($N_{añadida}$). |
| **3. Cerramientos** | Masa con herbivoría continua (ganado / ungulados silvestres). | Exclusión temporal con cerramiento perimetral. | Reclutamiento de regeneración natural ($N_{regenerada}$) + recuperación de biomasa de matorral. |

---

## 📂 Estructura del Repositorio

```text
Calculadora_CO2RK/
├── README.md                     # Documentación principal del repositorio en GitHub
├── LEEME.md                      # Guía detallada en español de bienvenida
├── INICIAR_APP.bat               # Lanzador ejecutable con 1 clic en Windows
├── Manual_Usuario_Calculadora_IDAF.pdf # Manual oficial de usuario con diagramas y formularios
│
├── Codigo_app/                   # Aplicación web completa (100% Client-Side)
│   ├── index.html                # Calculadora y visor cartográfico en 3 pasos
│   ├── login.html                # Pantalla de acceso Google GIS (OAuth 2.0) y modo Demo
│   ├── assets/                   # Logotipos oficiales IDAF en alta resolución (Pantone 357 C / 368 C)
│   ├── css/
│   │   └── styles.css            # Hojas de estilo corporativas y reglas de impresión PDF
│   ├── data/
│   │   ├── species_database.json # Base de datos de 11 especies con factores biométricos
│   │   ├── regulations_database.json # Comunidades autónomas, criterios y tratamientos
│   │   └── templates/            # Plantillas oficiales vacías (.csv y .xlsx) y KML de ejemplo
│   ├── js/
│   │   ├── config.js             # Parámetros por defecto, buffers y ratios estequiométricos
│   │   ├── core/
│   │   │   ├── auth.js           # Módulo de autenticación GIS y sesiones
│   │   │   ├── calculations.js   # Motor científico de cálculo (Ruiz-Peinado, Montero, D6.2)
│   │   │   └── models.js         # Clases ForestStand, ManagementScenario y SimulationResult
│   │   ├── parsers/
│   │   │   ├── fileParser.js     # Lector de Excel/CSV a nivel de árbol (SheetJS)
│   │   │   └── kmlParser.js      # Parser KML con cálculo esférico de superficie (WGS84)
│   │   └── ui/
│   │       ├── app.js            # Controlador del flujo wizard y sanitización XSS
│   │       ├── charts.js         # Gestor de gráficos interactivos (Chart.js v4)
│   │       ├── mapManager.js     # Gestor de capas satelitales y perímetros (Leaflet)
│   │       └── report.js         # Exportador a Excel y generador de peritajes PDF
│   └── server/
│       └── dev_server.py         # Servidor local ligero seguro en Python (127.0.0.1)
│
├── Demo/                         # Paquete con datos reales de prueba guiados (Finca La Dehesilla)
│   ├── Delimitacion_Finca_La_Dehesilla.kml # KML real de prueba (45.20 ha)
│   ├── Inventario_Forestal_La_Dehesilla.csv # Inventario de 30 árboles
│   ├── Inventario_Forestal_La_Dehesilla.xlsx # Versión Excel del inventario
│   ├── Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf # Memoria técnica de ejemplo
│   └── INSTRUCCIONES_Y_GUIA_DEMO.md # Guía paso a paso para demostraciones
│
├── Documentacion/                # Documentación científica y extractos del Deliverable D6.2
│   ├── D6.2_CuantificacionBiomasaVivaIDAF.docx # Informe metodológico completo LIFE
│   ├── d6_2_tables_formatted.txt # Fórmulas alométricas tabuladas
│   └── README_D6_2.md            # Guía técnica de las ecuaciones
│
└── Manual_identidad_IDAF/        # Manual corporativo de identidad visual (colores y tipografía)
```

---

## 🔒 Seguridad y Privacidad

- **Zero-Data Leakage:** Los inventarios forestales de los propietarios y las geometrías de las parcelas nunca se envían a servidores de terceros ni se guardan en la nube.
- **Mitigación XSS:** Toda entrada de datos por formulario, nombres de archivos y registros de inventario son sanitizados mediante `escapeHtml()` antes de cualquier renderizado en el DOM o en marcadores de Leaflet.
- **Servidor local enlazado a localhost:** El servidor `dev_server.py` se enlaza estrictamente a `127.0.0.1` con cabeceras `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`.

---

## 👥 Créditos y Autoría

- **Desarrollo y Titularidad:** Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. ([IDAF](https://www.idaf.es)).
- **Sede:** Campus de Rabanales • Edificio Leonardo Da Vinci, 1ª Planta • Córdoba, España.
- **Contacto:** [social@idaf.es](mailto:social@idaf.es) • [idaf.es](https://www.idaf.es)
