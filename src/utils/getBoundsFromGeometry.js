// ./src/utils/getBoundsFromGeometry.js
export function getBoundsFromGeometry(geometry) {
  if (!geometry) return null;

  let bounds = null;

  // Suporte para PONTO (Novo)
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    // Cria um pequeno "envelope" ao redor do ponto para o zoom não ser infinito
    return [[lat - 0.005, lng - 0.005], [lat + 0.005, lng + 0.005]];
  }

  // Suporte para Polígonos (Existente)
  if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
    const coords = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    coords.forEach((polygon) => {
      polygon[0].forEach(([lng, lat]) => {
        if (!bounds) bounds = [[lat, lng], [lat, lng]];
        else {
          bounds[0][0] = Math.min(bounds[0][0], lat);
          bounds[0][1] = Math.min(bounds[0][1], lng);
          bounds[1][0] = Math.max(bounds[1][0], lat);
          bounds[1][1] = Math.max(bounds[1][1], lng);
        }
      });
    });
  }

  return bounds;
}