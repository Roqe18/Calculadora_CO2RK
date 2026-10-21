/**
 * CONTROLADOR PRINCIPAL DE LA APP MÓVIL DE CAMPO (PWA)
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 * Diseñado para toma de datos táctil ultra-rápida, ergonómica y 100% offline.
 */

import { FieldStorage } from './fieldStorage.js';
import { FieldExporter } from './fieldExporter.js';
import { CarbonEngine } from '../core/calculations.js';
import { CONFIG } from '../config.js';

// Lista de especies de reserva si la petición de red falla en offline total
const DEFAULT_SPECIES = [
  { id: 'quercus_suber', scientific_name: 'Quercus suber', common_name: 'Alcornoque' },
  { id: 'quercus_ilex', scientific_name: 'Quercus ilex', common_name: 'Encina' },
  { id: 'pinus_pinea', scientific_name: 'Pinus pinea', common_name: 'Pino piñonero' },
  { id: 'quercus_faginea', scientific_name: 'Quercus faginea', common_name: 'Quejigo' },
  { id: 'castanea_sativa', scientific_name: 'Castanea sativa', common_name: 'Castaño' },
  { id: 'ceratonia_siliqua', scientific_name: 'Ceratonia siliqua', common_name: 'Algarrobo' },
  { id: 'quercus_pyrenaica', scientific_name: 'Quercus pyrenaica', common_name: 'Roble melojo' },
  { id: 'quercus_canariensis', scientific_name: 'Quercus canariensis', common_name: 'Quejigo andaluz' },
  { id: 'olea_europaea', scientific_name: 'Olea europaea var. sylvestris', common_name: 'Acebuche' },
  { id: 'celtis_australis', scientific_name: 'Celtis australis', common_name: 'Almez' },
  { id: 'juglans_regia', scientific_name: 'Juglans regia', common_name: 'Nogal común' },
  { id: 'pinus_pinaster', scientific_name: 'Pinus pinaster', common_name: 'Pino negral' },
  { id: 'pinus_halepensis', scientific_name: 'Pinus halepensis', common_name: 'Pino carrasco' },
  { id: 'pinus_sylvestris', scientific_name: 'Pinus sylvestris', common_name: 'Pino albar' },
  { id: 'fagus_sylvatica', scientific_name: 'Fagus sylvatica', common_name: 'Haya' }
];

export class FieldApp {
  constructor() {
    this.storage = new FieldStorage();
    this.species = DEFAULT_SPECIES;
    this.plots = [];
    this.activePlot = null;
    this.selectedSpeciesId = 'quercus_suber';
    this.activeTab = 'measure'; // 'plots' | 'measure' | 'export'
  }

  /**
   * Inicializa la aplicación móvil
   */
  async init() {
    this.registerServiceWorker();
    this.setupNetworkMonitor();

    // 1. Iniciar IndexedDB
    try {
      await this.storage.init();
    } catch (err) {
      console.warn('Fallo inicializando IndexedDB, usando fallback:', err);
    }

    // 2. Cargar base de datos de especies
    await this.loadSpeciesDatabase();

    // 3. Cargar parcelas existentes o crear la primera
    await this.loadPlots();

    // 4. Renderizar componentes UI
    this.renderSpeciesSelectors();
    this.bindEvents();
    this.switchTab('measure');
    this.updateUI();
  }

  /**
   * Registra el Service Worker para soporte offline
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[IDAF Campo] Service Worker registrado:', reg.scope);
        })
        .catch(err => {
          console.warn('[IDAF Campo] Error registrando Service Worker:', err);
        });
    }
  }

  /**
   * Monitoriza estado de conexión en campo
   */
  setupNetworkMonitor() {
    const updateOnlineStatus = () => {
      const badge = document.getElementById('connection-status-badge');
      if (!badge) return;
      if (navigator.onLine) {
        badge.innerHTML = '<i class="fa-solid fa-wifi"></i> Online';
        badge.className = 'status-badge online';
      } else {
        badge.innerHTML = '<i class="fa-solid fa-plane"></i> Modo Offline (100% Funcional)';
        badge.className = 'status-badge offline';
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  /**
   * Carga base de datos de especies desde JSON o fallback
   */
  async loadSpeciesDatabase() {
    try {
      const res = await fetch('./data/species_database.json');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.species)) {
          this.species = data.species;
        }
      }
    } catch (e) {
      console.log('[IDAF Campo] Usando lista de especies local precacheada');
    }
  }

  /**
   * Carga la lista de parcelas de IndexedDB
   */
  async loadPlots() {
    this.plots = await this.storage.getAllPlots();

    if (this.plots.length === 0) {
      // Crear primera parcela por defecto con metadatos completos de proyecto y matorral
      const defaultPlot = {
        id: `plot_${Date.now()}`,
        name: 'Rodal 1 - Inventario',
        projectName: 'Proyecto de Absorción Forestal La Dehesilla',
        fincaNombre: 'Finca La Dehesilla',
        owner: 'Agropecuaria del Sur S.L.',
        nif: 'B12345678',
        province: 'Huelva',
        municipality: 'Aracena',
        cadastral: '21007A005000120000FP',
        primarySpecies: 'quercus_suber',
        totalAreaHa: 25.0,
        actuacion: 'densificacion',
        modalidad: 'muestreo',
        superficieMuestreadaHa: 1.0,
        edadMasa: 45,
        potencialidad: 0.85,
        matorral: {
          tipo: 'A19',
          fccPct: 20,
          alturaMediaDm: 8.0,
          fccTarget: 55.0
        },
        trees: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await this.storage.savePlot(defaultPlot);
      this.plots = [defaultPlot];
      this.activePlot = defaultPlot;
    } else {
      // Tomar la última modificada
      this.activePlot = this.plots[0];
    }
  }

  /**
   * Renderiza los botones rápidos de especies y el desplegable completo
   */
  renderSpeciesSelectors() {
    const quickContainer = document.getElementById('quick-species-grid');
    const selectDropdown = document.getElementById('select-all-species');

    if (!quickContainer || !selectDropdown) return;

    // Top 6 especies forestales de proyectos IDAF
    const quickIds = ['quercus_suber', 'quercus_ilex', 'pinus_pinea', 'quercus_faginea', 'castanea_sativa', 'ceratonia_siliqua'];

    quickContainer.innerHTML = '';
    quickIds.forEach(id => {
      const sp = this.species.find(s => s.id === id) || { id, common_name: id, scientific_name: id };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-species-pill ${id === this.selectedSpeciesId ? 'active' : ''}`;
      btn.dataset.speciesId = id;
      btn.innerHTML = `
        <span class="sp-name">${sp.common_name}</span>
        <span class="sp-sci">${sp.scientific_name}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectSpecies(id);
      });
      quickContainer.appendChild(btn);
    });

    // Desplegable con todas las especies disponibles
    selectDropdown.innerHTML = '';
    this.species.forEach(sp => {
      const opt = document.createElement('option');
      opt.value = sp.id;
      opt.textContent = `${sp.common_name} (${sp.scientific_name})`;
      if (sp.id === this.selectedSpeciesId) opt.selected = true;
      selectDropdown.appendChild(opt);
    });

    selectDropdown.addEventListener('change', (e) => {
      this.selectSpecies(e.target.value);
    });
  }

  /**
   * Cambia la especie seleccionada
   */
  selectSpecies(speciesId) {
    this.selectedSpeciesId = speciesId;

    // Actualizar estados visuales de los botones
    document.querySelectorAll('.btn-species-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speciesId === speciesId);
    });

    const selectDropdown = document.getElementById('select-all-species');
    if (selectDropdown) selectDropdown.value = speciesId;

    const sp = this.species.find(s => s.id === speciesId);
    const activeLabel = document.getElementById('current-species-label');
    if (activeLabel && sp) {
      activeLabel.innerText = `${sp.common_name} (${sp.scientific_name})`;
    }
  }

  /**
   * Genera el siguiente ID de árbol correlativo
   */
  getNextTreeId() {
    if (!this.activePlot || !this.activePlot.trees || this.activePlot.trees.length === 0) {
      return 'ARB_001';
    }

    let maxNum = 0;
    this.activePlot.trees.forEach(t => {
      const match = (t.id || '').match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    return `ARB_${String(maxNum + 1).padStart(3, '0')}`;
  }

  /**
   * Guarda un nuevo árbol medido en campo
   */
  async saveCurrentTree() {
    if (!this.activePlot) return;

    const inputId = document.getElementById('input-tree-id');
    const inputDbh = document.getElementById('input-tree-dbh');
    const inputHeight = document.getElementById('input-tree-height');

    const treeId = (inputId?.value || '').trim() || this.getNextTreeId();
    
    // Parseo tolerante a coma y punto decimal
    const parseNum = (val) => {
      if (!val) return NaN;
      return parseFloat(String(val).replace(',', '.'));
    };

    const dbh = parseNum(inputDbh?.value);
    const height = parseNum(inputHeight?.value);

    // Validaciones de campo
    if (isNaN(dbh) || dbh <= 0) {
      this.showToast('Introduce un valor válido de DBH (cm)', 'error');
      inputDbh?.focus();
      return;
    }

    if (isNaN(height) || height <= 0) {
      this.showToast('Introduce un valor válido de Altura (m)', 'error');
      inputHeight?.focus();
      return;
    }

    // Avisos de rango inusual
    if (dbh > 150) {
      if (!confirm(`El DBH introducido es muy alto (${dbh} cm). ¿Confirmas este valor?`)) {
        inputDbh?.focus();
        return;
      }
    }

    if (height > 35) {
      if (!confirm(`La altura introducida es muy alta (${height} m). ¿Confirmas este valor?`)) {
        inputHeight?.focus();
        return;
      }
    }

    const sp = this.species.find(s => s.id === this.selectedSpeciesId) || {
      id: this.selectedSpeciesId,
      common_name: this.selectedSpeciesId,
      scientific_name: this.selectedSpeciesId
    };

    // Cálculo alométrico inmediato con Ruiz-Peinado et al. (2012)
    const fractions = CarbonEngine.calculateRuizPeinadoBiomass(sp.id, dbh, height);
    const totalBiomassKg = fractions.totalKg;
    const co2Kg = (totalBiomassKg * CONFIG.CARBON_FRACTION_DEFAULT) * CONFIG.CO2_C_RATIO;

    const newTree = {
      id: treeId,
      speciesId: sp.id,
      speciesName: sp.common_name,
      speciesScientific: sp.scientific_name,
      dbh: Math.round(dbh * 10) / 10,
      height: Math.round(height * 10) / 10,
      biomassKg: Math.round(totalBiomassKg * 10) / 10,
      co2Kg: Math.round(co2Kg * 10) / 10,
      timestamp: Date.now()
    };

    // Guardar en la parcela activa
    this.activePlot.trees.push(newTree);
    await this.storage.savePlot(this.activePlot);

    // Feedback háptico en móviles compatibles
    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    // Resetear formulario para el siguiente árbol pero manteniendo la especie activa
    if (inputDbh) inputDbh.value = '';
    if (inputHeight) inputHeight.value = '';
    if (inputId) inputId.value = this.getNextTreeId();

    this.showToast(`Árbol ${treeId} registrado (${dbh} cm, ${height} m)`, 'success');

    // Foco de nuevo a DBH para mediciones encadenadas
    if (inputDbh) inputDbh.focus();

    this.updateUI();
  }

  /**
   * Elimina un árbol registrado
   */
  async deleteTree(treeId) {
    if (!this.activePlot) return;
    if (confirm(`¿Eliminar el árbol ${treeId}?`)) {
      this.activePlot.trees = this.activePlot.trees.filter(t => t.id !== treeId);
      await this.storage.savePlot(this.activePlot);
      this.updateUI();
      this.showToast(`Árbol ${treeId} eliminado`, 'info');
    }
  }

  /**
   * Actualiza todos los componentes de la interfaz
   */
  updateUI() {
    this.updatePlotHeader();
    this.updateLiveStats();
    this.renderTreeList();
    this.renderPlotsList();
    this.updateExportView();
  }

  /**
   * Actualiza el encabezado con los datos de la parcela activa
   */
  updatePlotHeader() {
    const titleEl = document.getElementById('active-plot-title');
    const subtitleEl = document.getElementById('active-plot-subtitle');
    const inputId = document.getElementById('input-tree-id');

    if (!this.activePlot) return;

    if (titleEl) titleEl.innerText = this.activePlot.name || 'Sin nombre';
    if (subtitleEl) {
      const actLabels = {
        plantacion: 'Plantación',
        densificacion: 'Densificación',
        cerramiento: 'Cerramiento'
      };
      const actText = actLabels[this.activePlot.actuacion] || 'Densificación';
      const finca = this.activePlot.fincaNombre || 'Finca';
      const totalArea = this.activePlot.totalAreaHa || 25;
      const sampleArea = this.activePlot.superficieMuestreadaHa || 1.0;
      subtitleEl.innerText = `${finca} (${totalArea} ha) • ${actText} • Muestra ${sampleArea} ha`;
    }

    if (inputId && !inputId.value) {
      inputId.value = this.getNextTreeId();
    }
  }

  /**
   * Calcula y muestra estadísticas e inventario en tiempo real
   */
  updateLiveStats() {
    const trees = this.activePlot?.trees || [];
    const countEl = document.getElementById('stat-total-trees');
    const dbhEl = document.getElementById('stat-mean-dbh');
    const heightEl = document.getElementById('stat-mean-height');
    const biomassEl = document.getElementById('stat-total-biomass');
    const co2El = document.getElementById('stat-total-co2');

    const total = trees.length;
    if (total === 0) {
      if (countEl) countEl.innerText = '0 pies';
      if (dbhEl) dbhEl.innerText = '0.0 cm';
      if (heightEl) heightEl.innerText = '0.0 m';
      if (biomassEl) biomassEl.innerText = '0.0 kg';
      if (co2El) co2El.innerText = '0.00 t';
      return;
    }

    let sumDbh = 0;
    let sumHeight = 0;
    let sumBiomass = 0;
    let sumCO2 = 0;

    trees.forEach(t => {
      sumDbh += t.dbh || 0;
      sumHeight += t.height || 0;
      sumBiomass += t.biomassKg || 0;
      sumCO2 += t.co2Kg || 0;
    });

    const meanDbh = (sumDbh / total).toFixed(1);
    const meanHeight = (sumHeight / total).toFixed(1);
    const co2Tons = (sumCO2 / 1000).toFixed(2);

    if (countEl) countEl.innerText = `${total} pies`;
    if (dbhEl) dbhEl.innerText = `${meanDbh} cm`;
    if (heightEl) heightEl.innerText = `${meanHeight} m`;
    if (biomassEl) {
      biomassEl.innerText = sumBiomass > 1000 ? `${(sumBiomass / 1000).toFixed(2)} t` : `${sumBiomass.toFixed(0)} kg`;
    }
    if (co2El) co2El.innerText = `${co2Tons} t`;
  }

  /**
   * Renderiza la tabla de árboles medidos (los más recientes arriba)
   */
  renderTreeList() {
    const container = document.getElementById('field-tree-list-tbody');
    const countBadge = document.getElementById('badge-tree-count');
    if (!container) return;

    const trees = this.activePlot?.trees || [];
    if (countBadge) countBadge.innerText = `${trees.length} registrados`;

    if (trees.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #888; padding: 24px;">
            <i class="fa-solid fa-tree" style="font-size: 24px; color: #cbd5e1; margin-bottom: 8px; display: block;"></i>
            Aún no has registrado árboles en esta parcela.<br>Introduce el DBH y la Altura arriba para comenzar.
          </td>
        </tr>
      `;
      return;
    }

    // Mostrar los más recientes primero
    const reversed = [...trees].reverse();
    container.innerHTML = reversed.map(t => `
      <tr>
        <td><strong>${this.escapeHtml(t.id)}</strong></td>
        <td>
          <div style="font-weight: 500;">${this.escapeHtml(t.speciesName)}</div>
          <small style="color: #64748b; font-style: italic;">${this.escapeHtml(t.speciesScientific)}</small>
        </td>
        <td style="text-align: right; font-weight: 600;">${t.dbh.toFixed(1)} cm</td>
        <td style="text-align: right; font-weight: 600;">${t.height.toFixed(1)} m</td>
        <td style="text-align: center;">
          <button class="btn-delete-tree" data-tree-id="${this.escapeHtml(t.id)}" title="Eliminar árbol">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Asignar listeners a botones de borrar
    container.querySelectorAll('.btn-delete-tree').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteTree(btn.dataset.treeId);
      });
    });
  }

  /**
   * Renderiza la lista de parcelas en la pestaña de parcelas
   */
  renderPlotsList() {
    const container = document.getElementById('plots-card-list');
    if (!container) return;

    if (this.plots.length === 0) {
      container.innerHTML = '<p style="color: #64748b; text-align: center;">No hay parcelas creadas.</p>';
      return;
    }

    container.innerHTML = this.plots.map(p => {
      const isActive = p.id === this.activePlot?.id;
      const treeCount = (p.trees || []).length;
      return `
        <div class="plot-card ${isActive ? 'active-plot-card' : ''}" data-plot-id="${p.id}">
          <div class="plot-card-header">
            <div>
              <h4 style="margin: 0; font-size: 16px; color: #005027;">${this.escapeHtml(p.name)}</h4>
              <small style="color: #64748b;">${this.escapeHtml(p.fincaNombre || 'Finca')} • ${new Date(p.updatedAt).toLocaleDateString('es-ES')}</small>
            </div>
            <span class="badge ${isActive ? 'badge-primary' : 'badge-secondary'}">
              ${treeCount} pies
            </span>
          </div>
          <div class="plot-card-meta">
            <span>Actuación: <strong>${p.actuacion}</strong></span>
            <span>Sup: <strong>${p.superficieMuestreadaHa} ha</strong></span>
            <span>Matorral: <strong>${p.matorral?.tipo || 'A19'} (${p.matorral?.fccPct || 20}%)</strong></span>
          </div>
          <div class="plot-card-actions">
            <button class="btn btn-sm btn-select-plot" data-plot-id="${p.id}">
              ${isActive ? '<i class="fa-solid fa-check"></i> Activa' : '<i class="fa-solid fa-folder-open"></i> Abrir'}
            </button>
            <button class="btn btn-sm btn-danger btn-delete-plot" data-plot-id="${p.id}" title="Eliminar parcela">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Listeners
    container.querySelectorAll('.btn-select-plot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectPlot(btn.dataset.plotId);
      });
    });

    container.querySelectorAll('.btn-delete-plot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deletePlot(btn.dataset.plotId);
      });
    });

    container.querySelectorAll('.plot-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectPlot(card.dataset.plotId);
      });
    });
  }

  /**
   * Cambia la parcela activa
   */
  async selectPlot(plotId) {
    const plot = this.plots.find(p => p.id === plotId);
    if (plot) {
      this.activePlot = plot;
      this.updateUI();
      this.switchTab('measure');
      this.showToast(`Parcela "${plot.name}" seleccionada`, 'info');
    }
  }

  /**
   * Elimina una parcela
   */
  async deletePlot(plotId) {
    if (this.plots.length <= 1) {
      this.showToast('No puedes eliminar la única parcela existente', 'error');
      return;
    }

    if (confirm('¿Deseas eliminar permanentemente esta parcela y todos sus árboles?')) {
      await this.storage.deletePlot(plotId);
      this.plots = this.plots.filter(p => p.id !== plotId);
      if (this.activePlot?.id === plotId) {
        this.activePlot = this.plots[0];
      }
      this.updateUI();
      this.showToast('Parcela eliminada', 'info');
    }
  }

  /**
   * Abre el modal para crear una nueva parcela o editar los datos de la parcela activa
   */
  openPlotModal(isEdit = false) {
    const modal = document.getElementById('modal-new-plot');
    const titleEl = document.getElementById('modal-plot-title');
    const editIdInput = document.getElementById('edit-plot-id');
    const btnSubmit = document.getElementById('btn-submit-plot-form');
    if (!modal) return;

    if (isEdit && this.activePlot) {
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Datos de Proyecto, Parcela y Matorral';
      if (editIdInput) editIdInput.value = this.activePlot.id;
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';

      // Rellenar con los valores actuales
      const setValue = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
      };

      setValue('new-plot-project-name', this.activePlot.projectName || this.activePlot.name || '');
      setValue('new-plot-owner', this.activePlot.owner || 'Agropecuaria del Sur S.L.');
      setValue('new-plot-nif', this.activePlot.nif || 'B12345678');
      setValue('new-plot-finca', this.activePlot.fincaNombre || 'Finca Principal');
      setValue('new-plot-total-estate-area', this.activePlot.totalAreaHa || 25.0);
      setValue('new-plot-province', this.activePlot.province || 'Huelva');
      setValue('new-plot-municipality', this.activePlot.municipality || 'Aracena');
      setValue('new-plot-cadastral', this.activePlot.cadastral || '');

      setValue('new-plot-name', this.activePlot.name || '');
      setValue('new-plot-actuacion', this.activePlot.actuacion || 'densificacion');
      setValue('new-plot-species', this.activePlot.primarySpecies || this.selectedSpeciesId || 'quercus_suber');
      setValue('new-plot-area', this.activePlot.superficieMuestreadaHa || 1.0);
      setValue('new-plot-age', this.activePlot.edadMasa || 45);
      setValue('new-plot-pot', this.activePlot.potencialidad || 0.85);

      setValue('new-plot-shrub-type', this.activePlot.matorral?.tipo || 'A19');
      setValue('new-plot-shrub-fcc', this.activePlot.matorral?.fccPct !== undefined ? this.activePlot.matorral.fccPct : 20);
      setValue('new-plot-shrub-height', this.activePlot.matorral?.alturaMediaDm !== undefined ? this.activePlot.matorral.alturaMediaDm : 8.0);
      setValue('new-plot-shrub-fcc-target', this.activePlot.matorral?.fccTarget !== undefined ? this.activePlot.matorral.fccTarget : 55.0);

    } else {
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Nueva Parcela / Rodal de Muestreo';
      if (editIdInput) editIdInput.value = '';
      if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Crear Parcela';

      const elName = document.getElementById('new-plot-name');
      if (elName) elName.value = `Parcela ${this.plots.length + 1}`;
      const elArea = document.getElementById('new-plot-area');
      if (elArea) elArea.value = '1.0';
    }

    // Visibilidad del target de cerramiento
    const actSelect = document.getElementById('new-plot-actuacion');
    const targetGroup = document.getElementById('new-plot-shrub-target-container');
    if (targetGroup && actSelect) {
      targetGroup.style.display = actSelect.value === 'cerramiento' ? 'block' : 'none';
    }

    this.updateModalShrubPreview();
    modal.style.display = 'flex';
  }

  /**
   * Calcula y muestra en vivo la biomasa de matorral dentro del modal
   */
  updateModalShrubPreview() {
    const badge = document.getElementById('modal-shrub-calc-badge');
    if (!badge) return;

    const type = document.getElementById('new-plot-shrub-type')?.value || 'A19';
    const fcc = parseFloat(document.getElementById('new-plot-shrub-fcc')?.value) || 20;
    const heightDm = parseFloat(document.getElementById('new-plot-shrub-height')?.value) || 8.0;

    const biomassHa = CarbonEngine.calculateShrubBiomass(type, fcc, heightDm);
    const co2Ha = biomassHa * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO;

    badge.innerText = `Biomasa: ${biomassHa.toFixed(2)} t/ha (${co2Ha.toFixed(2)} t CO2e/ha)`;
  }

  /**
   * Guarda o actualiza una parcela completa con datos de proyecto y matorral
   */
  async savePlotForm(formData) {
    const editId = formData.editPlotId;

    if (editId) {
      // MODO EDICIÓN
      const targetPlot = this.plots.find(p => p.id === editId);
      if (targetPlot) {
        targetPlot.name = formData.name || targetPlot.name;
        targetPlot.projectName = formData.projectName || targetPlot.projectName;
        targetPlot.fincaNombre = formData.fincaNombre || targetPlot.fincaNombre;
        targetPlot.owner = formData.owner || targetPlot.owner;
        targetPlot.nif = formData.nif || targetPlot.nif;
        targetPlot.province = formData.province || targetPlot.province;
        targetPlot.municipality = formData.municipality || targetPlot.municipality;
        targetPlot.cadastral = formData.cadastral || targetPlot.cadastral;
        targetPlot.totalAreaHa = parseFloat(formData.totalAreaHa) || targetPlot.totalAreaHa || 25.0;
        targetPlot.primarySpecies = formData.primarySpecies || targetPlot.primarySpecies || 'quercus_suber';

        targetPlot.actuacion = formData.actuacion || targetPlot.actuacion;
        targetPlot.superficieMuestreadaHa = parseFloat(formData.superficieMuestreadaHa) || 1.0;
        targetPlot.edadMasa = parseInt(formData.edadMasa, 10) || 45;
        targetPlot.potencialidad = parseFloat(formData.potencialidad) || 0.85;

        targetPlot.matorral = {
          tipo: formData.shrubType || 'A19',
          fccPct: parseFloat(formData.shrubFcc) || 20,
          alturaMediaDm: parseFloat(formData.shrubHeight) || 8.0,
          fccTarget: parseFloat(formData.shrubFccTarget) || 55.0
        };
        targetPlot.updatedAt = Date.now();

        await this.storage.savePlot(targetPlot);
        this.activePlot = targetPlot;
        this.updateUI();
        this.showToast('Datos de proyecto, parcela y matorral actualizados', 'success');
      }
    } else {
      // MODO NUEVA PARCELA
      const newPlot = {
        id: `plot_${Date.now()}`,
        name: formData.name || `Parcela ${this.plots.length + 1}`,
        projectName: formData.projectName || `Proyecto ${formData.fincaNombre || 'IDAF'}`,
        fincaNombre: formData.fincaNombre || 'Finca IDAF',
        owner: formData.owner || 'Titular',
        nif: formData.nif || 'B12345678',
        province: formData.province || 'Huelva',
        municipality: formData.municipality || 'Aracena',
        cadastral: formData.cadastral || '',
        totalAreaHa: parseFloat(formData.totalAreaHa) || 25.0,
        primarySpecies: formData.primarySpecies || 'quercus_suber',
        actuacion: formData.actuacion || 'densificacion',
        modalidad: 'muestreo',
        superficieMuestreadaHa: parseFloat(formData.superficieMuestreadaHa) || 1.0,
        edadMasa: parseInt(formData.edadMasa, 10) || 45,
        potencialidad: parseFloat(formData.potencialidad) || 0.85,
        matorral: {
          tipo: formData.shrubType || 'A19',
          fccPct: parseFloat(formData.shrubFcc) || 20,
          alturaMediaDm: parseFloat(formData.shrubHeight) || 8.0,
          fccTarget: parseFloat(formData.shrubFccTarget) || 55.0
        },
        trees: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await this.storage.savePlot(newPlot);
      this.plots.unshift(newPlot);
      this.activePlot = newPlot;
      this.updateUI();
      this.switchTab('measure');
      this.showToast(`Nueva parcela "${newPlot.name}" creada`, 'success');
    }
  }

  /**
   * Actualiza la pestaña de exportación con datos completos de proyecto, matorral e inventario
   */
  updateExportView() {
    const summaryCard = document.getElementById('export-plot-summary-box');
    if (!summaryCard || !this.activePlot) return;

    const trees = this.activePlot.trees || [];
    const shrubType = this.activePlot.matorral?.tipo || 'A19';
    const shrubFcc = this.activePlot.matorral?.fccPct || 20;
    const shrubHeight = this.activePlot.matorral?.alturaMediaDm || 8;
    const shrubBio = CarbonEngine.calculateShrubBiomass(shrubType, shrubFcc, shrubHeight);
    const shrubCO2 = shrubBio * CONFIG.CARBON_FRACTION_DEFAULT * CONFIG.CO2_C_RATIO;

    summaryCard.innerHTML = `
      <div style="background: white; border: 1.5px solid #005027; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #005027; font-size: 15px;">
            <i class="fa-solid fa-tree"></i> ${this.escapeHtml(this.activePlot.name)}
          </h4>
          <span class="badge badge-primary">${trees.length} árboles listos</span>
        </div>

        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">
          1. Datos de Proyecto y Finca (Paso 1)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12.5px; color: #334155; margin-bottom: 10px;">
          <div><strong>Finca:</strong> ${this.escapeHtml(this.activePlot.fincaNombre || 'Finca')}</div>
          <div><strong>Sup. Finca:</strong> ${this.activePlot.totalAreaHa || 25} ha</div>
          <div><strong>Titular:</strong> ${this.escapeHtml(this.activePlot.owner || '-')}</div>
          <div><strong>NIF/CIF:</strong> ${this.escapeHtml(this.activePlot.nif || '-')}</div>
          <div><strong>Ubicación:</strong> ${this.escapeHtml(this.activePlot.municipality || '-')}, ${this.escapeHtml(this.activePlot.province || '-')}</div>
          <div><strong>Actuación:</strong> ${this.activePlot.actuacion}</div>
        </div>

        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px;">
          2. Parcela y Matorral (Paso 2)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12.5px; color: #334155; margin-bottom: 8px;">
          <div><strong>Sup. Muestreo:</strong> ${this.activePlot.superficieMuestreadaHa} ha</div>
          <div><strong>Edad Masa:</strong> ${this.activePlot.edadMasa || 45} años</div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; font-size: 12px; color: #166534;">
          <div style="font-weight: 700; margin-bottom: 2px;">
            <i class="fa-solid fa-seedling"></i> Caracterización de Matorral (Montero et al., 2020):
          </div>
          <div>Formación: <strong>${shrubType}</strong> | FCC: <strong>${shrubFcc}%</strong> | Altura: <strong>${shrubHeight} dm</strong></div>
          <div style="margin-top: 3px; font-weight: 600;">Biomasa: <strong>${shrubBio.toFixed(2)} t/ha</strong> (${shrubCO2.toFixed(2)} t CO2e/ha)</div>
        </div>
      </div>
    `;
  }

  /**
   * Cambia de pestaña activa
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // Actualizar botones de navegación inferior
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Actualizar secciones
    document.querySelectorAll('.tab-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `tab-section-${tabName}`);
    });

    if (tabName === 'measure') {
      const inputDbh = document.getElementById('input-tree-dbh');
      if (inputDbh) inputDbh.focus();
    }
  }

  /**
   * Conecta los eventos de la interfaz
   */
  bindEvents() {
    // Navegación de pestañas
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Formulario de árbol: Guardar con botón
    const btnSaveTree = document.getElementById('btn-save-tree');
    if (btnSaveTree) {
      btnSaveTree.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveCurrentTree();
      });
    }

    // Guardar con Enter desde inputs
    const inputDbh = document.getElementById('input-tree-dbh');
    const inputHeight = document.getElementById('input-tree-height');

    if (inputDbh) {
      inputDbh.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          inputHeight?.focus();
        }
      });
    }

    if (inputHeight) {
      inputHeight.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveCurrentTree();
        }
      });
    }

    // Modal de parcela y proyecto (creación y edición)
    const btnOpenNewPlot = document.getElementById('btn-open-new-plot');
    const btnEditActivePlot = document.getElementById('btn-edit-active-plot');
    const modalNewPlot = document.getElementById('modal-new-plot');
    const btnCloseModal = document.getElementById('btn-close-new-plot-modal');
    const formNewPlot = document.getElementById('form-new-plot');

    if (btnOpenNewPlot) {
      btnOpenNewPlot.addEventListener('click', () => {
        this.openPlotModal(false);
      });
    }

    if (btnEditActivePlot) {
      btnEditActivePlot.addEventListener('click', () => {
        this.openPlotModal(true);
      });
    }

    if (btnCloseModal && modalNewPlot) {
      btnCloseModal.addEventListener('click', () => {
        modalNewPlot.style.display = 'none';
      });
    }

    // Escuchar cambios de matorral en el modal para recálculo en vivo
    const shrubInputs = ['new-plot-shrub-type', 'new-plot-shrub-fcc', 'new-plot-shrub-height'];
    shrubInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateModalShrubPreview());
        el.addEventListener('change', () => this.updateModalShrubPreview());
      }
    });

    // Cambios en la actuación dentro del modal
    const actSelect = document.getElementById('new-plot-actuacion');
    const targetGroup = document.getElementById('new-plot-shrub-target-container');
    if (actSelect && targetGroup) {
      actSelect.addEventListener('change', () => {
        targetGroup.style.display = actSelect.value === 'cerramiento' ? 'block' : 'none';
      });
    }

    if (formNewPlot) {
      formNewPlot.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
          editPlotId: document.getElementById('edit-plot-id')?.value,
          projectName: document.getElementById('new-plot-project-name')?.value,
          owner: document.getElementById('new-plot-owner')?.value,
          nif: document.getElementById('new-plot-nif')?.value,
          fincaNombre: document.getElementById('new-plot-finca')?.value,
          totalAreaHa: document.getElementById('new-plot-total-estate-area')?.value,
          province: document.getElementById('new-plot-province')?.value,
          municipality: document.getElementById('new-plot-municipality')?.value,
          cadastral: document.getElementById('new-plot-cadastral')?.value,
          name: document.getElementById('new-plot-name')?.value,
          actuacion: document.getElementById('new-plot-actuacion')?.value,
          primarySpecies: document.getElementById('new-plot-species')?.value,
          superficieMuestreadaHa: document.getElementById('new-plot-area')?.value,
          edadMasa: document.getElementById('new-plot-age')?.value,
          potencialidad: document.getElementById('new-plot-pot')?.value,
          shrubType: document.getElementById('new-plot-shrub-type')?.value,
          shrubFcc: document.getElementById('new-plot-shrub-fcc')?.value,
          shrubHeight: document.getElementById('new-plot-shrub-height')?.value,
          shrubFccTarget: document.getElementById('new-plot-shrub-fcc-target')?.value
        };
        this.savePlotForm(formData);
        if (modalNewPlot) modalNewPlot.style.display = 'none';
      });
    }

    // Botones de exportación
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportXlsx = document.getElementById('btn-export-xlsx');
    const btnSendToPlatform = document.getElementById('btn-send-to-platform');

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        if (!this.activePlot || !this.activePlot.trees || this.activePlot.trees.length === 0) {
          this.showToast('No hay árboles registrados para exportar', 'error');
          return;
        }
        const filename = FieldExporter.downloadCSV(this.activePlot);
        this.showToast(`Archivo ${filename} descargado con éxito`, 'success');
      });
    }

    if (btnExportXlsx) {
      btnExportXlsx.addEventListener('click', () => {
        if (!this.activePlot || !this.activePlot.trees || this.activePlot.trees.length === 0) {
          this.showToast('No hay árboles registrados para exportar', 'error');
          return;
        }
        try {
          const filename = FieldExporter.downloadXLSX(this.activePlot);
          this.showToast(`Archivo Excel ${filename} descargado`, 'success');
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }

    if (btnSendToPlatform) {
      btnSendToPlatform.addEventListener('click', () => {
        if (!this.activePlot || !this.activePlot.trees || this.activePlot.trees.length === 0) {
          this.showToast('No hay árboles para transferir a la Calculadora', 'error');
          return;
        }
        FieldExporter.preparePlatformImport(this.activePlot);
        this.showToast('Inventario transferido a la Calculadora IDAF', 'success');
        setTimeout(() => {
          window.location.href = './index.html?fromField=true#step2';
        }, 600);
      });
    }
  }

  /**
   * Muestra notificaciones flotantes (toast)
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('field-toast');
    if (!toast) return;

    toast.innerText = message;
    toast.className = `field-toast ${type} show`;

    setTimeout(() => {
      toast.className = 'field-toast';
    }, 2800);
  }

  /**
   * Sanitiza strings para HTML
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new FieldApp();
  app.init();
  window.idafFieldApp = app;
});
