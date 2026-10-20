/**
 * MOTOR DE CÁLCULO DE BIOMASA, CARBONO Y CRÉDITOS DE CO2 (IDAF - LIFE D6.2)
 * Basado en:
 * - Ecuaciones alométricas por fracciones para Quercus suber y acompañantes (Ruiz-Peinado et al., 2012; Montero et al., 2005)
 * - Modelos de biomasa por agrupación de matorral (Montero et al., 2020)
 * - Algoritmos de estimación ex-ante de Quercus suber: tonCO2eq/pie = 0.0000737 * Edad^2.3816 * e^(0.1451 * potencialidad)
 * - Modelos dinámicos ex-ante para especies acompañantes (eco2for)
 * - 3 Actuaciones de proyectos: 1. Plantaciones, 2. Densificaciones, 3. Cerramientos
 */

import { CONFIG } from '../config.js';
import { SimulationResult } from './models.js';

export class CarbonEngine {
  /**
   * Calcula la biomasa por fracciones individuales (kg/árbol de materia seca)
   * según las ecuaciones alométricas de Ruiz-Peinado et al. (2012) y Montero et al. (2005).
   * 
   * @param {string} speciesId - ID de la especie
   * @param {number} d - Diámetro normal a 1.3 m (cm)
   * @param {number} h - Altura total (m)
   * @returns {object} { stem, thickBranches, medBranches, thinBranchesLeaves, roots, totalKg }
   */
  static calculateRuizPeinadoBiomass(speciesId, d, h) {
    const dbh = Math.max(1.0, parseFloat(d) || 18.0);
    const height = Math.max(1.0, parseFloat(h) || 6.0);
    const d2 = dbh * dbh;

    let stem = 0;             // Fuste (Bf)
    let thickBranches = 0;    // Ramas gruesas > 7 cm (Br7)
    let medBranches = 0;      // Ramas medias 2-7 cm (Br2-7)
    let thinBranchesLeaves = 0; // Ramillas < 2 cm con hojas/acículas (Br2+h)
    let roots = 0;            // Raíces (Brad)

    switch (speciesId) {
      case 'quercus_suber': // Alcornoque (Tabla 2)
        stem = 0.00525 * d2 * height + 0.278 * dbh * height;
        thickBranches = 0.0135 * d2 * height;
        medBranches = 0.127 * dbh * height;
        thinBranchesLeaves = 0.0463 * dbh * height;
        roots = 0.0829 * d2;
        break;

      case 'pinus_pinea': // Pino piñonero (Tabla 3)
        stem = 0.0224 * Math.pow(dbh, 1.923) * Math.pow(height, 1.0193);
        thickBranches = (dbh > 22.5) ? 0.247 * Math.pow(dbh - 22.5, 2) : 0;
        medBranches = 0.0525 * d2;
        thinBranchesLeaves = Math.max(0, 21.927 + 0.0707 * d2 - 2.827 * height);
        roots = 0.117 * d2;
        break;

      case 'quercus_ilex': // Encina (Tabla 3)
        stem = 0.143 * d2;
        thickBranches = (dbh > 12.5) ? 0.0684 * Math.pow(dbh - 12.5, 2) * height : 0;
        medBranches = 0.0898 * d2;
        thinBranchesLeaves = 0.0824 * d2;
        roots = 0.254 * d2;
        break;

      case 'quercus_faginea': // Quejigo (Tabla 3)
        stem = 0.154 * d2;
        thickBranches = 0.0861 * d2;
        medBranches = Math.max(0, 0.127 * d2 - 0.00598 * d2 * height);
        thinBranchesLeaves = Math.max(0, 0.0726 * d2 - 0.00275 * d2 * height);
        roots = 0.169 * d2;
        break;

      case 'quercus_pyrenaica': // Roble melojo (Tabla 3)
        const bfR7 = 0.0261 * d2 * height;
        stem = bfR7 * 0.70;
        thickBranches = bfR7 * 0.30;
        medBranches = Math.max(0, -0.0260 * d2 + 0.536 * height + 0.00538 * d2 * height);
        thinBranchesLeaves = Math.max(0, 0.898 * dbh - 0.445 * height);
        roots = 0.143 * d2;
        break;

      case 'quercus_canariensis': // Quejigo andaluz (Tabla 3)
        stem = 0.0126 * d2 * height;
        thickBranches = 0.103 * d2;
        const crownFractions = 0.167 * dbh * height;
        medBranches = crownFractions * 0.65;
        thinBranchesLeaves = crownFractions * 0.35;
        roots = 0.135 * d2;
        break;

      case 'castanea_sativa': // Castaño (Tabla 3)
        stem = 0.0142 * d2 * height;
        thickBranches = (dbh > 12.5) ? 0.223 * Math.pow(dbh - 12.5, 2) : 0;
        medBranches = 0.230 * dbh * height;
        thinBranchesLeaves = 0.221 * dbh * height;
        roots = 0.0211 * Math.pow(dbh, 2.804);
        break;

      case 'ceratonia_siliqua': // Algarrobo (Tabla 3)
        stem = 0.142 * Math.pow(dbh, 1.974);
        thickBranches = 0.104 * d2;
        medBranches = 0.0538 * d2;
        thinBranchesLeaves = Math.max(0, 0.151 * d2 - 0.00740 * d2 * height);
        roots = 0.335 * d2;
        break;

      case 'olea_europaea': // Acebuche / Olivo silvestre (Tabla 3)
        stem = 0.0114 * d2 * height;
        thickBranches = 0.0108 * d2 * height;
        medBranches = 1.672 * dbh;
        thinBranchesLeaves = 0.0354 * d2 + 1.187 * height;
        roots = 0.147 * d2;
        break;

      case 'celtis_australis': // Almez (Montero et al., 2005)
      case 'juglans_regia':    // Nogal (Montero et al., 2005)
        const ba = 0.15335 * Math.pow(dbh, 2.29843);
        stem = ba * 0.60;
        thickBranches = ba * 0.20;
        medBranches = ba * 0.12;
        thinBranchesLeaves = ba * 0.08;
        roots = 0.25159 * Math.pow(dbh, 1.96764);
        break;

      default: // Ecuación genérica de frondosas / coníferas
        if (speciesId.startsWith('pinus')) {
          stem = 0.025 * Math.pow(dbh, 1.90) * Math.pow(height, 1.0);
          thickBranches = 0.012 * d2;
          medBranches = 0.050 * d2;
          thinBranchesLeaves = 0.040 * d2;
          roots = 0.120 * d2;
        } else {
          stem = 0.015 * d2 * height;
          thickBranches = 0.012 * d2 * height;
          medBranches = 0.110 * dbh * height;
          thinBranchesLeaves = 0.045 * dbh * height;
          roots = 0.150 * d2;
        }
        break;
    }

    const totalKg = stem + thickBranches + medBranches + thinBranchesLeaves + roots;
    return {
      stem,
      thickBranches,
      medBranches,
      thinBranchesLeaves,
      roots,
      totalKg
    };
  }

  /**
   * Calcula la biomasa de matorral (t M.S./ha) según Montero et al. (2020) (Tabla 4 de D6.2)
   * 
   * @param {string} shrubType - Agrupación de matorral (A12-A35 o EC_GENERAL)
   * @param {number} fcc - Fracción de cabida cubierta (%) [0, 100]
   * @param {number} heightDm - Altura media del matorral en decímetros (dm)
   * @returns {number} Biomasa de matorral en toneladas/ha
   */
  static calculateShrubBiomass(shrubType = 'EC_GENERAL', fcc = 20, heightDm = 8) {
    const fccClamped = Math.min(100, Math.max(1, parseFloat(fcc) || 20));
    const h = Math.max(0.5, parseFloat(heightDm) || 8);
    const asinTerm = Math.asin(Math.sqrt(fccClamped / 100)); // En radianes

    let biomass = 0;
    switch (shrubType) {
      case 'A12': // Setos, bardas, orlas
        biomass = 0.6441192 * h * asinTerm;
        break;
      case 'A13': // Bujedos
        biomass = 4.515059 * Math.pow(h * asinTerm, 0.428802);
        break;
      case 'A15': // Arbustedos Quercus ilex
        biomass = 0.3768846 * Math.pow(h * asinTerm, 1.0172503);
        break;
      case 'A16': // Sabinares, enebrales
        biomass = 0.8170986 * Math.pow(h * asinTerm, 1.2403275);
        break;
      case 'A17': // Coscojares más o menos puros
        biomass = 2.0135328 * Math.pow(Math.pow(h, 0.8191936) * asinTerm, 0.9125035);
        break;
      case 'A18': // Lentiscares
        biomass = 2.5800701 * Math.pow(h * asinTerm, 0.8037841);
        break;
      case 'A19': // Mancha mediterránea
        biomass = 1.628329 * h * asinTerm;
        break;
      case 'A19A': // Garrigas
        biomass = 4.772295 * Math.pow(Math.pow(h, 0.591833) * asinTerm, 1.227138);
        break;
      case 'A22': // Brezales
        biomass = 2.0483619 * Math.pow(h * asinTerm, 0.8613609);
        break;
      case 'A23': // Leguminosas retamoideas
        biomass = 9.018966 * Math.pow(Math.pow(h, 0.32999) * asinTerm, 0.419907);
        break;
      case 'A24': // Leguminosas aulagoides y afines
        biomass = 1.4901824 * Math.pow(h, 0.98885) * Math.pow(asinTerm, 1.0275925);
        break;
      case 'A25': // Jarales
        biomass = 1.7397887 * Math.pow(h * asinTerm, 0.884211);
        break;
      case 'A26': // Tomillares
        biomass = 1.378164 * Math.pow(h * asinTerm, 0.999194);
        break;
      case 'A27': // Cubiertas mixtas
        biomass = 1.7222769 * Math.pow(h * asinTerm, 0.7768124);
        break;
      case 'A35': // Atochares, espartizales
        biomass = 0.9808213 * h * asinTerm;
        break;
      case 'EC_GENERAL':
      default: // Matorral general mediterráneo
        biomass = 1.8255065 * Math.pow(h * asinTerm, 0.8844);
        break;
    }

    return Math.max(0, biomass);
  }

  /**
   * Algoritmo de estimación de absorción potencial EX-ANTE (ton CO2eq / pie)
   * según D6.2 (Sección 6.1 para Quercus suber y Sección 6.2 / Tabla 8 eco2for para acompañantes).
   * 
   * Para Quercus suber:
   * tonCO2eq/pie = 0.0000737 * Edad^2.3816 * e^(0.1451 * potencialidad)
   * 
   * @param {string} speciesId - Especie
   * @param {number} age - Edad de la masa o de la intervención (años)
   * @param {number} potentiality - Índice de potencialidad ambiental (0 - 1)
   * @param {number} density - Densidad (pies/ha)
   * @param {object} climate - { mean_annual_precip_mm, mean_annual_temp_c }
   * @returns {number} ton CO2eq acumulado por pie
   */
  static calculateExAnteTreeCO2(speciesId, age, potentiality = 0.85, density = 300, climate = null) {
    const t = Math.max(1, parseFloat(age) || 1);
    const pot = Math.min(1.0, Math.max(0.1, parseFloat(potentiality) || 0.85));
    const N = Math.max(10, parseFloat(density) || 300);
    const ppm = climate?.mean_annual_precip_mm || CONFIG.DEFAULT_CLIMATE.mean_annual_precip_mm;
    const tm = climate?.mean_annual_temp_c || CONFIG.DEFAULT_CLIMATE.mean_annual_temp_c;
    const martonne = ppm / (tm + 10);
    const cf = 0.50;
    const co2Ratio = CONFIG.CO2_C_RATIO; // 44/12

    if (speciesId === 'quercus_suber') {
      // Ecuación directa D6.2 Sección 6.1:
      // tonCO2eq/pie = 0.0000737 * Edad^2.3816 * e^(0.1451 * potencialidad)
      const co2PerTree = 0.0000737 * Math.pow(t, 2.3816) * Math.exp(0.1451 * pot);
      return Math.max(0.001, co2PerTree);
    }

    // Especies acompañantes (Tabla 8 eco2for)
    let bTotKgHa = 0;
    switch (speciesId) {
      case 'pinus_pinea':
        // B_tot = (37.5887*N + 1657.3*M) * (1 - e^(-0.0998*T))^4.5652 (kg/ha)
        bTotKgHa = (37.5887 * N + 1657.3 * martonne) * Math.pow(1 - Math.exp(-0.0998 * t), 4.5652);
        break;

      case 'quercus_ilex':
        // B_tot = 1.2437 * T^(1.4275 + 0.000725*ppm + 0.0667*tm + 0.000433*N) (kg/ha)
        const expIlex = 1.4275 + 0.000725 * ppm + 0.0667 * tm + 0.000433 * N;
        bTotKgHa = 1.2437 * Math.pow(t, Math.min(2.8, expIlex));
        break;

      case 'quercus_pyrenaica':
        // B_tot = (-81160.3 + 218.2*N) * (1 - e^(-0.0006*T))^0.6495 (kg/ha)
        // Para densidades moderadas N < 372 pies/ha donde el modelo de monte denso sería negativo,
        // se modela mediante el crecimiento alométrico individual de Ruiz-Peinado extrapolado:
        if (N < 372) {
          const dbhEst = Math.min(45, 1.2 + 0.55 * t);
          const hEst = Math.min(18, 1.5 + 0.32 * t);
          const singleTreeBio = this.calculateRuizPeinadoBiomass('quercus_pyrenaica', dbhEst, hEst).totalKg;
          bTotKgHa = singleTreeBio * N;
        } else {
          bTotKgHa = (-81160.3 + 218.2 * N) * Math.pow(1 - Math.exp(-0.0006 * t), 0.6495);
        }
        break;

      case 'quercus_faginea':
        // b_m = 0.000033 * T^(4.0360 + 0.0336*tm - 0.00022*N) (kg/pie)
        const expFag = Math.max(1.0, Math.min(3.5, 4.0360 + 0.0336 * tm - 0.00022 * N));
        const bmKg = 0.000033 * Math.pow(t, expFag);
        bTotKgHa = bmKg * N;
        break;

      case 'castanea_sativa':
        // B_tot = 9.5388 * T^(1.7251 + 0.00091*ppm + 0.00037*N) (kg/ha)
        const expCas = Math.min(2.6, 1.7251 + 0.00091 * ppm + 0.00037 * N);
        bTotKgHa = 9.5388 * Math.pow(t, expCas);
        break;

      case 'ceratonia_siliqua':
        // B_tot = 1787.7 * T^(0.00103*ppm + 0.000141*N) (kg/ha)
        const expCer = Math.min(2.4, 0.00103 * ppm + 0.000141 * N + 0.4);
        bTotKgHa = 1787.7 * Math.pow(t, expCer);
        break;

      case 'olea_europaea':
        // B_tot = 213.7 * T^(0.3467 + 0.00129*ppm + 0.00095*N) (kg/ha)
        const expOle = Math.min(2.2, 0.3467 + 0.00129 * ppm + 0.00095 * N);
        bTotKgHa = 213.7 * Math.pow(t, expOle);
        break;

      case 'celtis_australis':
      case 'juglans_regia':
        // B_tot = (81.1826 + 0.0696*N) * T^1.6130 (kg/ha)
        bTotKgHa = (81.1826 + 0.0696 * N) * Math.pow(t, 1.6130);
        break;

      default:
        // Crecimiento alométrico estándar para otras coníferas/frondosas
        const baseCo2 = 0.000085 * Math.pow(t, 2.30) * Math.exp(0.12 * pot);
        return Math.max(0.001, baseCo2);
    }

    // Convertir B_tot (kg M.S./ha) a ton CO2eq / pie
    const tCo2eHa = (Math.max(0, bTotKgHa) / 1000) * cf * co2Ratio;
    return Math.max(0.001, tCo2eHa / N);
  }

  /**
   * Simula la evolución temporal para un rodal dado y una de las 3 estrategias del proyecto:
   * 1. Plantaciones: Nueva masa sobre terreno desarbolado. Adicionalidad completa de los nuevos pies.
   * 2. Densificaciones: Masa abierta/dehesa existente. Se acredita el aporte neto del arbolado nuevo introducido.
   * 3. Cerramientos: Exclusión de herbívoros para inducir regeneración natural y restauración de matorral.
   * 
   * @param {ForestStand} stand 
   * @param {ManagementScenario} scenario 
   * @param {object} speciesDb 
   * @param {object} regulationsDb 
   * @returns {SimulationResult}
   */
  static simulateStand(stand, scenario, speciesDb, regulationsDb) {
    const result = new SimulationResult(stand, scenario);
    const years = scenario.creditingYears || CONFIG.DEFAULT_CREDITING_PERIOD_YEARS;
    const area = stand.areaHa || 1.0;
    const pot = stand.potentiality || scenario.potentiality || CONFIG.DEFAULT_POTENTIALITY;
    const speciesId = stand.speciesId || 'quercus_suber';

    // 1. Cálculo inicial de biomasa por árbol y por hectárea (Ruiz-Peinado 2012)
    const treeBiomassFrac = this.calculateRuizPeinadoBiomass(speciesId, stand.dbh, stand.height);
    const treeBiomassKg = stand.treeSummary?.meanBiomassKgPerTree || treeBiomassFrac.totalKg;
    const treeCO2PerTree = stand.treeSummary?.meanCO2PerTreeTons || ((treeBiomassKg / 1000) * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO);
    const baselineTreesPerHa = (scenario.strategyId === 'plantaciones') ? 0 : stand.density;
    const baselineTreesStockPerHa = baselineTreesPerHa * treeCO2PerTree;

    // 2. Cálculo inicial de matorral (Montero et al., 2020)
    const shrubInitialBiomassHa = this.calculateShrubBiomass(stand.shrubType, stand.shrubFcc, stand.shrubHeightDm);
    const shrubInitialCO2Ha = shrubInitialBiomassHa * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO;

    const totalInitCO2Ha = baselineTreesStockPerHa + shrubInitialCO2Ha;

    result.summary.treeBiomassKgPerTree = treeBiomassKg;
    result.summary.shrubBiomassTonsPerHa = shrubInitialBiomassHa;
    result.summary.initialBiomassPerHa = (baselineTreesPerHa * treeBiomassKg / 1000) + shrubInitialBiomassHa;
    result.summary.initialCarbonPerHa = result.summary.initialBiomassPerHa * CONFIG.CARBON_FRACTION_DEFAULT;
    result.summary.initialCO2PerHa = totalInitCO2Ha;

    let cumulativeGrossCredits = 0;
    let cumulativeNetCredits = 0;
    let prevAdditionalCO2 = 0;

    const riskBuffer = !isNaN(parseFloat(scenario.riskBufferPct)) ? parseFloat(scenario.riskBufferPct) : 15.0;
    const leakage = !isNaN(parseFloat(scenario.leakagePct)) ? parseFloat(scenario.leakagePct) : 5.0;
    const bufferPct = riskBuffer / 100;
    const leakagePct = leakage / 100;
    const netMultiplier = Math.max(0, 1 - bufferPct - leakagePct);

    // Bucle temporal año a año
    for (let yr = 0; yr <= years; yr++) {
      let baselineCO2Total = 0;
      let projectCO2Total = 0;
      let additionalCO2Total = 0;

      if (scenario.strategyId === 'plantaciones') {
        // --- 1. PLANTACIONES ---
        // Línea Base = Terreno desarbolado sin captura neta adicional
        baselineCO2Total = shrubInitialCO2Ha * area;

        // Proyecto = Crecimiento ex-ante de la nueva plantación (densidad stand.density)
        const treeAge = yr;
        let plantedCo2PerTree = 0;
        if (yr > 0) {
          plantedCo2PerTree = this.calculateExAnteTreeCO2(speciesId, treeAge, pot, stand.density);
        }
        const plantedTreesTotalStock = plantedCo2PerTree * stand.density * area;
        projectCO2Total = baselineCO2Total + plantedTreesTotalStock;
        additionalCO2Total = plantedTreesTotalStock;

      } else if (scenario.strategyId === 'densificaciones') {
        // --- 2. DENSIFICACIONES ---
        // Línea Base = Arbolado adulto preexistente (crecimiento vegetativo maduro muy lento o nulo neto)
        const baselineAnnualGrowth = (baselineTreesStockPerHa * 0.005) * yr; // 0.5% anual en masa existente
        const currentBaselinePerHa = baselineTreesStockPerHa + baselineAnnualGrowth + shrubInitialCO2Ha;
        baselineCO2Total = currentBaselinePerHa * area;

        // Proyecto = Arbolado adulto existente + Cohorte nueva densificada (stand.addedDensity)
        const addedDensity = stand.addedDensity || 180;
        const totalStandDensity = baselineTreesPerHa + addedDensity;
        let addedCo2PerTree = 0;
        if (yr > 0) {
          addedCo2PerTree = this.calculateExAnteTreeCO2(speciesId, yr, pot, totalStandDensity);
        }
        const addedTreesStock = addedCo2PerTree * addedDensity * area;
        projectCO2Total = baselineCO2Total + addedTreesStock;
        additionalCO2Total = addedTreesStock;

      } else if (scenario.strategyId === 'cerramientos') {
        // --- 3. CERRAMIENTOS (EXCLUSIONES DE HERBÍVOROS) ---
        // Línea Base = Masa con herbivoría continua (regeneración nula, matorral degradado constante)
        baselineCO2Total = (baselineTreesStockPerHa + shrubInitialCO2Ha) * area;

        // Proyecto = Exclusión permite:
        // A) Reclutamiento de regeneración natural que se consolida
        const recruitedDensity = stand.recruitedDensity || 250;
        const totalCerramientoDensity = baselineTreesPerHa + recruitedDensity;
        // La regeneración se va estableciendo progresivamente tras el vallado
        let regenCo2Stock = 0;
        if (yr >= 2) {
          const regenAge = yr - 1; // 1 año de arraigo inicial
          const regenCo2PerTree = this.calculateExAnteTreeCO2(speciesId, regenAge, pot, totalCerramientoDensity);
          regenCo2Stock = regenCo2PerTree * recruitedDensity * area;
        }

        // B) Recuperación progresiva del matorral bajo cerramiento (hasta fccTarget en 12 años)
        const targetFcc = Math.max(stand.shrubFcc, stand.shrubFccTarget || 55.0);
        const progress12 = Math.min(1.0, yr / 12);
        const currentFcc = stand.shrubFcc + ((targetFcc - stand.shrubFcc) * progress12);
        // La altura del matorral también experimenta un incremento de porte al cesar el ramoneo ganadero/cinegético
        const currentHeightDm = stand.shrubHeightDm * (1.0 + (0.20 * progress12));
        const recoveredShrubBiomassHa = this.calculateShrubBiomass(stand.shrubType, currentFcc, currentHeightDm);
        const recoveredShrubCO2Ha = recoveredShrubBiomassHa * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO;
        const additionalShrubStock = Math.max(0, (recoveredShrubCO2Ha - shrubInitialCO2Ha) * area);

        additionalCO2Total = regenCo2Stock + additionalShrubStock;
        projectCO2Total = baselineCO2Total + additionalCO2Total;
      }

      // Cálculo de créditos anuales
      let annualGrossCredits = 0;
      let annualNetCredits = 0;

      if (yr > 0) {
        annualGrossCredits = Math.max(0, additionalCO2Total - prevAdditionalCO2);
        annualNetCredits = annualGrossCredits * netMultiplier;
        cumulativeGrossCredits += annualGrossCredits;
        cumulativeNetCredits += annualNetCredits;
      }
      prevAdditionalCO2 = additionalCO2Total;

      result.yearlyData.push({
        year: yr,
        standAge: (scenario.strategyId === 'plantaciones') ? yr : (stand.currentAge + yr),
        baselineStockTotal: baselineCO2Total,
        baselineCO2Total: baselineCO2Total,
        baselineCO2PerHa: area > 0 ? (baselineCO2Total / area) : 0,
        projectStockTotal: projectCO2Total,
        projectCO2Total: projectCO2Total,
        projectCO2PerHa: area > 0 ? (projectCO2Total / area) : 0,
        additionalStockTotal: additionalCO2Total,
        additionalCO2Total: additionalCO2Total,
        additionalCO2PerHa: area > 0 ? (additionalCO2Total / area) : 0,
        annualGrossCredits: annualGrossCredits,
        annualGrossCreditsTotal: annualGrossCredits,
        annualNetCredits: annualNetCredits,
        annualNetCreditsTotal: annualNetCredits,
        cumulativeGrossCredits: cumulativeGrossCredits,
        cumulativeGrossCreditsTotal: cumulativeGrossCredits,
        cumulativeNetCredits: cumulativeNetCredits,
        cumulativeNetCreditsTotal: cumulativeNetCredits
      });
    }

    // Resumen final
    result.summary.totalGrossCO2Credits = cumulativeGrossCredits || 0;
    result.summary.totalNetCredits = cumulativeNetCredits || 0;
    result.summary.bufferCreditsDeducted = (cumulativeGrossCredits * bufferPct) || 0;
    result.summary.leakageCreditsDeducted = (cumulativeGrossCredits * leakagePct) || 0;
    result.summary.averageAnnualCredits = years > 0 ? (cumulativeNetCredits / years) : 0;
    result.summary.creditsPerHa = area > 0 ? (cumulativeNetCredits / area) : 0;
    result.summary.estimatedEconomicValueEur = (cumulativeNetCredits * (scenario.carbonPriceEur || CONFIG.DEFAULT_CARBON_PRICE_EUR)) || 0;

    return result;
  }

  /**
   * Simula un conjunto completo de rodales (inventario subido por el usuario)
   * y consolida la serie temporal agregada.
   */
  static simulateInventory(stands, scenario, speciesDb, regulationsDb) {
    if (!stands || stands.length === 0) {
      throw new Error("El inventario está vacío. Por favor sube un archivo CSV con rodales.");
    }

    const standResults = stands.map(stand => 
      this.simulateStand(stand, scenario, speciesDb, regulationsDb)
    );

    const years = scenario.creditingYears || CONFIG.DEFAULT_CREDITING_PERIOD_YEARS;
    const aggregatedYearly = [];

    let totalAreaHa = 0;
    let totalGrossCredits = 0;
    let totalNetCredits = 0;
    let totalBufferDeducted = 0;
    let totalLeakageDeducted = 0;

    standResults.forEach(res => {
      totalAreaHa += res.stand.areaHa;
      totalGrossCredits += res.summary.totalGrossCO2Credits;
      totalNetCredits += res.summary.totalNetCredits;
      totalBufferDeducted += res.summary.bufferCreditsDeducted;
      totalLeakageDeducted += res.summary.leakageCreditsDeducted;
    });

    for (let yr = 0; yr <= years; yr++) {
      let baselineStock = 0;
      let projectStock = 0;
      let additionalStock = 0;
      let annualGross = 0;
      let annualNet = 0;
      let cumGross = 0;
      let cumNet = 0;

      standResults.forEach(res => {
        const yData = res.yearlyData[yr];
        if (yData) {
          baselineStock += yData.baselineStockTotal;
          projectStock += yData.projectStockTotal;
          additionalStock += yData.additionalStockTotal;
          annualGross += yData.annualGrossCredits;
          annualNet += yData.annualNetCredits;
          cumGross += yData.cumulativeGrossCredits;
          cumNet += yData.cumulativeNetCredits;
        }
      });

      aggregatedYearly.push({
        year: yr,
        standAge: yr,
        baselineStockTotal: baselineStock,
        baselineCO2Total: baselineStock,
        baselineCO2PerHa: totalAreaHa > 0 ? (baselineStock / totalAreaHa) : 0,
        projectStockTotal: projectStock,
        projectCO2Total: projectStock,
        projectCO2PerHa: totalAreaHa > 0 ? (projectStock / totalAreaHa) : 0,
        additionalStockTotal: additionalStock,
        additionalCO2Total: additionalStock,
        additionalCO2PerHa: totalAreaHa > 0 ? (additionalStock / totalAreaHa) : 0,
        annualGrossCredits: annualGross,
        annualGrossCreditsTotal: annualGross,
        annualNetCredits: annualNet,
        annualNetCreditsTotal: annualNet,
        cumulativeGrossCredits: cumGross,
        cumulativeGrossCreditsTotal: cumGross,
        cumulativeNetCredits: cumNet,
        cumulativeNetCreditsTotal: cumNet
      });
    }

    const globalSummary = {
      totalAreaHa,
      creditingPeriodYears: years,
      totalStandsCount: stands.length,
      totalGrossCO2Credits: totalGrossCredits || 0,
      totalNetCredits: totalNetCredits || 0,
      bufferCreditsDeducted: totalBufferDeducted || 0,
      leakageCreditsDeducted: totalLeakageDeducted || 0,
      averageAnnualCredits: years > 0 ? (totalNetCredits / years) : 0,
      creditsPerHa: totalAreaHa > 0 ? (totalNetCredits / totalAreaHa) : 0,
      estimatedEconomicValueEur: (totalNetCredits * (scenario.carbonPriceEur || CONFIG.DEFAULT_CARBON_PRICE_EUR)) || 0
    };

    return {
      standResults,
      aggregatedYearly,
      summary: globalSummary
    };
  }
}
