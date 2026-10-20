/**
 * PARSER Y VALIDADOR DE ARCHIVOS EXCEL Y CSV A NIVEL DE ÁRBOL INDIVIDUAL (D6.2)
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 * Procesa inventarios pie a pie con columnas: ID, Especie, DBH, Altura
 * y calcula inmediatamente las fracciones de biomasa de Ruiz-Peinado et al. (2012)
 */

import { CONFIG } from '../config.js';
import { CarbonEngine } from '../core/calculations.js';

export class FileParser {
  /**
   * Normaliza un string para búsqueda flexible de encabezados
   */
  static normalizeHeader(text) {
    if (!text) return '';
    return text.toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
      .replace(/[^a-z0-9]/g, "_")     // Reemplazar espacios y caracteres raros por _
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  /**
   * Identifica qué campo del modelo corresponde a cada columna del archivo
   */
  static mapColumns(headers) {
    const mapping = {};
    const normHeaders = headers.map(h => ({ raw: h, norm: this.normalizeHeader(h) }));

    for (const [field, aliases] of Object.entries(CONFIG.COLUMN_ALIASES)) {
      for (const h of normHeaders) {
        if (aliases.includes(h.norm)) {
          mapping[field] = h.raw;
          break;
        }
      }
    }

    return mapping;
  }

  /**
   * Empareja el nombre de especie del usuario con el ID de la base de datos
   */
  static matchSpeciesId(speciesText, speciesList) {
    if (!speciesText) return speciesList[0]?.id || 'quercus_suber';
    const query = this.normalizeHeader(speciesText);

    // 1. Coincidencia exacta por ID
    const exactId = speciesList.find(s => s.id === query);
    if (exactId) return exactId.id;

    // 2. Coincidencia en nombre científico o nombre común
    const found = speciesList.find(s => {
      const sci = this.normalizeHeader(s.scientific_name);
      const com = this.normalizeHeader(s.common_name);
      return sci.includes(query) || com.includes(query) || query.includes(sci) || query.includes(com);
    });

    if (found) return found.id;

    // 3. Búsqueda por palabras clave familiares
    if (query.includes('alcornoque') || query.includes('suber')) return 'quercus_suber';
    if (query.includes('pinonero') || query.includes('pinea')) return 'pinus_pinea';
    if (query.includes('encina') || query.includes('ilex')) return 'quercus_ilex';
    if (query.includes('quejigo') || query.includes('faginea')) return 'quercus_faginea';
    if (query.includes('melojo') || query.includes('rebollo') || query.includes('pyrenaica')) return 'quercus_pyrenaica';
    if (query.includes('canariensis')) return 'quercus_canariensis';
    if (query.includes('castano') || query.includes('castanea')) return 'castanea_sativa';
    if (query.includes('algarrobo') || query.includes('siliqua')) return 'ceratonia_siliqua';
    if (query.includes('acebuche') || query.includes('olea') || query.includes('olivo')) return 'olea_europaea';
    if (query.includes('almez') || query.includes('celtis')) return 'celtis_australis';
    if (query.includes('nogal') || query.includes('juglans')) return 'juglans_regia';
    if (query.includes('pinaster')) return 'pinus_pinaster';
    if (query.includes('pino')) return 'pinus_pinea';
    if (query.includes('haya') || query.includes('fagus')) return 'fagus_sylvatica';

    return speciesList[0]?.id || 'quercus_suber';
  }

  /**
   * Procesa un ArrayBuffer o texto crudo con SheetJS (XLSX/CSV) a nivel de árbol
   */
  static parseWorkbook(data, speciesList = []) {
    /* global XLSX */
    if (typeof XLSX === 'undefined') {
      throw new Error("La librería SheetJS (XLSX) no está cargada en el navegador.");
    }

    const readType = (data instanceof ArrayBuffer) ? 'array' : 'binary';
    const workbook = XLSX.read(data, { type: readType, cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    
    // Convertir hoja a matriz de objetos JSON
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    if (!rawRows || rawRows.length === 0) {
      throw new Error("El archivo subido está vacío o no contiene filas con datos de árboles.");
    }

    const rawHeaders = Object.keys(rawRows[0]);
    const columnMap = this.mapColumns(rawHeaders);

    const trees = [];
    const validationIssues = [];
    const speciesCounter = {};

    let sumDbh = 0;
    let sumHeight = 0;
    let sumBiomassKg = 0;
    let sumCO2Kg = 0;

    // Helper robusto para parsear decimales españoles (coma o punto)
    const parseDecimal = (val) => {
      if (typeof val === 'number') return isNaN(val) ? NaN : val;
      if (val === null || val === undefined || val === '') return NaN;
      const str = String(val).trim().replace(',', '.');
      return parseFloat(str);
    };

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // +1 por 1-index y +1 por la fila de encabezados

      // 1. Extraer ID del árbol
      const idVal = row[columnMap.id] || `ARB_${String(index + 1).padStart(3, '0')}`;
      
      // 2. Extraer Especie
      const speciesRaw = row[columnMap.species] || '';
      const matchedSpeciesId = this.matchSpeciesId(speciesRaw, speciesList);
      const spObj = speciesList.find(s => s.id === matchedSpeciesId);
      const speciesName = spObj ? spObj.common_name : matchedSpeciesId;

      speciesCounter[speciesName] = (speciesCounter[speciesName] || 0) + 1;

      // 3. Extraer DBH y Altura (soporta tanto coma española como punto decimal)
      const dbhRaw = row[columnMap.dbh];
      const heightRaw = row[columnMap.height];

      let dbhVal = parseDecimal(dbhRaw);
      let heightVal = parseDecimal(heightRaw);

      if (isNaN(dbhVal) || dbhVal <= 0) {
        validationIssues.push(`Fila ${rowNum} (${idVal}): DBH inválido o ausente (${dbhRaw}). Se asigna valor medio 18.0 cm.`);
        dbhVal = 18.0;
      }

      if (isNaN(heightVal) || heightVal <= 0) {
        validationIssues.push(`Fila ${rowNum} (${idVal}): Altura inválida o ausente (${heightRaw}). Se asigna valor medio 6.0 m.`);
        heightVal = 6.0;
      }

      // 4. Calcular fracciones de biomasa con Ruiz-Peinado et al. (2012)
      const fractions = CarbonEngine.calculateRuizPeinadoBiomass(matchedSpeciesId, dbhVal, heightVal);
      const treeTotalKg = fractions.totalKg;
      const treeCO2Kg = (treeTotalKg * CONFIG.CARBON_FRACTION_DEFAULT) * CONFIG.CO2_C_RATIO;
      const treeCO2Tons = treeCO2Kg / 1000;

      sumDbh += dbhVal;
      sumHeight += heightVal;
      sumBiomassKg += treeTotalKg;
      sumCO2Kg += treeCO2Kg;

      trees.push({
        id: String(idVal).trim(),
        speciesId: matchedSpeciesId,
        speciesName: speciesName,
        dbh: Math.round(dbhVal * 10) / 10,
        height: Math.round(heightVal * 10) / 10,
        stemKg: Math.round(fractions.stem * 10) / 10,
        thickBranchesKg: Math.round(fractions.thickBranches * 10) / 10,
        medBranchesKg: Math.round(fractions.medBranches * 10) / 10,
        thinBranchesLeavesKg: Math.round(fractions.thinBranchesLeaves * 10) / 10,
        rootsKg: Math.round(fractions.roots * 10) / 10,
        totalBiomassKg: Math.round(treeTotalKg * 10) / 10,
        co2Kg: Math.round(treeCO2Kg * 10) / 10,
        co2Tons: treeCO2Tons
      });
    });

    const totalCount = trees.length;
    const meanDbh = totalCount > 0 ? (sumDbh / totalCount) : 0;
    const meanHeight = totalCount > 0 ? (sumHeight / totalCount) : 0;
    const meanBiomassKg = totalCount > 0 ? (sumBiomassKg / totalCount) : 0;
    const meanCO2PerTree = totalCount > 0 ? ((sumCO2Kg / 1000) / totalCount) : 0;

    const summary = {
      totalTrees: totalCount,
      meanDbh: Math.round(meanDbh * 10) / 10,
      meanHeight: Math.round(meanHeight * 10) / 10,
      totalBiomassKg: Math.round(sumBiomassKg * 10) / 10,
      totalBiomassTons: Math.round((sumBiomassKg / 1000) * 100) / 100,
      meanBiomassKgPerTree: Math.round(meanBiomassKg * 10) / 10,
      totalCO2Tons: Math.round((sumCO2Kg / 1000) * 100) / 100,
      meanCO2PerTreeTons: Math.round(meanCO2PerTree * 1000) / 1000,
      speciesBreakdown: speciesCounter
    };

    return {
      sheetName: firstSheetName,
      totalRows: totalCount,
      trees,
      summary,
      columnMap,
      validationIssues
    };
  }
}
