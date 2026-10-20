/**
 * PARSER NATIVO DE ARCHIVOS KML / GEOJSON
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 */

export class KmlParser {
  /**
   * Parsea un texto KML (XML) a GeoJSON compatible con Leaflet y calcula su superficie
   */
  static parseKml(kmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");

    // Verificar si hay errores de parsing XML
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("El archivo KML no tiene un formato XML válido.");
    }

    // Helper para buscar elementos de forma insensible a prefijos de namespace (ej. kml:Placemark vs Placemark)
    const findElements = (parent, localTagName) => {
      return Array.from(parent.getElementsByTagName("*")).filter(el => {
        const local = el.localName || el.nodeName.split(':').pop();
        return local.toLowerCase() === localTagName.toLowerCase();
      });
    };

    const placemarks = findElements(xmlDoc, "Placemark");
    const features = [];
    let totalAreaM2 = 0;

    placemarks.forEach((pm, idx) => {
      const nameNode = findElements(pm, "name")[0];
      const name = nameNode?.textContent?.trim() || `Zona ${idx + 1}`;
      
      // Buscar Polígonos
      const polygons = findElements(pm, "Polygon");
      polygons.forEach(poly => {
        // Anillo exterior (outerBoundaryIs)
        const outerBoundary = findElements(poly, "outerBoundaryIs")[0];
        const outerCoordsNode = outerBoundary ? findElements(outerBoundary, "coordinates")[0] : findElements(poly, "coordinates")[0];

        if (outerCoordsNode && outerCoordsNode.textContent) {
          const outerCoords = this.parseCoordinates(outerCoordsNode.textContent);
          if (outerCoords.length >= 3) {
            let polyArea = this.calculateSphericalPolygonArea(outerCoords);
            const polygonRings = [outerCoords];

            // Anillos interiores / exclusiones (innerBoundaryIs)
            const innerBoundaries = findElements(poly, "innerBoundaryIs");
            innerBoundaries.forEach(inner => {
              const innerCoordsNode = findElements(inner, "coordinates")[0];
              if (innerCoordsNode && innerCoordsNode.textContent) {
                const innerCoords = this.parseCoordinates(innerCoordsNode.textContent);
                if (innerCoords.length >= 3) {
                  polygonRings.push(innerCoords);
                  const holeArea = this.calculateSphericalPolygonArea(innerCoords);
                  polyArea = Math.max(0, polyArea - holeArea);
                }
              }
            });

            totalAreaM2 += polyArea;

            features.push({
              type: "Feature",
              properties: {
                name: name,
                areaHa: Math.round((polyArea / 10000) * 100) / 100
              },
              geometry: {
                type: "Polygon",
                coordinates: polygonRings
              }
            });
          }
        }
      });

      // Si no hay Polygon pero hay coordenadas directas (MultiGeometry o LineString cerrado)
      if (polygons.length === 0) {
        const allCoords = findElements(pm, "coordinates");
        allCoords.forEach(cNode => {
          const coords = this.parseCoordinates(cNode.textContent);
          if (coords.length >= 3) {
            const area = this.calculateSphericalPolygonArea(coords);
            totalAreaM2 += area;
            features.push({
              type: "Feature",
              properties: {
                name: name,
                areaHa: Math.round((area / 10000) * 100) / 100
              },
              geometry: {
                type: "Polygon",
                coordinates: [coords]
              }
            });
          }
        });
      }
    });

    if (features.length === 0) {
      throw new Error("No se encontraron geometrías de polígono válidas en el archivo KML.");
    }

    const geojson = {
      type: "FeatureCollection",
      features: features
    };

    const areaHa = Math.round((totalAreaM2 / 10000) * 100) / 100;

    return {
      geojson,
      totalAreaHa: areaHa,
      featureCount: features.length
    };
  }

  /**
   * Convierte cadena de coordenadas KML ("lon,lat,alt lon,lat,alt") a array GeoJSON [lon, lat]
   */
  static parseCoordinates(coordString) {
    if (!coordString) return [];
    // Normalizar espacios alrededor de comas para admitir cualquier variante de exportación GIS
    const normalized = coordString.replace(/,\s+/g, ',').replace(/\s+,/g, ',').trim();
    const rawTuples = normalized.split(/\s+/);
    const coordinates = [];

    rawTuples.forEach(t => {
      const parts = t.split(',').map(p => parseFloat(p.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coordinates.push([parts[0], parts[1]]); // [lon, lat]
      }
    });

    // Cerrar el polígono si no está cerrado
    if (coordinates.length > 2) {
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordinates.push([first[0], first[1]]);
      }
    }

    return coordinates;
  }

  /**
   * Calcula la superficie esférica de un polígono en metros cuadrados (WGS84 aproximado)
   */
  static calculateSphericalPolygonArea(coordinates) {
    const RADIUS = 6378137; // Radio medio de la Tierra en metros
    if (coordinates.length < 3) return 0;

    let totalAngle = 0;
    const len = coordinates.length - 1; // Último es igual al primero

    for (let i = 0; i < len; i++) {
      const p1 = coordinates[i];
      const p2 = coordinates[(i + 1) % len];

      const lon1 = (p1[0] * Math.PI) / 180;
      const lat1 = (p1[1] * Math.PI) / 180;
      const lon2 = (p2[0] * Math.PI) / 180;
      const lat2 = (p2[1] * Math.PI) / 180;

      totalAngle += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    return Math.abs((totalAngle * RADIUS * RADIUS) / 2);
  }
}
