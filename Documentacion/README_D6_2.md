# Carpeta de Documentación Técnica: LIFE D6.2 (IDAF)

Esta carpeta contiene el documento original del proyecto y los extractos estructurados generados durante el análisis e integración en la **Plataforma Digital para Proyectos de Absorción de Carbono**.

---

## Archivos Contenidos

| Archivo | Descripción |
| :--- | :--- |
| **`D6.2_CuantificacionBiomasaVivaIDAF.docx`** | Documento oficial Word original (7.9 MB): *Informe metodológico: Modelización de Flujos de Carbono en biomasa viva y en suelos en Monte Alcornocal (Andalucía y Alentejo) y en Hayedo (Marche)* (LIFE Initiative, IDAF). |
| **`D6.2_contenido_extraido.txt`** | Volcado completo de texto, párrafos y estructura del documento Word. |
| **`d6_2_tables.json`** | Todas las tablas del informe (Tablas 1 a 8) exportadas en formato JSON estructurado. |
| **`d6_2_tables_formatted.txt`** | Tablas principales (Tablas 2, 3, 4, 7 y 8) formateadas con símbolos matemáticos legibles. |
| **`d6_2_table8_formulas.txt`** | Fórmulas dinámicas de la Tabla 8 (modelos eco2for para especies acompañantes) con superíndices, exponentes y fracciones desglosadas. |
| **`sec3_paragraphs.txt`** | Extracto de la Sección 3 (Metodología de cálculo de biomasa aérea y procesamiento MLS/UAV). |

---

## Resumen de Modelos Implementados en la Calculadora

1. **Alometría Arbórea Aditiva (Ruiz-Peinado et al., 2012 / SUR):**
   * *Quercus suber* (Tabla 2):
     * Fuste: $B_f = 0.00525 \cdot d^2 \cdot h + 0.278 \cdot d \cdot h$
     * Ramas gruesas ($>7\text{ cm}$): $B_{r7} = 0.0135 \cdot d^2 \cdot h$
     * Ramas medias ($2\text{--}7\text{ cm}$): $B_{r2-7} = 0.127 \cdot d \cdot h$
     * Ramillas ($<2\text{ cm}$) + hojas: $B_{r2+h} = 0.0463 \cdot d \cdot h$
     * Raíces: $B_{rad} = 0.0829 \cdot d^2$
   * Especies acompañantes (Tabla 3): *Pinus pinea*, *Quercus ilex*, *Quercus faginea*, *Quercus pyrenaica*, *Quercus canariensis*, *Castanea sativa*, *Ceratonia siliqua*, *Olea europaea var. sylvestris*, *Celtis australis*, *Juglans regia*.

2. **Alometría de Matorral (Montero et al., 2020 - Tabla 4):**
   * 14 agrupaciones con $\theta = \arcsin(\sqrt{fcc/100})$ y altura en decímetros ($h$, $\text{dm}$).

3. **Modelo Ex-Ante para *Quercus suber* (Sección 6.1):**
   $$\text{tCO}_2\text{eq/pie}(t) = 0.0000737 \cdot \text{Edad}^{2.3816} \cdot e^{0.1451 \cdot \text{Potencialidad}}$$

4. **Modelos Ex-Ante eco2for para Acompañantes (Tabla 8):**
   * Estimaciones dinámicas en función de Edad ($T$), Densidad ($N$), Precipitación ($pp_m$), Temperatura ($t_m$) y De Martonne ($M$).

5. **3 Actuaciones de Proyecto:**
   * 1. Plantaciones
   * 2. Densificaciones
   * 3. Cerramientos (con exclusión de herbívoros y recuperación de matorral)
