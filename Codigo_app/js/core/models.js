/**
 * MODELOS DE DATOS DEL DOMINIO FORESTAL Y DE CARBONO (IDAF - LIFE D6.2)
 * Calculadora CO2RK
 */

export class ForestStand {
  constructor(data = {}) {
    this.id = data.id || `rodal_${Math.random().toString(36).substring(2, 7)}`;
    this.name = data.name || `Rodal ${this.id}`;
    this.speciesId = data.speciesId || 'quercus_suber';
    this.areaHa = !isNaN(parseFloat(data.areaHa)) ? parseFloat(data.areaHa) : 1.0;
    this.currentAge = !isNaN(parseInt(data.currentAge)) ? parseInt(data.currentAge) : 25;
    
    // Parámetros dendrométricos y ecológicos directos según D6.2
    this.density = !isNaN(parseFloat(data.density)) ? parseFloat(data.density) : 240.0; // pies/ha
    this.dbh = !isNaN(parseFloat(data.dbh)) ? parseFloat(data.dbh) : 18.2;          // DBH medio (cm)
    this.height = !isNaN(parseFloat(data.height)) ? parseFloat(data.height) : 6.0;      // Altura total media (m)
    this.potentiality = !isNaN(parseFloat(data.potentiality)) ? parseFloat(data.potentiality) : 0.85; // Calidad / Idoneidad bioclimática (0-1)

    // Parámetros de matorral (Montero et al., 2020)
    this.shrubType = data.shrubType || 'EC_GENERAL'; // Agrupación de matorral (A12-A35, EC_GENERAL)
    this.shrubFcc = !isNaN(parseFloat(data.shrubFcc)) ? parseFloat(data.shrubFcc) : 20.0; // FCC matorral (%)
    this.shrubHeightDm = !isNaN(parseFloat(data.shrubHeightDm)) ? parseFloat(data.shrubHeightDm) : 8.0; // Altura matorral (dm)

    // Parámetros específicos por actuación (Plantaciones, Densificaciones, Cerramientos)
    this.addedDensity = !isNaN(parseFloat(data.addedDensity)) ? parseFloat(data.addedDensity) : 180.0; // pies/ha nuevos introducidos (Densificaciones)
    this.recruitedDensity = !isNaN(parseFloat(data.recruitedDensity)) ? parseFloat(data.recruitedDensity) : 250.0; // pies/ha regenerados por exclusión (Cerramientos)
    this.shrubFccTarget = !isNaN(parseFloat(data.shrubFccTarget)) ? parseFloat(data.shrubFccTarget) : 55.0; // FCC matorral recuperado tras cerramiento (%)

    // Variables de compatibilidad clásica
    this.volumePerHa = !isNaN(parseFloat(data.volumePerHa)) ? parseFloat(data.volumePerHa) : 85.0; // m3/ha
    this.basalArea = !isNaN(parseFloat(data.basalArea)) ? parseFloat(data.basalArea) : 14.0;    // m2/ha
    this.growthRate = !isNaN(parseFloat(data.growthRate)) ? parseFloat(data.growthRate) : 2.5;   // m3/ha/año
    this.currentTreatment = data.currentTreatment || 'monte_alto';
    this.regionId = data.regionId || 'andalucia';
  }

  // Número total de árboles en el rodal
  getTotalTrees() {
    return Math.round(this.density * this.areaHa);
  }
}

export class ManagementScenario {
  constructor(data = {}) {
    this.strategyId = data.strategyId || 'plantaciones'; // plantaciones | densificaciones | cerramientos
    this.creditingYears = !isNaN(parseInt(data.creditingYears)) ? parseInt(data.creditingYears) : 30;
    this.riskBufferPct = !isNaN(parseFloat(data.riskBufferPct)) ? parseFloat(data.riskBufferPct) : 15.0; // 15%
    this.leakagePct = !isNaN(parseFloat(data.leakagePct)) ? parseFloat(data.leakagePct) : 5.0; // 5%
    this.carbonPriceEur = !isNaN(parseFloat(data.carbonPriceEur)) ? parseFloat(data.carbonPriceEur) : 25.0; // €/tCO2e
    this.potentiality = !isNaN(parseFloat(data.potentiality)) ? parseFloat(data.potentiality) : 0.85;
  }
}

export class SimulationResult {
  constructor(stand, scenario) {
    this.stand = stand;
    this.scenario = scenario;
    this.yearlyData = []; // Array of yearly calculations
    this.summary = {
      totalAreaHa: stand ? stand.areaHa : 0,
      creditingPeriodYears: scenario.creditingYears,
      initialBiomassPerHa: 0,
      initialCarbonPerHa: 0,
      initialCO2PerHa: 0,
      treeBiomassKgPerTree: 0,
      shrubBiomassTonsPerHa: 0,
      totalGrossCO2Credits: 0,
      totalNetCredits: 0,
      bufferCreditsDeducted: 0,
      leakageCreditsDeducted: 0,
      averageAnnualCredits: 0,
      creditsPerHa: 0,
      estimatedEconomicValueEur: 0
    };
  }
}
