/**
 * CONTROLADOR PRINCIPAL DEL ASISTENTE EN 3 PASOS
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 */

import { CONFIG } from '../config.js';
import { ForestStand, ManagementScenario } from '../core/models.js';
import { CarbonEngine } from '../core/calculations.js';
import { FileParser } from '../parsers/fileParser.js';
import { KmlParser } from '../parsers/kmlParser.js';
import { ChartManager } from './charts.js';
import { MapManager } from './mapManager.js';
import { ReportManager } from './report.js';
import { AuthManager } from '../core/auth.js';

/**
 * Sanitiza texto para prevenir inyecciones HTML / XSS
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class AppController {
  constructor() {
    this.speciesDb = null;
    this.regulationsDb = null;
    this.chartManager = new ChartManager();
    this.mapManager = new MapManager('kml-map');

    // Estado de la aplicación
    this.currentStep = 1;
    this.projectInfo = {
      name: '',
      owner: '',
      nif: '',
      estate: '',
      regionId: '',
      province: '',
      municipality: '',
      cadastral: '',
      speciesId: '',
      treatmentId: 'monte_alto',
      strategyId: 'plantaciones'
    };

    this.eligibilityPdf = null; // { name, size }
    this.kmlData = null; // { geojson, totalAreaHa, filename }
    this.inventoryStands = []; // Array de ForestStand (inicialmente VACÍO, sin precarga)
    this.inventoryFilename = '';
    this.lastSimulationResult = null;

    this.init();
  }

  async init() {
    // 1. Control de Autenticación
    AuthManager.requireAuth();
    this.setupUserHeader();

    // 2. Cargar bases de datos
    await this.loadDatabases();
    this.populateSelectors();

    // 3. Enlazar eventos de la interfaz
    this.bindEvents();
    this.bindKmlEvents();
    this.bindPdfEvents();
    this.bindCsvEvents();

    // 4. Iniciar en Paso 1
    this.setStep(1);
  }

  /**
   * Carga de bases de datos JSON (con fallback)
   */
  async loadDatabases() {
    try {
      const [resSpecies, resRegs] = await Promise.all([
        fetch('data/species_database.json'),
        fetch('data/regulations_database.json')
      ]);

      if (resSpecies.ok && resRegs.ok) {
        this.speciesDb = await resSpecies.json();
        this.regulationsDb = await resRegs.json();
      } else {
        throw new Error("HTTP error");
      }
    } catch (e) {
      console.warn("Cargando bases de datos de respaldo offline...", e);
      this.speciesDb = {
        species: [
          { id: "pinus_sylvestris", scientific_name: "Pinus sylvestris", common_name: "Pino silvestre", group: "conifer", wood_density: 0.45, bef: 1.25, root_shoot_ratio: 0.23, carbon_fraction: 0.50, default_rotation: 80, default_mai: 4.5 },
          { id: "pinus_pinaster", scientific_name: "Pinus pinaster", common_name: "Pino negral / marítimo", group: "conifer", wood_density: 0.48, bef: 1.28, root_shoot_ratio: 0.22, carbon_fraction: 0.50, default_rotation: 60, default_mai: 6.0 },
          { id: "pinus_halepensis", scientific_name: "Pinus halepensis", common_name: "Pino carrasco", group: "conifer", wood_density: 0.52, bef: 1.30, root_shoot_ratio: 0.26, carbon_fraction: 0.50, default_rotation: 70, default_mai: 2.5 },
          { id: "quercus_ilex", scientific_name: "Quercus ilex", common_name: "Encina / Carrasca", group: "broadleaf", wood_density: 0.72, bef: 1.45, root_shoot_ratio: 0.32, carbon_fraction: 0.48, default_rotation: 120, default_mai: 1.8 },
          { id: "quercus_suber", scientific_name: "Quercus suber", common_name: "Alcornoque", group: "broadleaf", wood_density: 0.65, bef: 1.40, root_shoot_ratio: 0.30, carbon_fraction: 0.48, default_rotation: 120, default_mai: 2.2 },
          { id: "fagus_sylvatica", scientific_name: "Fagus sylvatica", common_name: "Haya", group: "broadleaf", wood_density: 0.56, bef: 1.32, root_shoot_ratio: 0.24, carbon_fraction: 0.48, default_rotation: 100, default_mai: 5.0 },
          { id: "castanea_sativa", scientific_name: "Castanea sativa", common_name: "Castaño", group: "broadleaf", wood_density: 0.50, bef: 1.28, root_shoot_ratio: 0.22, carbon_fraction: 0.48, default_rotation: 30, default_mai: 6.5 },
          { id: "eucalyptus_globulus", scientific_name: "Eucalyptus globulus", common_name: "Eucalipto blanco", group: "broadleaf", wood_density: 0.54, bef: 1.20, root_shoot_ratio: 0.18, carbon_fraction: 0.47, default_rotation: 15, default_mai: 14.0 }
        ]
      };
      this.regulationsDb = {
        regions: [
          { id: "andalucia", name: "Andalucía" },
          { id: "castilla_y_leon", name: "Castilla y León" },
          { id: "castilla_la_mancha", name: "Castilla-La Mancha" },
          { id: "extremadura", name: "Extremadura" },
          { id: "galicia", name: "Galicia" },
          { id: "cataluna", name: "Cataluña" },
          { id: "aragon", name: "Aragón" },
          { id: "comunidad_valenciana", name: "Comunidad Valenciana" },
          { id: "general_iberica", name: "Marco General Estatal / Otras CCAA" },
          { id: "life_climate_positive", name: "Estándar Europeo LIFE ClimatePositive" }
        ],
        treatments: [
          { id: "monte_alto", name: "Monte alto (Fustal)" },
          { id: "monte_bajo", name: "Monte bajo (Chirpial / Ceduo)" },
          { id: "monte_medio", name: "Monte medio" }
        ],
        strategies: [
          { id: "plantaciones", name: "1. Plantaciones (Repoblaciones sobre terrenos desarbolados)" },
          { id: "densificaciones", name: "2. Densificaciones (Aumento de densidad en masas abiertas / dehesas)" },
          { id: "cerramientos", name: "3. Cerramientos (Exclusiones de herbivoría para regeneración natural)" }
        ]
      };
    }
  }

  /**
   * Muestra usuario en la barra superior
   */
  setupUserHeader() {
    const user = AuthManager.getUser();
    if (user) {
      const container = document.getElementById('user-profile-header');
      const elName = document.getElementById('user-name');
      const elEmail = document.getElementById('user-email');
      const elAvatar = document.getElementById('user-avatar');

      if (container) container.style.display = 'flex';
      if (elName) elName.innerText = user.name || 'Usuario';
      if (elEmail) elEmail.innerText = user.email || '';
      if (elAvatar && user.picture) elAvatar.src = user.picture;
    }
  }

  /**
   * Puebla los selectores con las bases de datos
   */
  populateSelectors() {
    const selRegion = document.getElementById('proj-region');
    const selSpecies = document.getElementById('proj-species');
    const selTreatment = document.getElementById('proj-treatment');
    const selStrategy = document.getElementById('proj-strategy');

    if (selRegion) {
      selRegion.innerHTML = this.regulationsDb.regions.map(r => 
        `<option value="${r.id}">${r.name}</option>`
      ).join('');
    }

    if (selSpecies) {
      selSpecies.innerHTML = this.speciesDb.species.map(s => 
        `<option value="${s.id}">${s.scientific_name} (${s.common_name})</option>`
      ).join('');
    }

    if (selTreatment) {
      selTreatment.innerHTML = this.regulationsDb.treatments.map(t => 
        `<option value="${t.id}">${t.name}</option>`
      ).join('');
    }

    if (selStrategy) {
      selStrategy.innerHTML = this.regulationsDb.strategies.map(s => 
        `<option value="${s.id}">${s.name}</option>`
      ).join('');

      selStrategy.addEventListener('change', () => {
        this.updateEligibilityCriteria(selStrategy.value);
      });

      // Inicializar con la primera estrategia (Plantaciones)
      if (this.regulationsDb.strategies.length > 0) {
        this.updateEligibilityCriteria(this.regulationsDb.strategies[0].id);
      }
    }
  }

  /**
   * Actualiza el panel de criterios de elegibilidad según la actuación seleccionada
   */
  updateEligibilityCriteria(strategyId) {
    const strat = this.regulationsDb.strategies.find(s => s.id === strategyId);
    if (!strat) return;

    const elTitle = document.getElementById('eligibility-strategy-title');
    const elDesc = document.getElementById('eligibility-strategy-desc');
    const elList = document.getElementById('eligibility-criteria-list');

    if (elTitle) elTitle.innerText = strat.name;
    if (elDesc) elDesc.innerText = strat.description;
    if (elList && strat.eligibility_criteria) {
      elList.innerHTML = strat.eligibility_criteria.map(crit => `
        <li style="margin-bottom: 6px;">
          <i class="fa-solid fa-check" style="color: var(--idaf-light-green); margin-right: 6px;"></i>
          ${crit}
        </li>
      `).join('');
    }
  }

  /**
   * Gestión del Stepper y navegación entre los 3 pasos
   */
  setStep(stepNumber) {
    this.currentStep = stepNumber;

    // Actualizar clases de la barra de navegación del Stepper
    for (let i = 1; i <= 3; i++) {
      const navItem = document.getElementById(`step-nav-${i}`);
      const stepDiv = document.getElementById(`step-div-${i}`);
      const stepSection = document.getElementById(`step-${i}-${i === 1 ? 'project' : (i === 2 ? 'inventory' : 'results')}`);

      if (navItem) {
        navItem.classList.remove('active', 'completed');
        if (i === stepNumber) {
          navItem.classList.add('active');
        } else if (i < stepNumber) {
          navItem.classList.add('completed');
        }
      }

      if (stepDiv) {
        stepDiv.classList.toggle('active', i < stepNumber);
      }

      if (stepSection) {
        stepSection.classList.toggle('active', i === stepNumber);
      }
    }

    // Scroll superior suave
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Actualizar resúmenes según el paso
    if (stepNumber === 2) {
      this.renderProjectSummary('step2-project-summary');
      this.setupStep2FormDefaults();
    } else if (stepNumber === 3) {
      this.renderProjectSummary('step3-project-summary');
    }
  }

  /**
   * Configura valores por defecto y textos dinámicos del Paso 2 según la actuación
   */
  setupStep2FormDefaults() {
    const kmlArea = (this.kmlData && !isNaN(this.kmlData.totalAreaHa) && this.kmlData.totalAreaHa > 0) 
      ? this.kmlData.totalAreaHa 
      : 1.0;
    const elKmlArea = document.getElementById('step2-kml-area');
    const elSampleArea = document.getElementById('step2-sample-area');
    const elModeCensus = document.getElementById('step2-inventory-mode-census');
    const elSamplingModeContainer = document.getElementById('step2-sampling-mode-container');
    const elSampleAreaGroup = document.getElementById('step2-sample-area-group');
    const isPlantacion = this.projectInfo.strategyId === 'plantaciones';

    if (elKmlArea) elKmlArea.value = kmlArea;

    // Para Plantaciones: el terreno inicial es desarbolado. Se oculta el modo de muestreo de arbolado existente y se muestra aviso
    const plantacionNotice = document.getElementById('step2-plantacion-notice');
    if (plantacionNotice) {
      plantacionNotice.style.display = isPlantacion ? 'flex' : 'none';
    }

    if (isPlantacion) {
      if (elSamplingModeContainer) elSamplingModeContainer.style.display = 'none';
      if (elSampleAreaGroup) elSampleAreaGroup.style.display = 'none';
    } else {
      if (elSamplingModeContainer) elSamplingModeContainer.style.display = 'flex';
      if (elSampleAreaGroup) elSampleAreaGroup.style.display = 'block';

      if (elModeCensus && elModeCensus.checked) {
        if (elSampleArea) {
          elSampleArea.value = kmlArea;
          elSampleArea.disabled = true;
        }
      } else {
        if (elSampleArea) {
          elSampleArea.disabled = false;
          if (!elSampleArea.dataset.userEdited || parseFloat(elSampleArea.value) <= 0) {
            elSampleArea.value = "1.0"; // Defecto de muestreo: 1 ha
          }
        }
      }
    }

    const strat = this.regulationsDb.strategies.find(s => s.id === this.projectInfo.strategyId);
    const elActTitle = document.getElementById('step2-act-title');
    if (elActTitle) elActTitle.innerText = strat ? strat.name : '1. Plantaciones';

    const lbl = document.getElementById('step2-action-param-label');
    const inp = document.getElementById('step2-action-param-input');
    const hlp = document.getElementById('step2-action-param-help');
    const cerramientoShrubGroup = document.getElementById('step2-cerramiento-shrub-target-group');
    const btnCalculate = document.getElementById('btn-calculate-and-results');

    if (isPlantacion) {
      if (lbl) lbl.innerText = "Densidad de nueva plantación (pies/ha)";
      if (inp && (!inp.dataset.userEdited || !inp.value)) inp.value = "400";
      if (hlp) hlp.innerText = "Pies nuevos a plantar por hectárea en el terreno desarbolado";
      if (cerramientoShrubGroup) cerramientoShrubGroup.style.display = 'none';

      // En plantaciones se permite calcular directamente con la densidad a plantar
      if (btnCalculate) {
        btnCalculate.disabled = false;
        btnCalculate.style.opacity = '1';
        btnCalculate.style.cursor = 'pointer';
      }
    } else if (this.projectInfo.strategyId === 'densificaciones') {
      if (lbl) lbl.innerText = "Densidad añadida a introducir (pies/ha)";
      if (inp && (!inp.dataset.userEdited || !inp.value)) inp.value = "180";
      if (hlp) hlp.innerText = "Nuevos pies por hectárea introducidos para enriquecer la masa";
      if (cerramientoShrubGroup) cerramientoShrubGroup.style.display = 'none';

      if (btnCalculate) {
        const hasTrees = this.parsedTrees && this.parsedTrees.length > 0;
        btnCalculate.disabled = !hasTrees;
        btnCalculate.style.opacity = hasTrees ? '1' : '0.5';
        btnCalculate.style.cursor = hasTrees ? 'pointer' : 'not-allowed';
      }
    } else if (this.projectInfo.strategyId === 'cerramientos') {
      if (lbl) lbl.innerText = "Regeneración natural esperada (pies/ha)";
      if (inp && (!inp.dataset.userEdited || !inp.value)) inp.value = "250";
      if (hlp) hlp.innerText = "Pies/ha reclutados gracias a la exclusión de herbívoros";
      if (cerramientoShrubGroup) cerramientoShrubGroup.style.display = 'block';

      if (btnCalculate) {
        const hasTrees = this.parsedTrees && this.parsedTrees.length > 0;
        btnCalculate.disabled = !hasTrees;
        btnCalculate.style.opacity = hasTrees ? '1' : '0.5';
        btnCalculate.style.cursor = hasTrees ? 'pointer' : 'not-allowed';
      }
    }

    this.updateStep2DensityCalculation();
    this.updateLiveShrubCalculation();
  }

  /**
   * Calcula la densidad en pies/ha a partir del total de árboles y la superficie muestreada
   */
  updateStep2DensityCalculation() {
    const elKmlArea = document.getElementById('step2-kml-area');
    const elSampleArea = document.getElementById('step2-sample-area');
    const elDensityVal = document.getElementById('step2-density-val');
    const elTreesTotalVal = document.getElementById('step2-trees-total-val');
    const elDensityLabel = document.getElementById('step2-density-label');
    const elModeCensus = document.getElementById('step2-inventory-mode-census');

    const kmlArea = parseFloat(elKmlArea?.value) || (this.kmlData ? this.kmlData.totalAreaHa : 1.0);
    const isPlantacion = this.projectInfo.strategyId === 'plantaciones';

    if (isPlantacion) {
      const plantDensity = parseFloat(document.getElementById('step2-action-param-input')?.value) || 400;
      const totalTreesToPlant = Math.round(plantDensity * kmlArea);

      if (elDensityLabel) elDensityLabel.innerText = "Densidad Prevista de Plantación";
      if (elDensityVal) elDensityVal.innerText = `${plantDensity.toLocaleString('es-ES')} pies/ha`;
      if (elTreesTotalVal) {
        elTreesTotalVal.innerText = `${totalTreesToPlant.toLocaleString('es-ES')} árboles a plantar en la finca (${kmlArea.toLocaleString('es-ES')} ha)`;
      }
    } else {
      if (elDensityLabel) elDensityLabel.innerText = "Densidad Existente Estimada";

      const isCensus = elModeCensus && elModeCensus.checked;
      let sampleArea = 1.0;
      if (isCensus) {
        sampleArea = kmlArea;
        if (elSampleArea) elSampleArea.value = kmlArea;
      } else {
        sampleArea = parseFloat(elSampleArea?.value) || 1.0;
      }

      const treesCount = this.parsedTrees ? this.parsedTrees.length : 0;
      if (treesCount > 0 && sampleArea > 0) {
        const rawDensity = treesCount / sampleArea;
        const displayDensity = rawDensity >= 10 ? Math.round(rawDensity) : (Math.round(rawDensity * 10) / 10);
        const totalFincaTrees = Math.round(rawDensity * kmlArea);

        if (elDensityVal) elDensityVal.innerText = `${displayDensity.toLocaleString('es-ES')} pies/ha (existentes)`;
        if (elTreesTotalVal) {
          elTreesTotalVal.innerText = `~${totalFincaTrees.toLocaleString('es-ES')} árboles estimados en la finca (${kmlArea.toLocaleString('es-ES')} ha)`;
        }
      } else {
        if (elDensityVal) elDensityVal.innerText = `0 pies/ha`;
        if (elTreesTotalVal) elTreesTotalVal.innerText = `Sube inventario CSV/Excel para calcular (${kmlArea.toLocaleString('es-ES')} ha)`;
      }
    }
  }

  /**
   * Calcula en tiempo real la biomasa de matorral con Montero et al. (2020)
   */
  updateLiveShrubCalculation() {
    const shrubType = document.getElementById('step2-shrub-type')?.value || 'A19';
    const fcc = parseFloat(document.getElementById('step2-shrub-fcc')?.value) || 0;
    const heightDm = parseFloat(document.getElementById('step2-shrub-height')?.value) || 8.0;

    const biomassHa = CarbonEngine.calculateShrubBiomass(shrubType, fcc, heightDm);
    const co2Ha = biomassHa * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO;

    const kpiBadge = document.getElementById('step2-shrub-biomass-kpi');
    if (kpiBadge) {
      kpiBadge.innerText = `Biomasa Matorral: ${biomassHa.toFixed(2)} t/ha (${co2Ha.toFixed(2)} t CO₂e/ha)`;
    }
  }

  /**
   * Renderiza la ficha de resumen del proyecto en los pasos 2 y 3
   */
  renderProjectSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sp = this.speciesDb.species.find(s => s.id === this.projectInfo.speciesId);
    const reg = this.regulationsDb.regions.find(r => r.id === this.projectInfo.regionId);
    const strat = this.regulationsDb.strategies.find(s => s.id === this.projectInfo.strategyId);

    container.innerHTML = `
      <div class="project-summary-item">
        <span class="label">Proyecto</span>
        <span class="val">${escapeHtml(this.projectInfo.name) || '-'}</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Titular</span>
        <span class="val">${escapeHtml(this.projectInfo.owner) || '-'} (${escapeHtml(this.projectInfo.nif) || '-'})</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Finca / Monte</span>
        <span class="val">${escapeHtml(this.projectInfo.estate) || '-'}</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Ubicación</span>
        <span class="val">${escapeHtml(this.projectInfo.municipality) || '-'} (${escapeHtml(this.projectInfo.province) || '-'}, ${reg ? escapeHtml(reg.name) : '-'})</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Especie Principal</span>
        <span class="val">${sp ? escapeHtml(sp.common_name) : '-'}</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Actuación del Proyecto</span>
        <span class="val">${strat ? escapeHtml(strat.name) : '-'}</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Superficie KML</span>
        <span class="val" style="color: var(--idaf-light-green);">${this.kmlData ? `${this.kmlData.totalAreaHa} ha` : 'No delimitado'}</span>
      </div>
      <div class="project-summary-item">
        <span class="label">Justificación Elegibilidad</span>
        <span class="val" style="color: var(--idaf-dark-green);"><i class="fa-solid fa-file-pdf" style="color: #dc2626; margin-right: 4px;"></i>${this.eligibilityPdf ? escapeHtml(this.eligibilityPdf.name) : 'No adjuntada'}</span>
      </div>
    `;
  }

  /**
   * Enlaza eventos generales y navegación
   */
  bindEvents() {
    // Botón Continuar de Paso 1 a Paso 2
    const btnGotoStep2 = document.getElementById('btn-goto-step-2');
    if (btnGotoStep2) {
      btnGotoStep2.addEventListener('click', () => {
        // Validar datos de formulario
        const name = document.getElementById('proj-name').value.trim();
        const owner = document.getElementById('proj-owner').value.trim();
        const nif = document.getElementById('proj-nif').value.trim();
        const estate = document.getElementById('proj-estate').value.trim();
        const province = document.getElementById('proj-province').value.trim();
        const municipality = document.getElementById('proj-municipality').value.trim();

        if (!name || !owner || !nif || !estate || !province || !municipality) {
          alert("Por favor, completa todos los campos obligatorios del proyecto marcados con (*).");
          return;
        }

        if (!this.kmlData) {
          alert("Por favor, sube el archivo KML de delimitación geográfica de la finca antes de continuar.");
          return;
        }

        if (!this.eligibilityPdf) {
          alert("Por favor, sube el archivo PDF con la justificación técnica de los criterios de elegibilidad de la actuación.");
          return;
        }

        // Guardar estado del proyecto
        this.projectInfo = {
          name,
          owner,
          nif,
          estate,
          regionId: document.getElementById('proj-region').value,
          province,
          municipality,
          cadastral: document.getElementById('proj-cadastral').value.trim(),
          speciesId: document.getElementById('proj-species').value,
          treatmentId: document.getElementById('proj-treatment').value,
          strategyId: document.getElementById('proj-strategy').value
        };

        this.setStep(2);
      });
    }

    // Botón Volver de Paso 2 a Paso 1
    const btnBackToStep1 = document.getElementById('btn-back-to-step-1');
    if (btnBackToStep1) {
      btnBackToStep1.addEventListener('click', () => {
        this.setStep(1);
      });
    }

    // Eventos interactivos de cálculo en vivo de Paso 2
    const elSampleArea = document.getElementById('step2-sample-area');
    if (elSampleArea) {
      elSampleArea.addEventListener('input', () => {
        elSampleArea.dataset.userEdited = 'true';
        this.updateStep2DensityCalculation();
      });
    }

    // Modalidad de inventario: Muestreo vs Censo completo
    const modeRadios = document.querySelectorAll('input[name="step2-inventory-mode"]');
    modeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const elSample = document.getElementById('step2-sample-area');
        const kmlArea = parseFloat(document.getElementById('step2-kml-area')?.value) || (this.kmlData ? this.kmlData.totalAreaHa : 1.0);
        if (radio.value === 'census') {
          if (elSample) {
            elSample.value = kmlArea;
            elSample.disabled = true;
          }
        } else {
          if (elSample) {
            elSample.disabled = false;
            elSample.value = "1.0";
          }
        }
        this.updateStep2DensityCalculation();
      });
    });

    // Parámetro dinámico de la actuación (Densidad plantación, añadida o regenerada)
    const elActionParam = document.getElementById('step2-action-param-input');
    if (elActionParam) {
      elActionParam.addEventListener('input', () => {
        elActionParam.dataset.userEdited = 'true';
        this.updateStep2DensityCalculation();
      });
    }

    const shrubInputs = ['step2-shrub-type', 'step2-shrub-fcc', 'step2-shrub-height'];
    shrubInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.updateLiveShrubCalculation());
        el.addEventListener('input', () => this.updateLiveShrubCalculation());
      }
    });

    // Botón Ejecutar Cálculos de Paso 2 a Paso 3
    const btnCalculate = document.getElementById('btn-calculate-and-results');
    if (btnCalculate) {
      btnCalculate.addEventListener('click', () => {
        if (this.projectInfo.strategyId !== 'plantaciones' && (!this.parsedTrees || this.parsedTrees.length === 0)) {
          alert("Debes subir un archivo CSV o Excel con el inventario pie a pie para caracterizar la masa existente.");
          return;
        }

        this.runSimulationAndShowResults();
        this.setStep(3);
      });
    }

    // Botón Volver de Paso 3 a Paso 2
    const btnBackToStep2 = document.getElementById('btn-back-to-step-2');
    if (btnBackToStep2) {
      btnBackToStep2.addEventListener('click', () => {
        this.setStep(2);
      });
    }

    // Botones de impresión PDF
    const btnPrint = document.getElementById('btn-print');
    const btnPrintStep3 = document.getElementById('btn-print-step3');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        if (this.currentStep !== 3 || !this.lastSimulationResult) {
          alert("Para emitir o imprimir el informe técnico en PDF, completa primero el cálculo de resultados en el Paso 3.");
          return;
        }
        ReportManager.printReport();
      });
    }
    if (btnPrintStep3) btnPrintStep3.addEventListener('click', () => ReportManager.printReport());

    // Botón Exportar a Excel
    const btnExportExcel = document.getElementById('btn-export-excel');
    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', () => {
        if (this.lastSimulationResult) {
          const name = this.projectInfo.name || "Proyecto_Absorcion_IDAF";
          ReportManager.exportProjectionToExcel(
            this.lastSimulationResult.aggregatedYearly,
            this.lastSimulationResult.summary,
            name
          );
        }
      });
    }

    // Botón Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm("¿Deseas cerrar tu sesión en la plataforma?")) {
          AuthManager.logout();
        }
      });
    }

    // Modal de Ayuda
    const btnHelp = document.getElementById('btn-help');
    const modalHelp = document.getElementById('modal-help');
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnHelp && modalHelp) btnHelp.addEventListener('click', () => modalHelp.classList.add('active'));
    if (btnCloseModal && modalHelp) btnCloseModal.addEventListener('click', () => modalHelp.classList.remove('active'));
    if (modalHelp) {
      modalHelp.addEventListener('click', (e) => {
        if (e.target === modalHelp) modalHelp.classList.remove('active');
      });
    }
  }

  /**
   * Gestión de eventos de carga del archivo KML y visualización de mapa
   */
  bindKmlEvents() {
    const dropzoneKml = document.getElementById('dropzone-kml');
    const fileInputKml = document.getElementById('file-input-kml');

    if (!dropzoneKml || !fileInputKml) return;

    dropzoneKml.addEventListener('click', () => fileInputKml.click());

    dropzoneKml.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneKml.classList.add('dragover');
    });

    dropzoneKml.addEventListener('dragleave', () => {
      dropzoneKml.classList.remove('dragover');
    });

    dropzoneKml.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneKml.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleKmlFile(e.dataTransfer.files[0]);
      }
    });

    fileInputKml.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleKmlFile(e.target.files[0]);
      }
    });
  }

  /**
   * Procesa el archivo KML, calcula superficie y muestra en mapa Leaflet
   */
  handleKmlFile(file) {
    if (!file.name.toLowerCase().endsWith('.kml')) {
      alert("Por favor selecciona un archivo con extensión .kml");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = KmlParser.parseKml(text);

        this.kmlData = {
          geojson: parsed.geojson,
          totalAreaHa: parsed.totalAreaHa,
          filename: file.name
        };

        // Mostrar alerta y resultado
        const alertBox = document.getElementById('kml-status-alert');
        const mapWrapper = document.getElementById('kml-map-wrapper');
        const calculatedAreaEl = document.getElementById('kml-calculated-area');

        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.className = 'alert-box alert-success';
          alertBox.innerHTML = `
            <i class="fa-solid fa-circle-check" style="font-size: 18px; margin-top: 2px;"></i>
            <div>
              <strong>KML procesado con éxito:</strong> ${escapeHtml(file.name)} 
              (${parsed.featureCount} geometría(s) detectada(s)).
            </div>
          `;
        }

        if (calculatedAreaEl) {
          calculatedAreaEl.innerText = `Superficie detectada: ${parsed.totalAreaHa.toLocaleString('es-ES')} ha`;
        }

        if (mapWrapper) {
          mapWrapper.style.display = 'block';
        }

        // Renderizar mapa interactivo
        const projTitle = document.getElementById('proj-estate').value.trim() || document.getElementById('proj-name').value.trim() || "Finca de Proyecto";
        this.mapManager.displayKmlGeoJson(parsed.geojson, projTitle);

      } catch (err) {
        console.error("Error al procesar KML:", err);
        const alertBox = document.getElementById('kml-status-alert');
        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.className = 'alert-box alert-warning';
          alertBox.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 18px; margin-top: 2px;"></i>
            <div><strong>Error al leer el archivo KML:</strong> ${escapeHtml(err.message)}</div>
          `;
        }
      }
    };

    reader.readAsText(file);
  }

  /**
   * Gestión de eventos de carga de archivo PDF de justificación de elegibilidad
   */
  bindPdfEvents() {
    const dropzonePdf = document.getElementById('dropzone-pdf');
    const fileInputPdf = document.getElementById('file-input-pdf');

    if (!dropzonePdf || !fileInputPdf) return;

    dropzonePdf.addEventListener('click', () => fileInputPdf.click());

    dropzonePdf.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzonePdf.style.borderColor = 'var(--idaf-light-green)';
      dropzonePdf.style.backgroundColor = 'var(--idaf-light-light)';
    });

    dropzonePdf.addEventListener('dragleave', () => {
      dropzonePdf.style.borderColor = '#9ca3af';
      dropzonePdf.style.backgroundColor = 'white';
    });

    dropzonePdf.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzonePdf.style.borderColor = '#9ca3af';
      dropzonePdf.style.backgroundColor = 'white';
      if (e.dataTransfer.files.length > 0) {
        this.handlePdfFile(e.dataTransfer.files[0]);
      }
    });

    fileInputPdf.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handlePdfFile(e.target.files[0]);
      }
    });
  }

  /**
   * Procesa el archivo PDF de justificación de elegibilidad
   */
  handlePdfFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert("Por favor selecciona un archivo en formato PDF (.pdf)");
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    this.eligibilityPdf = {
      name: file.name,
      size: `${sizeKb} KB`
    };

    const alertBox = document.getElementById('pdf-status-alert');
    if (alertBox) {
      alertBox.style.display = 'flex';
      alertBox.className = 'alert-box alert-success';
      alertBox.innerHTML = `
        <i class="fa-solid fa-file-circle-check" style="font-size: 18px; margin-top: 2px;"></i>
        <div>
          <strong>Documento de elegibilidad adjuntado:</strong> ${escapeHtml(file.name)} (${sizeKb} KB).
        </div>
      `;
    }
  }

  /**
   * Gestión de eventos de carga de archivo CSV de inventario
   */
  bindCsvEvents() {
    const dropzoneCsv = document.getElementById('dropzone-csv');
    const fileInputCsv = document.getElementById('file-input-csv');

    if (!dropzoneCsv || !fileInputCsv) return;

    dropzoneCsv.addEventListener('click', () => fileInputCsv.click());

    dropzoneCsv.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneCsv.classList.add('dragover');
    });

    dropzoneCsv.addEventListener('dragleave', () => {
      dropzoneCsv.classList.remove('dragover');
    });

    dropzoneCsv.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneCsv.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleCsvFile(e.dataTransfer.files[0]);
      }
    });

    fileInputCsv.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleCsvFile(e.target.files[0]);
      }
    });
  }

  /**
   * Procesa el CSV subido por el usuario a nivel de árbol individual (pie a pie)
   */
  handleCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const parsed = FileParser.parseWorkbook(data, this.speciesDb.species);

        this.parsedTrees = parsed.trees;
        this.treeSummary = parsed.summary;
        this.inventoryFilename = file.name;

        // Mostrar alerta
        const alertBox = document.getElementById('csv-status-alert');
        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.className = 'alert-box alert-success';
          alertBox.innerHTML = `
            <i class="fa-solid fa-circle-check" style="font-size: 18px; margin-top: 2px;"></i>
            <div>
              <strong>Inventario pie a pie cargado correctamente:</strong> ${escapeHtml(file.name)} 
              (${parsed.totalRows} árboles procesados y calculados con Ruiz-Peinado et al., 2012).
            </div>
          `;
        }

        // Mostrar panel de parámetros interactivos
        const paramPanel = document.getElementById('step2-parameters-panel');
        if (paramPanel) paramPanel.style.display = 'block';

        // Actualizar densidad y matorral en tiempo real
        this.updateStep2DensityCalculation();
        this.updateLiveShrubCalculation();

        // Actualizar KPIs dendrométricos de Step 2
        const elKpiCount = document.getElementById('step2-kpi-trees-count');
        const elKpiDbh = document.getElementById('step2-kpi-mean-dbh');
        const elKpiHeight = document.getElementById('step2-kpi-mean-height');
        const elKpiBiomass = document.getElementById('step2-kpi-mean-biomass');
        const elKpiCO2 = document.getElementById('step2-kpi-mean-co2');

        if (elKpiCount) elKpiCount.innerText = `${parsed.summary.totalTrees} pies`;
        if (elKpiDbh) elKpiDbh.innerText = `${parsed.summary.meanDbh.toLocaleString('es-ES')} cm`;
        if (elKpiHeight) elKpiHeight.innerText = `${parsed.summary.meanHeight.toLocaleString('es-ES')} m`;
        if (elKpiBiomass) elKpiBiomass.innerText = `${parsed.summary.meanBiomassKgPerTree.toLocaleString('es-ES')} kg`;
        if (elKpiCO2) elKpiCO2.innerText = `${parsed.summary.meanCO2PerTreeTons.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t`;

        // Mostrar tabla de previsualización árbol a árbol con fracciones
        const previewContainer = document.getElementById('csv-preview-container');
        const previewTbody = document.getElementById('csv-preview-tbody');
        const rowsCountBadge = document.getElementById('csv-rows-count');

        if (previewContainer && previewTbody) {
          previewContainer.style.display = 'block';
          if (rowsCountBadge) rowsCountBadge.innerText = `${parsed.trees.length} árboles`;

          previewTbody.innerHTML = parsed.trees.slice(0, 15).map(t => `
            <tr>
              <td><strong>${escapeHtml(t.id)}</strong></td>
              <td>${escapeHtml(t.speciesName)}</td>
              <td>${t.dbh.toLocaleString('es-ES')} cm</td>
              <td>${t.height.toLocaleString('es-ES')} m</td>
              <td>${t.stemKg.toLocaleString('es-ES')} kg</td>
              <td>${(Math.round((t.thickBranchesKg + t.medBranchesKg) * 10) / 10).toLocaleString('es-ES')} kg</td>
              <td>${t.rootsKg.toLocaleString('es-ES')} kg</td>
              <td style="font-weight: 600; color: var(--idaf-dark-green);">${t.totalBiomassKg.toLocaleString('es-ES')} kg</td>
              <td style="font-weight: 700; color: var(--idaf-light-green);">${t.co2Kg.toLocaleString('es-ES')} kg</td>
            </tr>
          `).join('') + (parsed.trees.length > 15 ? `<tr><td colspan="9" style="text-align:center; color: var(--slate-500); font-style: italic;">... y ${parsed.trees.length - 15} árboles adicionales calculados individualmente</td></tr>` : '');
        }

        // Habilitar botón de continuar al Paso 3
        const btnCalculate = document.getElementById('btn-calculate-and-results');
        if (btnCalculate) {
          btnCalculate.disabled = false;
          btnCalculate.style.opacity = '1';
          btnCalculate.style.cursor = 'pointer';
        }

      } catch (err) {
        console.error("Error al procesar archivo CSV pie a pie:", err);
        const alertBox = document.getElementById('csv-status-alert');
        if (alertBox) {
          alertBox.style.display = 'flex';
          alertBox.className = 'alert-box alert-warning';
          alertBox.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 18px; margin-top: 2px;"></i>
            <div><strong>Error al leer el archivo de inventario:</strong> ${escapeHtml(err.message)}</div>
          `;
        }
      }
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Ejecuta la simulación con los datos del inventario del usuario y muestra resultados (Paso 3)
   */
  runSimulationAndShowResults() {
    const creditingYears = parseInt(document.getElementById('step2-crediting-years').value) || 30;
    const riskBufferPct = parseFloat(document.getElementById('step2-risk-buffer').value) || 15.0;
    const carbonPriceEur = parseFloat(document.getElementById('step2-carbon-price').value) || 25.0;

    const standAge = parseInt(document.getElementById('step2-stand-age').value) || 25;
    const potentiality = parseFloat(document.getElementById('step2-potentiality').value) || 0.85;

    const shrubType = document.getElementById('step2-shrub-type')?.value || 'A19';
    const shrubFcc = parseFloat(document.getElementById('step2-shrub-fcc')?.value) || 20.0;
    const shrubHeightDm = parseFloat(document.getElementById('step2-shrub-height')?.value) || 8.0;

    const kmlArea = parseFloat(document.getElementById('step2-kml-area')?.value) || (this.kmlData ? this.kmlData.totalAreaHa : 1.0);
    const elModeCensus = document.getElementById('step2-inventory-mode-census');
    const isCensus = elModeCensus && elModeCensus.checked;
    const sampleArea = isCensus ? kmlArea : (parseFloat(document.getElementById('step2-sample-area')?.value) || 1.0);
    const treesCount = this.parsedTrees ? this.parsedTrees.length : 0;

    const isPlantacion = this.projectInfo.strategyId === 'plantaciones';
    const actionParam = parseFloat(document.getElementById('step2-action-param-input')?.value) || (isPlantacion ? 400 : 180);
    const shrubFccTarget = parseFloat(document.getElementById('step2-shrub-fcc-target')?.value) || 55.0;

    // Para Plantaciones: la densidad a modelar es la densidad a plantar (actionParam)
    // Para Densificaciones o Cerramientos: la densidad base de partida es la calculada del inventario
    let standDensity = 240;
    if (isPlantacion) {
      standDensity = actionParam;
    } else {
      standDensity = (treesCount > 0 && sampleArea > 0) ? (treesCount / sampleArea) : 180;
    }

    const primarySpecies = this.projectInfo.speciesId || (this.parsedTrees && this.parsedTrees[0]?.speciesId) || 'quercus_suber';

    const stand = new ForestStand({
      id: this.projectInfo.estate || "Finca_Proyecto",
      name: this.projectInfo.name || "Monte Alcornocal",
      speciesId: primarySpecies,
      areaHa: kmlArea,
      currentAge: standAge,
      density: standDensity,
      dbh: this.treeSummary?.meanDbh || 18.0,
      height: this.treeSummary?.meanHeight || 6.0,
      potentiality: potentiality,
      shrubType: shrubType,
      shrubFcc: shrubFcc,
      shrubHeightDm: shrubHeightDm,
      addedDensity: actionParam,
      recruitedDensity: actionParam,
      shrubFccTarget: shrubFccTarget
    });

    stand.trees = this.parsedTrees || [];
    stand.treeSummary = this.treeSummary;

    const scenario = new ManagementScenario({
      strategyId: this.projectInfo.strategyId || 'plantaciones',
      creditingYears,
      riskBufferPct,
      leakagePct: 5.0,
      carbonPriceEur,
      potentiality
    });

    // Simular el rodal/finca según D6.2
    const result = CarbonEngine.simulateInventory(
      [stand],
      scenario,
      this.speciesDb,
      this.regulationsDb
    );

    this.lastSimulationResult = result;

    // Actualizar KPIs
    this.updateKPIs(result.summary);

    // Actualizar Gráficos con identidad IDAF
    this.renderCharts(result.aggregatedYearly);

    // Actualizar Tabla Detallada
    this.renderDetailedTable(result.aggregatedYearly);
  }

  /**
   * Actualiza las tarjetas KPI
   */
  updateKPIs(summary) {
    const elTotalCredits = document.getElementById('kpi-total-credits');
    const elAnnualCredits = document.getElementById('kpi-annual-credits');
    const elCreditsPerHa = document.getElementById('kpi-credits-per-ha');
    const elEconomicVal = document.getElementById('kpi-economic-val');
    const elBufferCredits = document.getElementById('kpi-buffer-credits');

    const totalNet = Math.round(summary.totalNetCredits || 0);
    const avgAnnual = Math.round(summary.averageAnnualCredits || 0);
    const perHa = Math.round((summary.creditsPerHa || 0) * 10) / 10;
    const econVal = Math.round(summary.estimatedEconomicValueEur || 0);
    const bufferVal = Math.round(summary.bufferCreditsDeducted || 0);

    if (elTotalCredits) elTotalCredits.innerText = `${totalNet.toLocaleString('es-ES')} t CO₂e`;
    if (elAnnualCredits) elAnnualCredits.innerText = `${avgAnnual.toLocaleString('es-ES')} t CO₂e/año`;
    if (elCreditsPerHa) elCreditsPerHa.innerText = `${perHa.toLocaleString('es-ES')} t CO₂e/ha`;
    if (elEconomicVal) elEconomicVal.innerText = `${econVal.toLocaleString('es-ES')} €`;
    if (elBufferCredits) elBufferCredits.innerText = `${bufferVal.toLocaleString('es-ES')} t CO₂e`;
  }

  /**
   * Dibuja los gráficos interactivos de resultados
   */
  renderCharts(yearlyData) {
    const canvasEvolution = document.getElementById('chart-evolution');
    const canvasCredits = document.getElementById('chart-credits');

    if (canvasEvolution) {
      this.chartManager.renderEvolutionChart(canvasEvolution.getContext('2d'), yearlyData, true);
    }
    if (canvasCredits) {
      this.chartManager.renderCreditsChart(canvasCredits.getContext('2d'), yearlyData);
    }
  }

  /**
   * Renderiza la tabla de proyección año a año
   */
  renderDetailedTable(yearlyData) {
    const tbody = document.getElementById('table-projection-body');
    if (!tbody) return;

    tbody.innerHTML = yearlyData.map(d => `
      <tr>
        <td><strong>Año ${d.year}</strong></td>
        <td>${d.standAge ?? '-'}</td>
        <td>${Math.round(d.baselineCO2Total || 0).toLocaleString('es-ES')}</td>
        <td>${Math.round(d.projectCO2Total || 0).toLocaleString('es-ES')}</td>
        <td>${Math.round(d.additionalCO2Total || 0).toLocaleString('es-ES')}</td>
        <td style="color: var(--idaf-light-green); font-weight: 600;">${Math.round(d.annualNetCredits || 0).toLocaleString('es-ES')}</td>
        <td style="color: var(--idaf-dark-green); font-weight: 700;">${Math.round(d.cumulativeNetCredits || 0).toLocaleString('es-ES')}</td>
      </tr>
    `).join('');
  }
}

// Inicializar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  window.CO2App = new AppController();
});
