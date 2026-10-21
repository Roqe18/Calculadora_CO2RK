/**
 * MÓDULO EXPORTADOR Y PUENTE DE DATOS - IDAF CAMPO
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 * Genera CSV/XLSX compatibles con FileParser y realiza la transferencia en 1 clic al Paso 2.
 */

export class FieldExporter {
  /**
   * Sanitiza un nombre para usarlo en nombres de archivos
   */
  static sanitizeFilename(name) {
    if (!name) return 'inventario_campo';
    return name.toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_");
  }

  /**
   * Genera el texto CSV estándar (ID,Especie,DBH,Altura) con BOM UTF-8
   */
  static generateCSV(plot) {
    const trees = plot?.trees || [];
    const lines = ['ID,Especie,DBH,Altura'];

    trees.forEach(t => {
      const id = (t.id || '').replace(/,/g, '');
      const species = (t.speciesScientific || t.speciesName || t.speciesId || 'Quercus suber').replace(/,/g, '');
      const dbh = typeof t.dbh === 'number' ? t.dbh.toFixed(1) : parseFloat(t.dbh || 0).toFixed(1);
      const height = typeof t.height === 'number' ? t.height.toFixed(1) : parseFloat(t.height || 0).toFixed(1);

      lines.push(`${id},${species},${dbh},${height}`);
    });

    // Agregar BOM \uFEFF para que Excel reconozca tildes y caracteres especiales automáticamente
    return '\uFEFF' + lines.join('\r\n');
  }

  /**
   * Descarga el archivo CSV en el dispositivo del usuario
   */
  static downloadCSV(plot) {
    const csvContent = this.generateCSV(plot);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const safeName = this.sanitizeFilename(plot.name || plot.fincaNombre || 'rodal');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `inventario_${safeName}_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return filename;
  }

  /**
   * Descarga archivo Excel (.xlsx) usando SheetJS si está disponible
   */
  static downloadXLSX(plot) {
    /* global XLSX */
    if (typeof XLSX === 'undefined') {
      throw new Error("La librería SheetJS no está disponible en este momento.");
    }

    const trees = plot?.trees || [];
    const data = [
      ['ID', 'Especie', 'DBH', 'Altura']
    ];

    trees.forEach(t => {
      data.push([
        t.id,
        t.speciesScientific || t.speciesName || 'Quercus suber',
        typeof t.dbh === 'number' ? t.dbh : parseFloat(t.dbh || 0),
        typeof t.height === 'number' ? t.height : parseFloat(t.height || 0)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario_Arboles");

    const safeName = this.sanitizeFilename(plot.name || plot.fincaNombre || 'rodal');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `inventario_${safeName}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
    return filename;
  }

  /**
   * Prepara el paquete de transferencia directa a la Calculadora IDAF vía LocalStorage
   * Incluye tanto los datos del Proyecto (Paso 1) como del Inventario y Matorral (Paso 2)
   */
  static preparePlatformImport(plot) {
    const csvData = this.generateCSV(plot);
    const packet = {
      source: 'idaf_field_pwa',
      exportedAt: Date.now(),
      plotId: plot.id,
      plotName: plot.name || 'Rodal de campo',
      fincaNombre: plot.fincaNombre || 'Finca Principal',
      actuacion: plot.actuacion || 'densificacion',
      // Datos de Proyecto (Paso 1)
      project: {
        name: plot.projectName || plot.name || 'Proyecto de Absorción Forestal',
        owner: plot.owner || 'Titular de la Finca',
        nif: plot.nif || 'B12345678',
        estate: plot.fincaNombre || 'Finca Principal',
        province: plot.province || 'Huelva',
        municipality: plot.municipality || 'Municipio Forestal',
        cadastral: plot.cadastral || '',
        speciesId: plot.primarySpecies || (plot.trees?.[0]?.speciesId) || 'quercus_suber',
        strategyId: plot.actuacion || 'densificacion',
        totalAreaHa: parseFloat(plot.totalAreaHa) || 15.0
      },
      // Datos de Inventario y Matorral (Paso 2)
      inventory: {
        modalidad: plot.modalidad || 'muestreo',
        superficieMuestreadaHa: parseFloat(plot.superficieMuestreadaHa) || 1.0,
        edadMasa: parseInt(plot.edadMasa, 10) || 45,
        potencialidad: parseFloat(plot.potencialidad) || 0.85,
        shrub: {
          tipo: plot.matorral?.tipo || 'A19',
          fccPct: parseFloat(plot.matorral?.fccPct !== undefined ? plot.matorral.fccPct : 20),
          alturaMediaDm: parseFloat(plot.matorral?.alturaMediaDm !== undefined ? plot.matorral.alturaMediaDm : 8.0),
          fccTarget: parseFloat(plot.matorral?.fccTarget !== undefined ? plot.matorral.fccTarget : 55.0)
        },
        treesCount: (plot.trees || []).length,
        csvText: csvData,
        filename: `campo_${this.sanitizeFilename(plot.name || 'rodal')}.csv`
      },
      // Compatibilidad retroactiva con accesos directos
      modalidad: plot.modalidad || 'muestreo',
      superficieMuestreadaHa: parseFloat(plot.superficieMuestreadaHa) || 1.0,
      edadMasa: parseInt(plot.edadMasa, 10) || 45,
      potencialidad: parseFloat(plot.potencialidad) || 0.85,
      matorral: plot.matorral || {
        tipo: 'A19',
        fccPct: 20,
        alturaMediaDm: 8,
        fccTarget: 55
      },
      treesCount: (plot.trees || []).length,
      csvText: csvData,
      filename: `campo_${this.sanitizeFilename(plot.name || 'rodal')}.csv`
    };

    localStorage.setItem('idaf_field_pending_import', JSON.stringify(packet));
    return packet;
  }
}
