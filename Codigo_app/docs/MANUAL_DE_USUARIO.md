# Manual de Usuario y Guía Técnica de Operación
## Plataforma Digital para Proyectos de Absorción de Carbono Forestal (IFM / MGF)
### Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)

---

> **Documento Oficial de IDAF (Edición 2026)**  
> **Metodología Científica de Referencia:** LIFE Deliverable D6.2 (Ruiz-Peinado et al., 2012 / Montero et al., 2020)  
> **Formato PDF Oficial Disponible:** [`Manual_Usuario_Calculadora_IDAF.pdf`](../../Manual_Usuario_Calculadora_IDAF.pdf) o en [`Codigo_app/docs/Manual_Usuario_Calculadora_IDAF.pdf`](Manual_Usuario_Calculadora_IDAF.pdf)  
> **Versión Web Interactiva e Imprimible:** [`MANUAL_USUARIO_IDAF.html`](MANUAL_USUARIO_IDAF.html)

---

## 📑 Índice General

1. [Principios de la Plataforma y Privacidad](#1-principios-de-la-plataforma-y-privacidad)
2. [Pantalla de Inicio de Sesión (login.html)](#2-pantalla-de-inicio-de-sesión-loginhtml)
3. [Paso 1: Datos Generales, Elegibilidad y Delimitación KML](#3-paso-1-datos-generales-elegibilidad-y-delimitación-kml)
4. [Paso 2: Inventario Forestal Pie a Pie (CSV/Excel) y Densidad](#4-paso-2-inventario-forestal-pie-a-pie-csvexcel-y-densidad)
5. [Paso 3: Resultados, Curvas de Absorción y Certificación](#5-paso-3-resultados-curvas-de-absorción-y-certificación)
6. [Resumen Comparativo de las 3 Actuaciones](#6-resumen-comparativo-de-las-3-actuaciones)
7. [Preguntas Frecuentes (FAQ) y Soporte](#7-preguntas-frecuentes-faq-y-soporte)

---

## 1. Principios de la Plataforma y Privacidad

La **Plataforma Digital para Proyectos de Absorción de Carbono de IDAF** es una herramienta especializada para técnicos forestales, evaluadores y propietarios. Su diseño se rige por tres pilares fundamentales:

1. **Arquitectura 100% Client-Side:** Toda la matemática alométrica, el procesado de las delimitaciones geográficas (`.kml`) y el análisis árbol a árbol (`.csv` / `.xlsx`) se ejecuta localmente en la memoria del navegador web mediante JavaScript nativo, SheetJS y Leaflet. **Ningún dato confidencial se envía a servidores externos.**
2. **Rigor Científico Aditivo (LIFE D6.2):** Aplicación estricta de las ecuaciones alométricas por fracciones de **Ruiz-Peinado et al. (2012)** para fuste (\(B_f\)), ramas gruesas y medias (\(B_r\)) y raíces (\(B_{rad}\)) en *Quercus suber* y especies acompañantes, junto a las ecuaciones de biomasa arbustiva de **Montero et al. (2020)**.
3. **Regla de No Precarga:** La herramienta nunca precarga datos ficticios. Requiere la subida real del inventario forestal y de la delimitación perimetral de la finca.

---

## 2. Pantalla de Inicio de Sesión (`login.html`)

Al iniciar la aplicación mediante `INICIAR_APP.bat` o accediendo a `login.html`, se presenta el panel de autenticación corporativo:

```text
+-------------------------------------------------------------------------+
|                                IDAF LOGO                                |
|             Plataforma Digital de Absorción de Carbono                  |
|                                                                         |
|    [BOTON 1]  [ G Iniciar sesión con Google                           ] |
|                                                                         |
|                                   --- o bien ---                        |
|                                                                         |
|    [BOTON 2]  [ > Acceder en Modo Demo / Invitado Técnico             ] |
+-------------------------------------------------------------------------+
```

### Tabla de Botones y Acciones en Pantalla de Login:

| Elemento Recuadrado | Tipo de Botón | ¿Cuándo Utilizarlo? | Acción Ejecutada |
| :--- | :--- | :--- | :--- |
| **`[BOTÓN 1]`** | `Iniciar sesión con Google` | Técnicos de IDAF o clientes con cuentas Google corporativas autorizadas. | Valida credenciales contra Google GIS (OAuth 2.0) y personaliza el perfil técnico en cabecera. |
| **`[BOTÓN 2]`** | `Acceder en Modo Demo / Invitado Técnico` | Evaluadores externos, propietarios o trabajo de campo sin conexión / sin cuenta Google configurada. | Otorga acceso instantáneo como técnico invitado sin pantallas intermedias ni necesidad de registro. |

---

## 3. Paso 1: Datos Generales, Elegibilidad y Delimitación KML

En este paso se introduce la información registral y territorial de la finca, se justifica la elegibilidad mediante la memoria técnica en PDF y se verifica la cartografía satelital.

### Caso Práctico Guiado: Finca "La Dehesilla y El Robledal" (Córdoba)

A continuación se detalla la información exacta a colocar en cada recuadro:

```text
+---------------------------------------------------------------------------------------------+
| PASO 1: DATOS GENERALES DEL PROYECTO FORESTAL                                               |
+---------------------------------------------------------------------------------------------+
| [CAMPO 1] Nombre del Proyecto: [ Proyecto Fijación Carbono La Dehesilla                   ] |
| [CAMPO 2] Titular / Propietario: [ Agropecuaria Sierra Morena S.L.                        ] |
| [CAMPO 3] NIF / CIF del Titular: [ B-14987654                                             ] |
| [CAMPO 4] Finca o Monte: [ Finca La Dehesilla y El Robledal                               ] |
| [CAMPO 5] Comunidad Autónoma: [ Andalucía v ]                                               |
| [CAMPO 6] Provincia: [ Córdoba                                                            ] |
| [CAMPO 7] Término Municipal: [ Cardeña                                                    ] |
| [CAMPO 8] Referencia Catastral: [ 14016A014000250000EK                                     ] |
| [CAMPO 9] Especie Principal: [ Quercus suber (Alcornoque) v ]                               |
| [CAMPO 10] Régimen Actual: [ Monte alcornocal adehesado en régimen extensivo v ]             |
| [CAMPO 11 - CLAVE] Actuación: [ 2. Densificaciones v ]                                      |
+---------------------------------------------------------------------------------------------+
| [RECUADRO 12] Criterios de Elegibilidad & Subida Memoria PDF                                |
|   ✓ Masa con baja espesura  ✓ Sin regeneración suficiente  ✓ Compromiso 30 años             |
|   [ Arrastra aquí: Memoria_Tecnica_La_Dehesilla.pdf                                       ] |
+---------------------------------------------------------------------------------------------+
| [RECUADRO 13] Delimitación Cartográfica KML                                                 |
|   [ Arrastra aquí: ejemplo_delimitacion_finca.kml                                         ] |
+---------------------------------------------------------------------------------------------+
| [RECUADRO 14] Visor Leaflet Satélite | Superficie Calculada: [ 45.20 ha ] (Automática)      |
+---------------------------------------------------------------------------------------------+
| [BOTÓN 15] [ Continuar a Inventario Forestal (Paso 2) ->                                  ] |
+---------------------------------------------------------------------------------------------+
```

### Tabla de Especificación de Campos y Botones (Paso 1):

| Nº Recuadro | Control | Valor Exacto a Rellenar | Regla Técnica y Justificación |
| :---: | :--- | :--- | :--- |
| **`[1]`** | Campo de texto | `Proyecto Fijación Carbono La Dehesilla` | Título oficial que encabezará el informe PDF y la memoria pericial. |
| **`[2]`** | Campo de texto | `Agropecuaria Sierra Morena S.L.` | Titular acreditado en el Registro de la Propiedad. |
| **`[3]`** | Campo de texto | `B-14987654` | NIF/CIF para inscripción oficial en MITECO. |
| **`[4]`** | Campo de texto | `Finca La Dehesilla y El Robledal` | Denominación del coto o predio forestal. |
| **`[5-7]`** | Select / Textos | `Andalucía` / `Córdoba` / `Cardeña` | Ubicación geográfica requerida para las variables climáticas del modelo ex-ante. |
| **`[8]`** | Campo de texto | `14016A014000250000EK` | Código Catastral (Polígono 14, Parcela 25) para auditoría GIS. |
| **`[9]`** | Desplegable | `Quercus suber (Alcornoque)` | Asigna los coeficientes alométricos de biomasa de Ruiz-Peinado. |
| **`[10]`** | Desplegable | `Monte alcornocal adehesado` | Régimen selvícola previo. |
| **`[11]`** | Desplegable *(Clave)* | **`2. Densificaciones`** | **CRUCIAL:** Establece que la masa previa de adultos es la Línea de Base y se acreditará el nuevo enriquecimiento. |
| **`[12]`** | Dropzone PDF | Subir `Memoria_Tecnica_La_Dehesilla.pdf` | Documento técnico obligatorio que justifica la elegibilidad según la normativa. |
| **`[13]`** | Dropzone KML | Subir `ejemplo_delimitacion_finca.kml` | Archivo perimetral vectorial generado en Google Earth, QGIS o SIGPAC. |
| **`[14]`** | Visor Leaflet | Lectura automática: **`45.20 ha`** | Cálculo esférico automático. Este valor se traslada bloqueado al Paso 2. |
| **`[15]`** | Botón Principal | Pulsar `Continuar a Inventario Forestal` | Desbloquea y avanza a la pantalla del inventario pie a pie. |

---

## 4. Paso 2: Inventario Forestal Pie a Pie (CSV/Excel) y Densidad

En el Paso 2 se cargan las mediciones dendrométricas individuales de los árboles y se caracterizan el matorral y los parámetros de densificación.

```text
+---------------------------------------------------------------------------------------------+
| PASO 2: INVENTARIO FORESTAL PIE A PIE Y PARÁMETROS DE LA MASA                               |
+---------------------------------------------------------------------------------------------+
| [BOTÓN 1] [ Descargar Plantilla CSV ]   [ Descargar Plantilla Excel ]                       |
|                                                                                             |
| [CAMPO 2] Periodo: [ 30 años ]   Buffer Riesgo: [ 15 % ]   Precio CO2: [ 25.0 €/t ]         |
|                                                                                             |
| [RECUADRO 3] Carga de Inventario: [ plantilla_inventario_rodales.csv ] (30 árboles)         |
|                                                                                             |
| [CAMPO 4] Modalidad: (*) Muestreo en Parcelas   ( ) Censo Completo 100% de la Finca         |
| [CAMPO 5] Sup. Finca KML: [ 45.20 ha ] (Bloqueado)  | Sup. Muestreada: [ 1.00 ha ]          |
| [RECUADRO 6] Densidad Resultante: [ 30 pies/ha ] -> (1,356 árboles en finca)                |
|                                                                                             |
| [CAMPO 7] Matorral: Tipo [ A19 - Mancha ]  FCC: [ 25 % ]  Altura: [ 9.0 dm ] -> 2.45 t/ha   |
| [CAMPO 8] Masa & Actuación: Edad: [ 45 años ]  Potencial: [ 0.85 ]  Densidad Añadida: [ 150 ]|
|                                                                                             |
| [RECUADRO 9] Resumen: 30 pies | DBH: 20.3 cm | Alt: 6.4 m | Bio: 218.4 kg/pie | 0.40 t/pie  |
| [RECUADRO 10] Tabla Alométrica Pie a Pie: ARB_001, ARB_002... Desglose Bf, Br, Brad, Total  |
|                                                                                             |
| [BOTÓN 11] [ Ejecutar Cálculos y Ver Resultados (Paso 3) ->                               ] |
+---------------------------------------------------------------------------------------------+
```

### Tabla de Especificación de Campos y Botones (Paso 2):

| Nº Recuadro | Control | Valor a Rellenar (Caso) | Justificación y Regla Científica |
| :---: | :--- | :--- | :--- |
| **`[1]`** | Botones de enlace | Clic para descargar | Descarga las plantillas oficiales vacías (`.csv` o `.xlsx`) con cabecera: `ID,Especie,DBH,Altura`. |
| **`[2]`** | Inputs numéricos | `30` años / `15` % / `25.0` € | Años del proyecto (estándar MITECO), buffer de seguridad retenido (15%) y precio de venta unitario. |
| **`[3]`** | Dropzone de datos | Subir `plantilla_inventario_rodales.csv` | Procesa en el cliente los 30 árboles muestreados con cálculo alométrico instantáneo. |
| **`[4]`** | Radiobutton | `Muestreo en Parcelas` | Permite extrapolar los datos de la parcela muestreada a la superficie global del KML. |
| **`[5]`** | Inputs de superficie | KML: `45.20 ha` / Muestra: `1.00 ha` | Superficie real del muestreo. Si se hiciera censo completo al 100%, la sup. muestreada igualaría al KML. |
| **`[6]`** | Indicador resultante | **`30 pies/ha`** / `1,356 árboles` | \(\text{Densidad} = 30 / 1.0 = 30\text{ pies/ha}\). Total finca: \(30 \times 45.20 = 1,356\) árboles adultos. |
| **`[7]`** | Selects matorral | `A19` / FCC: `25%` / `9.0 dm` | Aplica el modelo de Montero et al. (2020) Tabla 4 de D6.2, arrojando una biomasa de sotobosque de **2.45 t/ha**. |
| **`[8]`** | Inputs actuación | Edad: `45` / Pot: `0.85` / **`150 pies/ha`** | Enriquecimiento previsto: se plantarán 150 nuevos alcornoques por hectárea con protección individual. |
| **`[9]`** | Tarjetas resumen | Valores medios automáticos | Resume dendrometría: DBH medio 20.3 cm, altura media 6.4 m, biomasa 218.4 kg peso seco por árbol. |
| **`[10]`** | Tabla interactiva | Desglose por árbol | Permite auditar que cada árbol individual computa su fuste (\(B_f\)), ramas gruesas y raíces (\(B_{rad}\)). |
| **`[11]`** | Botón Principal | Pulsar `Ejecutar Cálculos` | Lanza el motor dinámico ex-ante y abre la pantalla final de resultados. |

---

## 5. Paso 3: Resultados, Curvas de Absorción y Certificación

El Paso 3 ofrece la síntesis económica y ambiental del proyecto forestal, con gráficos temporales y herramientas de descarga:

```text
+---------------------------------------------------------------------------------------------+
| PASO 3: CUADRO DE MANDOS DE ABSORCIÓN Y CERTIFICACIÓN OFICIAL                               |
+---------------------------------------------------------------------------------------------+
| [RECUADRO 1] Certificación Metodológica LIFE Deliverable D6.2 (Ruiz-Peinado 2012 / IDAF)    |
|                                                                                             |
| [RECUADRO 2] Tarjetas de Indicadores Clave (KPIs):                                          |
|   * Créditos Netos Totales:   3,142.80 t CO2e  (Acumulado verificable a 30 años)            |
|   * Créditos Medios Anuales:    104.76 t CO2e/año                                           |
|   * Rendimiento por Hectárea:    69.53 t CO2e/ha                                            |
|   * Valor Económico Estimado:   78,570 €       (A 25.0 €/t CO2e)                            |
|   * Reserva de Riesgo (Buffer):  554.61 t CO2e  (15% retenido en garantía)                  |
|                                                                                             |
| [RECUADRO 3] Gráfico Stock Carbono (t CO2e): Comparativa Línea Base (azul) vs Proyecto (verde|
| [RECUADRO 4] Gráfico Créditos Carbono: Barras anuales verificables + Línea acumulada ascendente
|                                                                                             |
| [RECUADRO 5] Tabla Año a Año (Años 1 a 30) | [BOTÓN 6] [ Exportar a Excel (.xlsx) ]         |
|                                                                                             |
| [BOTÓN 7] [ Emitir Informe Técnico Completo / Guardar PDF                                 ] |
+---------------------------------------------------------------------------------------------+
```

### Tabla de Botones y Entregables (Paso 3):

| Nº Recuadro | Control | Formato de Salida | Utilidad Técnica y Legal |
| :---: | :--- | :--- | :--- |
| **`[6]`** | `Exportar a Excel` | Archivo `.xlsx` | Descarga la tabla completa de 30 años con columnas de edad, stock en línea de base, stock de proyecto, adicionalidad bruta, descuento de buffer y créditos netos anuales. |
| **`[7]`** | `Emitir Informe Técnico Completo` | Documento `.pdf` | Genera el dossier oficial pericial con membrete IDAF, cartografía de la finca, datos de titularidad, metodología D6.2 y firmas técnicas para registro MITECO. |

---

## 6. Resumen Comparativo de las 3 Actuaciones

La calculadora adapta su lógica según la actuación elegida en el **Paso 1 (Campo 11)**:

| Característica | 1. Plantaciones | 2. Densificaciones *(Caso Guía)* | 3. Cerramientos de Regeneración |
| :--- | :--- | :--- | :--- |
| **Estado Inicial de la Finca** | Terreno desarbolado o agrícola marginal (0 pies/ha). | Masa abierta o envejecida con baja espesura. | Masa con regeneración impedida por sobrepastoreo/caza. |
| **Inventario en Paso 2** | No requiere inventario previo de adultos. | Requiere inventario (muestreo en parcelas o censo 100%). | Requiere inventario de los árboles adultos reproductores. |
| **Parámetro Específico a Colocar** | **Densidad de nueva plantación (pies/ha)** (ej. 400). | **Densidad añadida a plantar (pies/ha)** (ej. 150). | **Densidad regeneración esperada (pies/ha)** (ej. 250) + **FCC Meta Matorral** (ej. 55%). |
| **Línea de Base** | 0 t CO₂e (sin absorción arbórea previa). | Mantiene el stock y absorción del arbolado adulto preexistente. | Mantiene la masa sin reclutamiento (regeneración cero). |
| **Adicionalidad Acreditada** | 100% de la biomasa de la nueva masa forestal. | Exclusivamente el incremento generado por la nueva cohorte añadida. | Biomasa de los nuevos árboles regenerados + ganancia de matorral. |

---

## 7. Preguntas Frecuentes (FAQ) y Soporte

### 1. ¿Cómo genero el archivo KML de la finca?
Abre **Google Earth Pro** o **QGIS**, dibuja el contorno perimetral de las parcelas de la finca y selecciona `Guardar lugar como...` eligiendo la extensión `.kml`. Asegúrate de que no sea `.kmz` comprimido.

### 2. ¿Qué ocurre si un árbol no tiene registrada la altura?
Las ecuaciones de Ruiz-Peinado et al. (2012) requieren tanto el diámetro normal (`DBH` en cm) como la altura total (`Altura` en m). Se recomienda estimar la altura mediante la curva altura-diámetro local antes de subir el archivo.

### 3. ¿Se pierden los datos si recargo la página?
Por motivos estrictos de privacidad y protección de datos, la plataforma no almacena información en servidores en la nube. **Descarga siempre la hoja Excel y el Informe Técnico en PDF antes de cerrar la ventana.**

---

### Canales Oficiales de IDAF:
- **Entidad:** Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)
- **Sede:** Campus Universitario de Rabanales, Edif. Leonardo Da Vinci, 1ª Planta, 14014 Córdoba, España.
- **Correo de soporte:** `social@idaf.es`
- **Página web:** [www.idaf.es](https://www.idaf.es)
