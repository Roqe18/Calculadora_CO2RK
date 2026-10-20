# Plataforma Digital para Proyectos de Absorción de Carbono

Desarrollada para **IDAF (Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L.)**, esta plataforma web permite calcular y simular la generación de créditos de carbono mediante **Mejora de la Gestión Forestal (IFM - Improved Forest Management)**, tanto a partir de parámetros manuales de rodal como mediante la carga de inventarios forestales masivos en hojas **Excel (.xlsx, .xls)** y archivos **CSV**.

Inspirado en la metodología de referencia de la herramienta europea **[LIFE ClimatePositive Carbon Tool](https://aforclimate.shinyapps.io/carbon_tool_module/)**.

---

## 🚀 Inicio Rápido en tu Ordenador

Tienes dos formas de abrir la aplicación en tu navegador:

### Opción A (Recomendada - Con 1 solo clic):
Haz doble clic sobre el archivo ejecutable:
```text
INICIAR_APP.bat
```
Se iniciará el servidor de desarrollo y se abrirá automáticamente tu navegador en `http://localhost:8000`.

### Opción B (Desde la consola PowerShell):
```powershell
R:
cd "R:\OneDrive\OneDrive - centro de investigaciones aplicadas al desarrollo agroforestal SL\Antigravity\Calculadora_CO2RK"
py Codigo_app/server/dev_server.py
```

---

## 📁 Estructura del Repositorio

```text
Calculadora_CO2RK/
│
├── INICIAR_APP.bat              # Lanzador rápido de la app en Windows con 1 clic
├── Manual_Usuario_Calculadora_IDAF.pdf  # Manual Oficial de Usuario en PDF con maquetas y recuadros
├── LEEME.md                     # Este documento de bienvenida y guía del proyecto
│
├── Demo/                        # Paquete completo con datos de prueba listos para copiar y pegar
│   ├── DATOS_A_COPIAR_Y_PEGAR.txt              # Texto con todos los datos para rellenar en 3 minutos
│   ├── INSTRUCCIONES_Y_GUIA_DEMO.md            # Guía detallada de demostración para el equipo
│   ├── Delimitacion_Finca_La_Dehesilla.kml     # Perímetro KML (45.20 ha exactas)
│   ├── Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf # Memoria técnica PDF pericial
│   ├── Inventario_Forestal_La_Dehesilla.csv    # Inventario pie a pie (30 árboles)
│   └── Inventario_Forestal_La_Dehesilla.xlsx   # Versión Excel del inventario pie a pie
│
├── Codigo_app/                  # Directorio con todo el código fuente de la plataforma
│   ├── login.html               # Página de inicio de sesión con Google y acceso seguro
│   ├── index.html               # Interfaz web principal responsiva (requiere autenticación)
│   ├── INICIAR_APP.bat          # Lanzador alternativo dentro de la carpeta de código
│   │
│   ├── assets/                  # Logotipos corporativos oficiales de IDAF en alta resolución (300 DPI)
│   │   ├── logo_idaf_horizontal.png   # Logotipo horizontal con fondo transparente
│   │   ├── logo_idaf_isotipo.png      # Símbolo del árbol para favicon y elementos compactos
│   │   └── logo_idaf_vertical.png     # Isologo vertical
│   │
│   ├── css/
│   │   └── styles.css           # Estilos corporativos (Pantone 357 C #005027 y Pantone 368 C #76B72B)
│   │
│   ├── js/
│   │   ├── config.js            # Configuración general y Client ID de Google OAuth
│   │   ├── core/
│   │   │   ├── auth.js          # Módulo de autenticación Google Identity Services y gestión de sesión
│   │   │   ├── models.js        # Modelos de datos (ForestStand, ManagementScenario, SimulationResult)
│   │   │   └── calculations.js  # Motor matemático de biomasa viva, carbono, adicionalidad y créditos
│   │   ├── parsers/
│   │   │   └── fileParser.js    # Lector y validador de archivos Excel y CSV en cliente (SheetJS)
│   │   └── ui/
│   │       ├── app.js           # Controlador reactivo entre interfaz, eventos y cálculos
│   │       ├── charts.js        # Gráficos dinámicos interactivos con Chart.js
│   │       └── report.js        # Generador de reportes de impresión y exportación a Excel
│   │
│   ├── data/
│   │   ├── species_database.json      # Catálogo de especies forestales y coeficientes alométricos
│   │   ├── regulations_database.json  # Normativas autonómicas, tratamientos y estrategias IFM
│   │   └── templates/                 # Plantillas de datos para los usuarios
│   │       ├── plantilla_inventario_rodales.csv
│   │       └── plantilla_inventario_rodales.xlsx
│   │
│   ├── docs/
│   │   ├── Manual_Usuario_Calculadora_IDAF.pdf  # Manual oficial en PDF listo para imprimir
│   │   ├── MANUAL_USUARIO_IDAF.html   # Versión web interactiva del manual
│   │   ├── MANUAL_DE_USUARIO.md       # Guía técnica en formato Markdown
│   │   ├── ARQUITECTURA.md            # Documentación exhaustiva del diseño técnico y flujo de datos
│   │   └── GUIA_INTEGRACION_WEB.md    # Instrucciones para embeber la calculadora en tu web (WordPress)
│   │
│   └── server/
│       ├── dev_server.py              # Servidor local ligero en Python con apertura automática
│       └── generate_template_excel.py # Script generador de la plantilla Excel con formato
│
├── Documentacion/               # Documentos oficiales de cálculo y extractos metodológicos
│   ├── D6.2_CuantificacionBiomasaVivaIDAF.docx  # Documento técnico oficial Word (7.9 MB)
│   ├── D6.2_contenido_extraido.txt              # Texto íntegro extraído
│   ├── d6_2_tables.json                         # Tablas 1 a 8 en formato JSON
│   ├── d6_2_tables_formatted.txt                # Ecuaciones y tablas formateadas
│   ├── d6_2_table8_formulas.txt                 # Modelos dinámicos eco2for
│   ├── sec3_paragraphs.txt                      # Metodología de inventario y teledetección MLS/UAV
│   └── README_D6_2.md                           # Índice y resumen técnico de las fórmulas
│
└── Manual_identidad_IDAF/       # Manual de identidad corporativa de IDAF y recursos gráficos
    ├── ManualIdentidad-IDAF.pdf       # Manual oficial en PDF
    ├── manual_texto_extraido.txt      # Extracción textual del manual
    └── RESUMEN_IDENTIDAD_IDAF.md      # Resumen ejecutivo de colores, tipografía Poppins y usos
```

---

## 🔬 Metodología Científica Aplicada (LIFE Deliverable D6.2)

1. **Alometría Arbórea Aditiva por Fracciones (Ruiz-Peinado et al., 2012 / SUR):**
   - Ecuaciones aditivas de mínimos cuadrados generalizados conjuntos para *Quercus suber* y especies acompañantes (*Pinus pinea*, *Quercus ilex*, *Quercus faginea*, *Quercus pyrenaica*, *Quercus canariensis*, *Castanea sativa*, *Ceratonia siliqua*, *Olea europaea*, *Celtis australis*, *Juglans regia*).
   - Cuantificación individual por fracciones: Fuste ($B_f$), Ramas gruesas $>7\text{ cm}$ ($B_{r7}$), Ramas medias $2\text{--}7\text{ cm}$ ($B_{r2-7}$), Ramillas $<2\text{ cm}$ con hojas ($B_{r2+h}$) y Raíces ($B_{rad}$).

2. **Biomasa de Matorral (Montero et al., 2020):**
   - Modelización para 14 formaciones vegetales arbustivas en función de la fracción de cabida cubierta ($fcc$, $\%$) y altura media ($h$, $\text{dm}$).

3. **Algoritmos de Estimación Ex-Ante:**
   - Modelo log-lineal para *Quercus suber*: $\text{tCO}_2\text{eq/pie}(t) = 0.0000737 \cdot \text{Edad}^{2.3816} \cdot e^{0.1451 \cdot \text{Potencialidad}}$.
   - Modelos dinámicos eco2for para especies acompañantes con factores climáticos y estacionales.

4. **3 Actuaciones de Proyecto Elegibles:**
   - **1. Plantaciones:** Acreditación de biomasa adicional sobre terrenos desarbolados o agrícolas marginales.
   - **2. Densificaciones:** Enriquecimiento de masas abiertas o dehesas senescentes mediante la incorporación de nuevos pies.
   - **3. Cerramientos:** Exclusiones temporales de herbivoría para permitir el reclutamiento natural y recuperación de la cubierta de matorral.
2. **Conversión a Carbono y Dióxido de Carbono**:
   - $C = (AGB + BGB) \times CF$ ($0.50$ coníferas, $0.48$ frondosas).
   - $CO_2e = C \times \frac{44}{12}$.
3. **Actuaciones de Generación de Créditos y Criterios de Elegibilidad**:
   - **1. Plantaciones**: Terrenos agrícolas marginales o desarbolados sin cubierta previa reciente, garantizando no afección a hábitats prioritarios y densidad óptima con compromiso de permanencia > 30 años.
   - **2. Densificaciones**: Masas forestales o dehesas con cubierta deficiente o envejecida (FCC < 20-30%) y regeneración espontánea insuficiente, requiriendo enriquecimiento con protectores o exclusión ganadera.
   - **3. Cerramientos**: Exclusiones temporales del pastoreo y herbivoría (ganadera y cinegética) en masas con pies semilleros o regenerado incipiente que no logran desarrollarse debido a la presión herbívora.
   - *Verificación Documental:* Cada actuación requiere adjuntar la **Memoria Técnica o Justificación de Criterios de Elegibilidad en formato PDF** en el Paso 1 para habilitar el cálculo.

---

## 🌐 Integración en tu Web (WordPress u otros CMS)

Al estar construida con tecnología estándar web que corre en el navegador del cliente (HTML5 + CSS + JavaScript ESM), puedes:
1. **Subirla a cualquier servidor web o subcarpeta** (ej. `https://idaf.es/calculadora-co2/`).
2. **Embeberla en cualquier página de WordPress** mediante un bloque HTML:
   ```html
   <iframe 
     src="https://idaf.es/calculadora-co2/" 
     style="width: 100%; height: 950px; border: none; border-radius: 12px;"
     title="Calculadora CO2RK IDAF">
   </iframe>
   ```
*(Consulta [`Codigo_app/docs/GUIA_INTEGRACION_WEB.md`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/Codigo_app/docs/GUIA_INTEGRACION_WEB.md) para más detalles).*

---

## 🌿 Identidad Corporativa IDAF

- **Verde Oscuro:** `Pantone 357 C` | `#005027` | `RGB: 0, 80, 39`
- **Verde Claro:** `Pantone 368 C` | `#76B72B` | `RGB: 118, 183, 43`
- **Tipografía Oficial:** **Poppins** (Google Fonts).

---

## 📌 Próximos Pasos

A medida que se aporte la información específica paso a paso:
- Calibrar las ecuaciones alométricas y tablas de cubicación locales.
- Incorporar normativas regionales o condicionantes selvícolas adicionales.
- Ajustar las columnas o formatos personalizados de los inventarios que subirán los usuarios.
