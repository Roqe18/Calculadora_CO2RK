/**
 * GESTOR DE MAPAS INTERACTIVOS (LEAFLET)
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class MapManager {
  constructor(containerId = 'kml-map') {
    this.containerId = containerId;
    this.map = null;
    this.geoJsonLayer = null;
  }

  /**
   * Inicializa el mapa Leaflet con capas satelital y callejera
   */
  initMap() {
    /* global L */
    if (typeof L === 'undefined') {
      console.warn("Leaflet no está cargado.");
      return;
    }

    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Capa Satélite ESRI
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Capa Callejera / Topográfica OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    // Centro inicial en la Península Ibérica
    this.map = L.map(this.containerId, {
      center: [40.4168, -3.7038],
      zoom: 6,
      layers: [satelliteLayer]
    });

    // Control de capas
    const baseMaps = {
      "Vista Satélite": satelliteLayer,
      "Mapa Topográfico / Calles": osmLayer
    };

    L.control.layers(baseMaps).addTo(this.map);
  }

  /**
   * Carga y renderiza el GeoJSON del KML en el mapa
   */
  displayKmlGeoJson(geojson, projectName = "Zona de Proyecto") {
    /* global L */
    if (!this.map) {
      this.initMap();
    }

    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    // Estilo corporativo IDAF para la delimitación
    const idafStyle = {
      color: "#76B72B",       // Verde claro IDAF
      weight: 3,
      opacity: 0.9,
      fillColor: "#005027",   // Verde oscuro IDAF
      fillOpacity: 0.25
    };

    this.geoJsonLayer = L.geoJSON(geojson, {
      style: idafStyle,
      onEachFeature: (feature, layer) => {
        const safeTitle = escapeHtml(projectName || feature.properties?.name || "Zona de Proyecto");
        const safeArea = feature.properties?.areaHa ? `<br><b>Superficie:</b> ${feature.properties.areaHa} ha` : '';
        layer.bindPopup(`<b>${safeTitle}</b>${safeArea}`);
      }
    }).addTo(this.map);

    // Ajustar vista a la extensión del polígono
    const bounds = this.geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }

    // Forzar actualización de tamaño de Leaflet
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }
}
