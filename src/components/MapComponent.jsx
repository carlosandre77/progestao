// MapComponent.jsx
import React, { useEffect, useState, useCallback, useRef, forwardRef } from "react"; 

import { MapContainer, TileLayer, GeoJSON, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import GoogleMutantLayer from "./GoogleMutantLayer";
import useGoogleMaps from "../hooks/useGoogleMaps";
import "../components/styles/MapComponent.css";
import Legend from './Legend';



const territoryColors = {
  'CARNAUBAIS': '#E41A1C', // Vermelho
  'CHAPADA DAS MANGABEIRAS': '#377EB8', // Azul
  'CHAPADA VALE DO ITAIM': '#4DAF4A', // Verde
  'COCAIS': '#984EA3', // Roxo
  'ENTRE RIOS': '#FF7F00', // Laranja
  'PLANICIE LITORANEA': '#FFFF33', // Amarelo (talvez precise de borda escura)
  'SERRA DA CAPIVARA': '#A65628', // Marrom
  'TABULEIROS DO ALTO PARNAÍBA': '#F781BF', // Rosa
  'VALE DO CANINDE': '#999999', // Cinza
  'VALE DO RIO GUARIBAS': '#66C2A5', // Verde-água
  'VALE DO SAMBITO': '#FC8D62', // Pêssego
  'VALE DOS RIOS PIAUI E ITAUEIRAS': '#8da0cb', // Azul claro

};

const statusColors = {
  'Coleta Recusada': '#faad83',
  'Concluído': '#00fff7',
  'Correção de coleta': '#9d00ffcc',
  'Apto para Migração': '#4eb2ec',
  'Iniciado': '#949895',
  'Em análise': '#000000',
  'Regularizado Externamente': '#79e781',
  'Casa Fechada': '#ff8000',
  'Cancelado': '#f68f8fe0',
  'Coleta Segunda Etapa': '#d4d4d4',
  'Processo Administrativo': '#643a3a',
  'Análise Jurídica': '#f6ff00',
  'Validação Jurídica': '#cada14',
  'Enviado ao CerurbJus': '#1638b4',
  'Regularizado': '#279916ba',
  'Pendente': '#ff0000',
  'Memorial Para Correção': '#ff4af6c5',
  'Inconsistência no sistema da ADH': '#8a6565',
  'Bloqueado': '#9f0000',
  'Correção de Mapa': '#a98cffbf',
  'DEFAULT': '#f4f7fc'
};

const formatPropertyName = (name) => {
  return name
    .replace(/_/g, ' ')
    .replace(/(?:^|\s)\S/g, a => a.toUpperCase());
};



// Ajustar bounds
const FitBoundsHandler = ({ bounds, boundsKey }) => {
  const map = useMap();
  const lastKeyRef = useRef(null);

  useEffect(() => {
    // Só disparar se a chave do filtro mudou (boundsKey) E houver limites válidos
    if (bounds && boundsKey !== lastKeyRef.current) {
      lastKeyRef.current = boundsKey;

      // Usamos flyToBounds para suavidade
      map.flyToBounds(bounds, { 
        padding: [1gi0, 10], 
        duration: 1.0,
        animate: true 
      });
    }
  }, [bounds, boundsKey, map]);

  return null;
};

// Capturar zoom
const MapEventHandler = ({ setZoomLevel }) => {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    setZoomLevel(map.getZoom());
    
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [setZoomLevel, map]);

  return null;
};



// Componente para exibir informações do núcleo externo
const MapComponent = forwardRef(({ lotes = [], quadras = [], nucleos = [], municipios = [],progestaoData = [], territorios = [], bounds, layers, boundsKey }, ref) => {

  const mapRef = useRef(null); 
  const lotesLayerRef = useRef(null);
  const quadrasLayerRef = useRef(null);
  const nucleosLayerRef = useRef(null);
  
  const territoriosLayerRef = useRef(null);

  const [zoomLevel, setZoomLevel] = useState(7);

  const [legendsVisible, setLegendsVisible] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [baseMap, setBaseMap] = useState("carto");
  const apiLoaded = useGoogleMaps(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);


  

  const progestaoIcon = L.icon({
    iconUrl: "/marker-progestao.png", // Certifique-se de ter um ícone com este nome em /public
    iconSize: [10, 10],
    iconAnchor: [10, 10],
    popupAnchor: [1, -30],
  });
      // Estilo dinâmico para GeoJSON
  const getStyle = useCallback((feature) => {
    // console.log(feature.properties);
    if (!feature?.properties) return {};      
      
      switch(feature.properties.TIPO) {        
        case 'LOTE':
          const status = feature.properties.SITUACAO;
          const StatusfillColor = statusColors[status] || statusColors.DEFAULT;
          return {
            color: '#a83232',
            weight: 1,
            fillColor: StatusfillColor,
            fillOpacity: zoomLevel >= 14 ? 0.2 : 0.4
          };

        case 'QUADRA':
          return {
            color: '#1929d7',
            weight: 1,
            fillColor: 'transparent',
            fillOpacity: zoomLevel >= 13 ? 0.7 : 0.4
          };
        case 'NUCLEO':
          return {
            color: '#00FF00',
            fillColor: 'transparent',           
            weight: 1,
            fillOpacity: zoomLevel >= 12 ? 0.7 : 0.4
          };
        case 'MUNICIPIO':
          return {
            color:'#b1b4b1ff', 
            weight: 1, 
            fillColor: '#cccff8ff', 
            fillOpacity: 0.2 
          };
        case 'TERRITORIO':
          const territoryName = feature.properties.TERRITORIO;
          const fillColor = territoryColors[territoryName] || territoryColors.DEFAULT;
          return {
            color: fillColor,
            weight: 1,
            fillColor: fillColor,
            fillOpacity: zoomLevel >= 13 ? 0.1 : 0.3  
          };

        default:
          return {
            color: '#607D8B',
            weight: 1,
            fillOpacity: 0.5
          };
      }
  }, [zoomLevel]);


  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 400); // ligeiramente após o ajuste de layout
    }
  }, [boundsKey]);

  

  useEffect(() => {
    const layerGroup = lotesLayerRef.current;

    if (layers?.lotes && layerGroup && layerGroup.getLayers) {
      layerGroup.getLayers().forEach(layer => {
        const props = layer.feature?.properties;
        if (props?.TIPO === 'LOTE') {
          const lote = parseInt(props.LOTE) || 0;
          const label = `L: ${lote || '-'}`;
          
          if (zoomLevel >= 19) {
            layer.bindTooltip(label, {
              permanent: true,
              direction: 'center',
              className: 'lote-label'
            }).openTooltip();
          } else {
            layer.unbindTooltip();
          }
        }
      });
    }
  }, [zoomLevel, layers?.lotes]);


  useEffect(() => {
    const layerGroup = quadrasLayerRef.current;

    if (layers?.quadras && layerGroup && layerGroup.getLayers) {
      layerGroup.getLayers().forEach(layer => {
        const props = layer.feature?.properties;
        if (props?.TIPO === 'QUADRA') {
          const label = `Q: ${props.QUADRA}`;

          if (zoomLevel >= 16) {
            layer.bindTooltip(label, {
              permanent: true,
              direction: 'center',
              className: 'quadra-label'
            }).openTooltip();
          } else {
            layer.unbindTooltip();
          }
        }
      });
    }
  }, [zoomLevel, layers?.quadras]);


  useEffect(() => {
    const layerGroup = nucleosLayerRef.current;

    if (layers?.nucleos && layerGroup && layerGroup.getLayers) {
      layerGroup.getLayers().forEach(layer => {
        const props = layer.feature?.properties;
        if (props?.TIPO === 'NUCLEO') {
          const label = props.NUCLEO;

          if (zoomLevel >= 15) {
            layer.bindTooltip(label, {
              permanent: true,
              direction: 'center',
              className: 'nucleo-label'
            }).openTooltip();
          } else {
            layer.unbindTooltip();
          }
        }
      });
    }
  }, [zoomLevel, layers?.nucleos]);


// useEffect(() => {
//   const layerGroup = territoriosLayerRef.current;
//   console.log(territoriosLayerRef);

//   if (layers?.territorios && layerGroup && layerGroup.getLayers) {
//     layerGroup.getLayers().forEach(layer => {
//       const props = layer.feature?.properties;
      
//       const label = props.TERRITORIO;      

//       if (zoomLevel >= 1) {
//         layer.bindTooltip(label, {
//           permanent: true,
//           direction: 'center',
//           className: 'territorio-label'
//         }).openTooltip();
//       } else {
//         layer.unbindTooltip();
//       }
      
//     });
//   }
// }, [zoomLevel, layers?.territorios]);




  // Manipulador de clique para GeoJSON
  const onEachFeature = useCallback((feature, layer) => {
    // Versão simplificada do getFieldsToShow específica para o popup
    const getPopupFields = (feature) => {
      if (!feature?.properties) return {};
            
      const tipo = feature.properties?.TIPO;
      const allProperties = feature.properties || {};
      const baseFields = {
        'Tipo': tipo?.charAt(0).toUpperCase() + tipo?.slice(1),
      };
      const specificFields = {};
      
      switch(tipo) {
        case 'LOTE':
          Object.assign(specificFields, {
            'Município': allProperties.MUNICIPIO,
            'Núcleo': allProperties.NUCLEO,
            'Área (m²)': allProperties.AREA,
            'Perímetro (m)': allProperties.PERIMETRO,
            'Lote': allProperties.LOTE,
            'Quadra': allProperties.QUADRA,
            'Status': allProperties.SITUACAO,
            'Nome': allProperties.NOME,
          });
          break;
        case 'QUADRA':
          Object.assign(specificFields, {
            'Município': allProperties.MUNICIPIO,
            'Núcleo': allProperties.NUCLEO,
            'Área (m²)': allProperties.AREA,
            'Perímetro (m)': allProperties.PERIMETREO,
            'Lote': allProperties.LOTE,
            'Quadra': allProperties.QUADRA,
          });
          break;
          
        case 'NUCLEO':
          Object.assign(specificFields, {
            'Núcleo': allProperties.NUCLEO,
            'Município': allProperties.MUNICIPIO,
          });
          break;
          
        case 'MUNICIPIO':
          Object.assign(specificFields, {
            'Nome': allProperties.MUNICIPIO,
            'população (IBGE 2022) ': allProperties.POPULACAO,
            'Domicílios (IBGE 2022)': allProperties.DOMICILIOS,
            'Território de desenvolvimento': allProperties.TERRITORIO,
          });
          break;
        
          case 'TERRITORIO':
          Object.assign(specificFields, {
            'Território de desenvolvimento': allProperties.TERRITORIO,
          });
          break;
          
        default:
          Object.keys(allProperties).forEach(key => {
            if (key !== 'TIPO' && key !== 'id' && key !== 'gid') {
              specificFields[formatPropertyName(key)] = allProperties[key];
            }
          });
      }
      
      return { ...baseFields, ...specificFields };
    };

    const fieldsToShow = getPopupFields(feature);

    // Cria o conteúdo do popup usando os campos filtrados
    const popupContent = `
      <div style="max-width: 250px; font-family: Arial, sans-serif; font-size: 12px;">
        <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
          ${feature.properties.TIPO?.toUpperCase() || 'FEIÇÃO'}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(fieldsToShow).map(([key, value]) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 3px 0; vertical-align: top;"><strong>${key}:</strong></td>
              <td style="padding: 3px 0; vertical-align: top;">${value?.toString() || 'N/A'}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
    // Vincula o popup à camada
    layer.bindPopup(popupContent, {
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
      className: 'custom-popup'
    });

    layer.on({
      click: (e) => {
        layer.openPopup(e.latlng);
        layer.setStyle({
          weight: 3,
          color: '#ff0303',
          fillOpacity: 0.2
        });
        
        setTimeout(() => {
          layer.setStyle(getStyle(feature));
        }, 1000);
      },
      mouseover: () => layer.setStyle({ weight: 2, color: '#ff0303' }),
      mouseout: () => layer.setStyle(getStyle(feature))
    });

    if (feature.properties?.TIPO === 'LOTE') {
      layer.options.loteId = feature.properties.lote;
    }
    if (feature.properties?.TIPO === 'QUADRA') {
      layer.options.quadraLabel = feature.properties.quadra;
    }

  }, [getStyle]);
  
  // Manipulador de clique para Markers
  const handleMarkerClick = useCallback((feature) => {      
    // setSelectedFeature(feature);
    setPopupContent(
      <Popup>
        <div>
          <h4>{feature.properties?.TIPO || 'Feição'}</h4>
          {Object.entries(feature.properties || {}).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {value?.toString() || 'N/A'}</p>
          ))}
        </div>
      </Popup>
    );
  }, []);

  return (
    <>
      <div className="base-map-selector">
        <label>
          <strong>Mapa base:</strong>{" "}
          <select
            value={baseMap}
            onChange={(e) => setBaseMap(e.target.value)}
            style={{ marginLeft: "10px",width: "80px", fontSize: "12px", padding: "2px" }}
          >
            <option value="carto">CartoDB Light</option>
            <option value="google">Google Maps</option>
            <option value="google-hybrid">Google Satelite</option>
          </select>
        </label>
      </div>
      <MapContainer
        className="map-container"
        // style={{ height: "100%", width: "100%" }}
        center={[-7.5, -42.5]}
        zoom={7}
        minZoom={5}
        maxZoom={22}
        scrollWheelZoom={true}
        zoomControl={false}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}

      >

      {baseMap === "carto" && (
        <TileLayer
          attribution="&copy; CartoDB"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
      )}

      {["google", "google-hybrid"].includes(baseMap) && apiLoaded && (
        <GoogleMutantLayer type={baseMap === "google" ? "roadmap" : "hybrid"} />
      )}

        <MapEventHandler setZoomLevel={setZoomLevel} />

{/* --- CONTAINER DAS LEGENDAS À ESQUERDA --- */}
      {/* Este 'div' é crucial. Ele usa a classe 'legend-column-left' 
        do seu CSS para flutuar sobre o mapa (position: absolute, z-index: 1000)
      */}
      <div className="legend-column-left">
        <button 
            className="legend-toggle-btn" 
            onClick={() => setLegendsVisible(!legendsVisible)}
          >
            {legendsVisible ? 'Esconder Legendas' : 'Mostrar Legendas'}
          </button>
        
          {legendsVisible && (
            <>
              {/* TERRITORIOS LEGENDA */}
              {layers?.territorios && (
                <Legend 
                  colors={territoryColors} 
                  title="Territórios" 
                />
              )}  

              {/* LOTES LEGENDA */}
              {layers?.lotes && (
                <Legend 
                  colors={statusColors} 
                  title="Status dos Lotes" 
                />
              )}
            </>
          )}
          
        </div>
        {progestaoData.length > 0 && progestaoData.map((item, index) => {
            // Converte "-5,86063" para -5.86063
            const lat = parseFloat(String(item.latitude).replace(',', '.'));
            const lng = parseFloat(String(item.longitude).replace(',', '.'));

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker 
                key={`progestao-${item.id || index}`} 
                position={[lat, lng]}
                icon={progestaoIcon}
              >
                <Popup>
                  <div style={{ minWidth: "200px", fontSize: "12px" }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1976d2", borderBottom: "1px solid #ddd" }}>
                      {item.unidade || "Imóvel Estadual"}
                    </h4>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        <tr><td><strong>Tipo:</strong></td><td>{item.tipo_unidade}</td></tr>
                        <tr><td><strong>Município:</strong></td><td>{item.municipio}</td></tr>
                        <tr><td><strong>Bairro:</strong></td><td>{item.bairro}</td></tr>
                        <tr><td><strong>Área Const.:</strong></td><td>{item.area_construida} m²</td></tr>
                        <tr><td><strong>Matrícula:</strong></td><td>{item.matricula}</td></tr>
                      </tbody>
                    </table>
                    <p style={{ marginTop: "5px", fontSize: "10px", color: "#666" }}>
                      <strong>Endereço:</strong> {item.endereco}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        {/* TERRITÓRIOS */}
        {layers?.territorios && territorios.length > 0 && (
          <GeoJSON
            key="territorios"
            data={{ type: "FeatureCollection", features: territorios }}
            style={getStyle}
            onEachFeature={onEachFeature}
            ref={territoriosLayerRef}
          />
        )}

        {/* MUNICÍPIOS */}
        {layers?.municipios && municipios.length > 0 && (
          <GeoJSON
            key="municipios"
            data={{ type: "FeatureCollection", features: municipios }}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}



        {/* NÚCLEOS */}
        {/* {layers?.nucleos && nucleos.length > 0 && (
          zoomLevel < 12 ? (
            nucleos.map((feature, index) => {
              if (!feature || !feature.geometry) return null;
            
              let coords = null;
            
              if (feature.geometry.type === "Point") {
                coords = feature.geometry.coordinates;
              } else if (feature.geometry.type === "Polygon") {
                coords = feature.geometry.coordinates[0][0];
              } else if (feature.geometry.type === "MultiPolygon") {
                coords = feature.geometry.coordinates[0][0][0];
              }
            
              if (!coords) return null;
            
              const [lng, lat] = coords;
            
              return (
                <Marker
                  key={`nucleo-marker-${index}`}
                  position={[lat, lng]}
                  icon={L.icon({
                    iconUrl: "/alfinet_prourb.png",
                    iconSize: [20, 25],
                    iconAnchor: [10, 25],
                  })}
                  eventHandlers={{
                    click: () => handleMarkerClick(feature)
                  }}
                >
                  {popupContent}
                </Marker>
              );
            })          
          ) : (
            <GeoJSON
              key={`nucleos-${nucleos.map(n => n.properties?.id || "").join("-")}-${zoomLevel}`}
              data={{ type: "FeatureCollection", features: nucleos }}
              style={getStyle}
              onEachFeature={onEachFeature}
              ref={nucleosLayerRef}
            />
          )
        )} */}



        {/* QUADRAS */}
        {layers?.quadras && quadras.length > 0 && (
          zoomLevel < 13 ? (
            quadras.map((feature, index) => {
              if (!feature || !feature.geometry) return null; 
              
              const coords = feature.geometry.type === "Point"
                ? feature.geometry.coordinates
                : feature.geometry.type === "Polygon"
                  ? feature.geometry.coordinates[0][0]
                  : null;
              
              if (!coords) return null;
                const [lng, lat] = coords;
              
              return (
                <Marker
                  key={`lote-marker-${index}`}
                  position={[lat, lng]}
                  icon={L.icon({
                    iconUrl: "/alfinet_prourb.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                  eventHandlers={{
                    click: () => handleMarkerClick(feature)
                  }}
                >
                  {popupContent}
                </Marker>
              );
            })
          ) : (
          <GeoJSON
            key={`quadras-${quadras.map(n => n.properties?.id || "").join("-")}-${zoomLevel}`}
            data={{ type: "FeatureCollection", features: quadras }}
            style={getStyle}
            onEachFeature={onEachFeature}
            ref={quadrasLayerRef}
          />

          )
        )}

        {/* LOTES */}
        {layers?.lotes && lotes.length > 0 && (
          zoomLevel < 16? (
            lotes.map((feature, index) => {
              if (!feature || !feature.geometry) return null; 
              
              const coords = feature.geometry.type === "Point"
                ? feature.geometry.coordinates
                : feature.geometry.type === "Polygon"
                  ? feature.geometry.coordinates[0][0]
                  : null;
              
              if (!coords) return null;
                const [lng, lat] = coords;
              
              return (
                <Marker
                  key={`lote-marker-${index}`}
                  position={[lat, lng]}
                  icon={L.icon({
                    iconUrl: "/alfinet_prourb.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                  eventHandlers={{
                    click: () => handleMarkerClick(feature)
                  }}
                >
                  {popupContent}
                </Marker>
              );
            })
          ) : (
            <GeoJSON
              key={`lotes-${lotes.map(n => n.properties?.id || "").join("-")}-${zoomLevel}`}
              data={{ type: "FeatureCollection", features: lotes }}
              style={getStyle}
              onEachFeature={onEachFeature}
              ref={lotesLayerRef}
            />
          )
        )}





        <FitBoundsHandler key={`bounds-${boundsKey}`} bounds={bounds} />


      </MapContainer>


    </>
  );
});

export default MapComponent;