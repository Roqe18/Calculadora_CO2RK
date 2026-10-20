# Paquete de Demostración para el Equipo (Carpeta `Demo/`)
## Plataforma Digital para Proyectos de Absorción de Carbono Forestal
### Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)

---

Este directorio contiene **todos los datos, archivos vectoriales, memorias técnicas e inventarios necesarios** para realizar una **simulación completa en menos de 3 minutos** ante el equipo, colaboradores, técnicos o clientes.

Los datos corresponden exactamente al **caso práctico oficial del [Manual de Usuario](../../Manual_Usuario_Calculadora_IDAF.pdf)**:
* **Finca:** *"La Dehesilla y El Robledal"* en Cardeña (Sierra Morena, Córdoba).
* **Superficie:** `45.20 hectáreas` (delimitada en KML).
* **Especie:** *Quercus suber* (Alcornoque).
* **Actuación:** `2. Densificaciones` (enriquecimiento de alcornocal senescente con 150 pies/ha adicionales).

---

## 📂 Contenido de la Carpeta `Demo/`

| Archivo | Tipo | ¿Para qué sirve en la simulación? |
| :--- | :--- | :--- |
| [**`DATOS_A_COPIAR_Y_PEGAR.txt`**](DATOS_A_COPIAR_Y_PEGAR.txt) | Documento de texto | **Guía rápida de copia y pega.** Abre este archivo en un bloc de notas o editor y ve copiando directamente cada dato en la calculadora web. |
| [**`Delimitacion_Finca_La_Dehesilla.kml`**](Delimitacion_Finca_La_Dehesilla.kml) | Cartografía KML | **Perímetro pericial de la finca.** Se arrastra en el **Paso 1** en la zona de dropzone. Calcula automáticamente **45.20 ha** en el visor satelital Leaflet. |
| [**`Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf`**](Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf) | Documento PDF | **Memoria técnica obligatoria.** Se arrastra en el **Paso 1** en la zona de dropzone de elegibilidad. Documento pericial real con membrete y firma IDAF. |
| [**`Inventario_Forestal_La_Dehesilla.csv`**](Inventario_Forestal_La_Dehesilla.csv) | Hoja CSV | **Inventario pie a pie (30 árboles).** Se arrastra en el **Paso 2** para procesar las fracciones alométricas individuales de Ruiz-Peinado et al. (2012). |
| [**`Inventario_Forestal_La_Dehesilla.xlsx`**](Inventario_Forestal_La_Dehesilla.xlsx) | Hoja Excel | Versión en formato libro Excel (`.xlsx`) del mismo inventario forestal pie a pie de 30 árboles. |

---

## 🚀 Guía Rápida de Simulación en 3 Minutos

### 1. Iniciar la Calculadora
1. Ejecuta el archivo [`INICIAR_APP.bat`](../../INICIAR_APP.bat) en la raíz del proyecto.
2. En la pantalla de login (`login.html`), pulsa directamente sobre el botón verde:  
   👉 **`[ Acceder en Modo Demo / Invitado Técnico ]`**

---

### 2. Paso 1: Datos del Proyecto y Cartografía
Copia y pega los siguientes datos en el formulario:

| Campo en la Web | Valor a Copiar y Pegar |
| :--- | :--- |
| **Nombre del Proyecto** | `Proyecto Fijación Carbono La Dehesilla` |
| **Titular / Propietario** | `Agropecuaria Sierra Morena S.L.` |
| **NIF / CIF del Titular** | `B-14987654` |
| **Nombre de la Finca o Monte** | `Finca La Dehesilla y El Robledal` |
| **Comunidad Autónoma** | Selecciona `Andalucía` |
| **Provincia** | `Córdoba` |
| **Término Municipal** | `Cardeña` |
| **Referencia Catastral** | `14016A014000250000EK` |
| **Especie Principal / Masa** | Selecciona `Quercus suber (Alcornoque)` |
| **Régimen / Tratamiento Actual** | Selecciona `Monte alcornocal adehesado en régimen extensivo` |
| **Actuación / Estrategia (CLAVE)** | Selecciona **`2. Densificaciones`** |

**Archivos a arrastrar en Paso 1:**
* Arrastra [**`Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf`**](Memoria_Tecnica_Elegibilidad_La_Dehesilla.pdf) en el recuadro de la memoria justificativa.
* Arrastra [**`Delimitacion_Finca_La_Dehesilla.kml`**](Delimitacion_Finca_La_Dehesilla.kml) en el recuadro de cartografía.  
  *(Verás cómo el mapa satelital se centra en Cardeña y calcula automáticamente **Superficie: 45.20 ha**)*.
* Pulsa el botón: **`[ Continuar a Inventario Forestal (Paso 2) -> ]`**

---

### 3. Paso 2: Inventario Pie a Pie y Parámetros
Configura los valores del modelo:

1. **Parámetros Generales:**
   * Periodo de Acreditación: `30` años.
   * Buffer de Riesgo: `15` %.
   * Precio Orientativo: `25.0` €/t CO₂e.
2. **Subida de Inventario:**
   * Arrastra [**`Inventario_Forestal_La_Dehesilla.csv`**](Inventario_Forestal_La_Dehesilla.csv) o [**`Inventario_Forestal_La_Dehesilla.xlsx`**](Inventario_Forestal_La_Dehesilla.xlsx) en la zona de carga.
   * Se procesarán instantáneamente los 30 árboles y aparecerá el desglose alométrico por fracciones (Fuste \(B_f\), Ramas \(B_r\), Raíces \(B_{rad}\)).
3. **Modalidad de Muestreo y Densidad:**
   * Marca: `(*) Muestreo en Parcelas (extrapolación a finca)`.
   * Superficie muestreada: `1.00` ha.  
     *(La densidad calculada será de **30 pies/ha** y se extrapolará a **1,356 árboles en la finca**)*.
4. **Matorral (Montero et al., 2020):**
   * Tipo: `A19 – Mancha mediterránea`.
   * FCC (%): `25`.
   * Altura media (dm): `9.0` (biomasa estimada: `2.45 t/ha`).
5. **Parámetros de la Actuación (Densificación):**
   * Edad actual estimada: `45` años.
   * Potencialidad: `0.85`.
   * Densidad añadida a plantar: `150` pies/ha.
6. Pulsa el botón: **`[ Ejecutar Cálculos y Ver Resultados (Paso 3) -> ]`**

---

### 4. Paso 3: Resultados Esperados para Mostrar al Equipo

Al entrar en la pantalla final, se muestra el cuadro de mandos con certificación científica **LIFE D6.2 (IDAF)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Créditos Netos Totales:     3,142.80 t CO₂e  (Acumulado a 30 años)    │
│  Créditos Medios Anuales:      104.76 t CO₂e/año                       │
│  Rendimiento por Hectárea:      69.53 t CO₂e/ha                        │
│  Valor Económico Estimado:   78,570.00 €       (A 25 €/t CO₂e)         │
│  Reserva Buffer Retenida:      554.61 t CO₂e  (15% no comercializable) │
└────────────────────────────────────────────────────────────────────────┘
```

**Puntos destacados para enseñar al equipo:**
* **Gráfico de Evolución del Stock:** Muestra la comparativa entre la Línea de Base vegetativa preexistente (curva azul) y el Proyecto IFM con densificación (curva verde).
* **Gráfico de Créditos:** Demuestra la entrega anual verificable y la curva acumulada ascendente.
* **Descarga en Excel:** Al hacer clic en `[ Exportar a Excel (.xlsx) ]`, se descarga la auditoría completa de los 30 años.
* **Emisión de Informe Pericial:** Al hacer clic en `[ Emitir Informe Técnico Completo ]`, se genera el dossier PDF oficial para presentar ante el Registro MITECO.

---

*IDAF • Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. • Edición 2026*
