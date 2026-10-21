/**
 * MOTOR DE ALMACENAMIENTO LOCAL OFFLINE (INDEXEDDB) - IDAF CAMPO
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 * Gestiona parcelas, metadatos y árboles pie a pie con cero pérdida de datos.
 */

const DB_NAME = 'IdafForestFieldDB';
const DB_VERSION = 1;
const STORE_NAME = 'plots';

export class FieldStorage {
  constructor() {
    this.db = null;
    this.isIndexedDBSupported = typeof indexedDB !== 'undefined';
  }

  /**
   * Inicializa la conexión con IndexedDB
   */
  async init() {
    if (!this.isIndexedDBSupported) {
      console.warn('[FieldStorage] IndexedDB no soportado. Usando localStorage como fallback.');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('finca', 'fincaNombre', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[FieldStorage] Error abriendo IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Obtiene todas las parcelas guardadas
   */
  async getAllPlots() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = request.result || [];
          // Ordenar por fecha de última modificación descendente
          list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(list);
        };
        request.onerror = (e) => reject(e.target.error);
      });
    }

    // Fallback localStorage
    try {
      const data = localStorage.getItem('idaf_field_plots');
      const list = data ? JSON.parse(data) : [];
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return list;
    } catch {
      return [];
    }
  }

  /**
   * Obtiene una parcela por ID
   */
  async getPlot(id) {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e.target.error);
      });
    }

    const all = await this.getAllPlots();
    return all.find(p => p.id === id) || null;
  }

  /**
   * Guarda o actualiza una parcela completa
   */
  async savePlot(plot) {
    plot.updatedAt = Date.now();
    if (!plot.createdAt) plot.createdAt = Date.now();
    if (!Array.isArray(plot.trees)) plot.trees = [];

    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(plot);

        request.onsuccess = () => resolve(plot);
        request.onerror = (e) => reject(e.target.error);
      });
    }

    const all = await this.getAllPlots();
    const index = all.findIndex(p => p.id === plot.id);
    if (index >= 0) {
      all[index] = plot;
    } else {
      all.push(plot);
    }
    localStorage.setItem('idaf_field_plots', JSON.stringify(all));
    return plot;
  }

  /**
   * Elimina una parcela
   */
  async deletePlot(id) {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = (e) => reject(e.target.error);
      });
    }

    const all = await this.getAllPlots();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem('idaf_field_plots', JSON.stringify(filtered));
    return true;
  }

  /**
   * Añade un árbol individual a una parcela
   */
  async addTreeToPlot(plotId, treeData) {
    const plot = await this.getPlot(plotId);
    if (!plot) throw new Error(`Parcela con ID ${plotId} no encontrada`);

    plot.trees.push(treeData);
    await this.savePlot(plot);
    return plot;
  }

  /**
   * Elimina un árbol individual de una parcela
   */
  async deleteTreeFromPlot(plotId, treeId) {
    const plot = await this.getPlot(plotId);
    if (!plot) throw new Error(`Parcela con ID ${plotId} no encontrada`);

    plot.trees = plot.trees.filter(t => t.id !== treeId);
    await this.savePlot(plot);
    return plot;
  }
}
