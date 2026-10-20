/**
 * GESTOR DE REPORTES Y EXPORTACIÓN (EXCEL / PDF)
 * Calculadora CO2RK
 */

export class ReportManager {
  /**
   * Imprime o exporta a PDF el informe actual usando la ventana de impresión optimizada
   */
  static printReport() {
    window.print();
  }

  /**
   * Exporta la tabla de proyección año a año a un archivo Excel (.xlsx) usando SheetJS
   */
  static exportProjectionToExcel(yearlyData, summary, standOrInventoryName = "Proyectos_Absorcion_Carbono_IDAF") {
    /* global XLSX */
    if (typeof XLSX === 'undefined') {
      alert("Librería SheetJS no encontrada para exportar.");
      return;
    }

    // Hoja 1: Resumen ejecutivo
    const summaryRows = [
      { Parametro: "Elemento Evaluado", Valor: standOrInventoryName },
      { Parametro: "Superficie Total (ha)", Valor: summary.totalAreaHa },
      { Parametro: "Periodo de Acreditación (Años)", Valor: summary.creditingPeriodYears },
      { Parametro: "Créditos Netos Totales (t CO2e)", Valor: summary.totalNetCredits },
      { Parametro: "Créditos Medios Anuales (t CO2e/año)", Valor: summary.averageAnnualCredits },
      { Parametro: "Créditos por Hectárea (t CO2e/ha)", Valor: summary.creditsPerHa },
      { Parametro: "Deducción Reserva de Riesgo (Buffer t CO2e)", Valor: summary.bufferCreditsDeducted },
      { Parametro: "Valoración Económica Estimada (€)", Valor: summary.estimatedEconomicValueEur },
      { Parametro: "Fecha de Cálculo", Valor: new Date().toLocaleDateString('es-ES') }
    ];

    // Hoja 2: Proyección anual detallada
    const detailRows = yearlyData.map(d => ({
      "Año": d.year,
      "Edad Masa": d.standAge ?? '-',
      "Stock CO2 Línea Base Total (t CO2e)": Math.round(d.baselineCO2Total || 0),
      "Stock CO2 Proyecto Total (t CO2e)": Math.round(d.projectCO2Total || 0),
      "Adicionalidad Total (t CO2e)": Math.round(d.additionalCO2Total || 0),
      "Stock CO2 Línea Base (t CO2e/ha)": Math.round((d.baselineCO2PerHa || 0) * 100) / 100,
      "Stock CO2 Proyecto (t CO2e/ha)": Math.round((d.projectCO2PerHa || 0) * 100) / 100,
      "Adicionalidad (t CO2e/ha)": Math.round((d.additionalCO2PerHa || 0) * 100) / 100,
      "Créditos Brutos Anuales (t CO2e/año)": Math.round(d.annualGrossCreditsTotal || 0),
      "Créditos Netos Anuales (t CO2e/año)": Math.round(d.annualNetCreditsTotal || 0),
      "Créditos Netos Acumulados (t CO2e)": Math.round(d.cumulativeNetCreditsTotal || 0)
    }));

    const wb = XLSX.utils.book_new();

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Ejecutivo");

    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Proyeccion Anual");

    const cleanFilename = `${standOrInventoryName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Resultados_CO2.xlsx`;
    XLSX.writeFile(wb, cleanFilename);
  }
}
