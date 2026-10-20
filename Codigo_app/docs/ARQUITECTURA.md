# Arquitectura: Plataforma Digital para Proyectos de Absorción de Carbono (IDAF)

Esta plataforma ha sido diseñada con una **arquitectura modular, reactiva y desacoplada**, pensada específicamente para permitir:
1. **Alojamiento universal y sin costes de servidor**: Ejecución directa en el navegador del usuario (Client-Side Computing), lo que permite embeberla en cualquier web (WordPress, Wix, cPanel, Webflow, Vercel o hosting estático) mediante un simple `<iframe>` o subcarpeta.
2. **Privacidad total de datos agroforestales**: El procesamiento de archivos Excel/CSV se realiza en la memoria local del navegador del cliente; los datos del propietario nunca viajan a servidores de terceros.
3. **Escalabilidad por pasos**: Cada componente (modelos, base de datos de especies, normativas, fórmulas de cálculo y parsers) está separado en módulos independientes para que podamos ir incorporando tus ecuaciones, factores biométricos y reglas de negocio paso a paso.

---

## 1. Estructura del Proyecto

```text
Calculadora_CO2RK/
├── index.html                     # Interfaz web principal (UI responsiva)
├── css/
│   └── styles.css                 # Diseño moderno, tarjetas KPI, gráficos y soporte de impresión PDF
├── js/
│   ├── config.js                  # Constantes estequiométricas (44/12, ratios IPCC, buffers de riesgo)
│   ├── core/
│   │   ├── models.js              # Modelos de datos (Rodal, Escenario de Gestión, Simulación)
│   │   └── calculations.js        # Motor científico de cálculo de biomasa, carbono y créditos
│   ├── parsers/
│   │   └── fileParser.js          # Lector y validador de archivos Excel (.xlsx/.xls) y CSV
│   └── ui/
│       ├── app.js                 # Controlador reactivo entre UI, inputs y cálculos
│       ├── charts.js              # Gestor de gráficos interactivos (Chart.js)
│       └── report.js              # Exportación de resultados a Excel (.xlsx) y generación de PDF
├── data/
│   ├── species_database.json      # Catálogo de especies forestales y coeficientes biométricos
│   ├── regulations_database.json  # Regiones, normativas, tratamientos y estrategias IFM
│   └── templates/                 # Plantillas de datos para el usuario
│       ├── plantilla_inventario_rodales.csv
│       └── plantilla_inventario_rodales.xlsx
├── server/
│   ├── dev_server.py              # Servidor local de prueba rápido en Python (py server/dev_server.py)
│   └── generate_template_excel.py # Script generador de plantillas Excel
└── docs/
    ├── ARQUITECTURA.md            # Este documento
    └── GUIA_INTEGRACION_WEB.md    # Guía para incrustar la calculadora en tu web
```

---

## 2. Diagrama de Flujo de Datos

```text
[ Usuario ] ──── Carga Excel / CSV ó Formulario Manual 
                           │
                           ▼
                  [ FileParser / UI ] ── Valida encabezados y tipos
                           │
                           ▼
              [ ForestStand & Scenario ] ── Parámetros de rodal y proyecto
                           │
                           ▼
                 [ CarbonEngine ] ◄── Coeficientes de SpeciesDb & RegulationsDb
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   [ Proyección Año a Año ]   [ Créditos Netos & Buffer ]
              │                         │
              └────────────┬────────────┘
                           ▼
               [ Charts.js & ReportManager ]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
[ Gráficos en UI ]   [ Exportar Excel ]   [ Imprimir PDF ]
```

---

## 3. Modelo Matemático y Metodología Científica (LIFE D6.2)

### A. Ecuaciones Alométricas por Fracciones (Ruiz-Peinado et al., 2012 / Montero et al., 2005)
A diferencia de los modelos volumétricos simplificados, el sistema cuantifica la biomasa viva de forma aditiva por fracciones a partir de las mediciones pie a pie ($d$: DBH en cm, $h$: altura total en m):

1. **Biomasa Arbórea por Pie ($kg$ de peso seco)**:
   $$B_{total} = B_f + B_{r7} + B_{r2-7} + B_{r2+h} + B_{rad}$$
   - $B_f$: Biomasa del fuste.
   - $B_{r7}$: Biomasa de ramas gruesas (diámetro $> 7$ cm).
   - $B_{r2-7}$: Biomasa de ramas medias (diámetro $2$ a $7$ cm).
   - $B_{r2+h}$: Ramillas finas ($< 2$ cm) con hojas/acículas.
   - $B_{rad}$: Biomasa subterránea (raíces).

2. **Modelos Parametrizados**:
   - *Quercus suber* (Tabla 2 de D6.2).
   - 10 especies acompañantes mediterráneas (Tabla 3 de D6.2: *Pinus pinea*, *Quercus ilex*, *Quercus faginea*, *Quercus pyrenaica*, *Quercus canariensis*, *Castanea sativa*, *Ceratonia siliqua*, *Olea europaea*, *Celtis australis*, *Juglans regia*).

### B. Biomasa de Matorral (Montero et al., 2020 - Tabla 4 de D6.2)
Cuantificación del estrato arbustivo en $t\text{ M.S./ha}$ para 14 agrupaciones mediterráneas (A12 a A35 y EC_GENERAL) mediante:
$$\theta = \arcsin\left(\sqrt{\frac{FCC}{100}}\right) \quad (\text{en radianes})$$
$$B_{shrub} = a \cdot (h \cdot \theta)^{b_2} \quad \text{ó} \quad a \cdot ((h^{b_1}) \cdot \theta)^{b_2} \quad (h \text{ en decímetros, dm})$$

### C. Conversión a Carbono y Dióxido de Carbono Equivalente
1. **Stock de Carbono ($C$)**:
   $$C = B_{total} \times CF \quad (CF = 0.50 \text{ según Montero et al., 2005 / D6.2})$$
2. **Dióxido de Carbono Equivalente ($tCO_2e$)**:
   $$CO_2e = C \times \frac{44}{12} \approx C \times 3.6667$$

### D. Dinámica Temporal Ex-Ante y 3 Actuaciones de Proyecto
- **1. Plantaciones:** Nuevas repoblaciones sobre terreno desarbolado (Línea Base = 0 pies/ha). Se acredita el 100% de la biomasa adicional de los nuevos pies según el algoritmo ex-ante D6.2:
  $$\text{tCO}_2\text{e/pie}(t) = 0.0000737 \cdot \text{Edad}^{2.3816} \cdot e^{0.1451 \cdot \text{Potencialidad}}$$
- **2. Densificaciones:** Enriquecimiento de masas abiertas o adehesadas. La Línea Base mantiene el arbolado adulto preexistente; se acredita la nueva cohorte añadida ($N_{añadida}$).
- **3. Cerramientos:** Exclusiones temporales de herbívoros. Se acredita el reclutamiento de regeneración natural ($N_{regenerada}$) y la recuperación progresiva de cobertura y biomasa del matorral.
- **Créditos Netos Verificables:**
  $$\text{Créditos Netos} = \text{Créditos Brutos} \times (1 - \text{Buffer\%} - \text{Fugas\%})$$
  *(Deducción por defecto: 15% de Reserva de Riesgo de Permanencia y 5% de Fugas).*

---

## 4. Cómo iremos incorporando tu información paso a paso

A medida que me vayas proporcionando la documentación, datos y fórmulas:

1. **Si tienes fórmulas alométricas específicas o tablas de producción**:
   - Las incorporaremos directamente en [`js/core/calculations.js`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/js/core/calculations.js).
2. **Si tienes nuevas especies, coeficientes biométricos o factores locales**:
   - Se actualizan en [`data/species_database.json`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/data/species_database.json).
3. **Si tienes normativas autonómicas o provinciales concretas**:
   - Se configuran en [`data/regulations_database.json`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/data/regulations_database.json).
4. **Si el usuario debe subir un formato específico de Excel**:
   - Ajustaremos el mapeo inteligente en [`js/parsers/fileParser.js`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/js/parsers/fileParser.js) y la plantilla descargable.
