// filterControls.js


// const normalizeString = (s) =>
//   s ? s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim().replace(/\s+/g, " ") : "";


const FilterControls = ({
  onDownloadNucleoCompleto,
  username,
  handleLogout,

  selectedTerritorio,
  setSelectedTerritorio,
  territoriosOptions,

  selectedMunicipio,
  setSelectedMunicipio,
  municipiosFiltrados,

  selectedNucleo,
  setSelectedNucleo,
  layersVisibility,
  setLayersVisibility,
  lotes,
  quadras,

  nucleos,
  nucleosExternos,
  activeView,
  
  municipios,
  territorios,

  selectedUnidade,
  setSelectedUnidade,
  unidadesOptions,
}) => {
  const toggleLayer = (layer) => {
    setLayersVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const layerOptions = [
    { key: "lotes", label: "Lotes", hasData: lotes?.length > 0 },
    { key: "quadras", label: "Quadras", hasData: quadras?.length > 0 },
    { key: "nucleos", label: "Núcleos", hasData: nucleos?.length > 0 },
    { key: "municipios", label: "Municípios", hasData: municipios?.length > 0 },
    { key: "territorios", label: "Territórios", hasData: territorios?.length > 0 },
  ];

  // let nucleoOptionsList = [];

  // if (activeView === 'painel2') {
  //   // Se for o Painel 2 (CERURB), use 'nucleosExternos'
  //   const normMun = normalizeString(selectedMunicipio);
    
  //   // Filtra os núcleos externos pelo município selecionado
  //   const nucleoNames = nucleosExternos
  //     .filter(nuc => 
  //       selectedMunicipio === "Todos" || 
  //       ( nuc.cidade_normalizada.includes(normMun))
  //     )
  //     .map(nuc => nuc.nome); // Pega apenas os nomes

  //   // Cria uma lista de nomes únicos, ordena e adiciona "Todos" no início
  //   nucleoOptionsList = ["Todos", ...[...new Set(nucleoNames)].sort()];
  
  // } else {
  //   // Para 'painel1' ou qualquer outro, use a lista 'nucleos'
  //   // (Assumindo que 'nucleos' já vem de useNucleoFilters com "Todos" e filtrada)
  //   nucleoOptionsList = nucleos;
  // }

  
  return (
    <div style={{
      background: "#fff",
      padding: 20,
      gap: 30,
      borderRadius: 8,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <div className="central-label">
        NÚCLEO DE INFORMAÇÕES GE🌍ESPACIAIS - SPI
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", margin:  "0px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ margin: 0, padding: 0,height: "30px", fontSize: "14px", fontWeight: "bold" }}>
          {username && <p>Bem-vindo, <strong>{username}</strong>!</p>}
          </div>

          <button
            style={{
              background: "#fff",
              padding: 3,
              borderRadius: 8,
              width: 50,
              marginTop: 10,
            }}
            onClick={handleLogout}
          >
            Sair
          </button>
            {/* <button
              onClick={onDownloadNucleoCompleto}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📥 Baixar Núcleo Filtrado
            </button> */}

          <label>Território:</label>
          <select value={selectedTerritorio} onChange={(e) => setSelectedTerritorio(e.target.value)}>
            {(territoriosOptions || []).map((terr) => (
              <option key={terr} value={terr}>{terr}</option>
            ))}
          </select>

          <label>Município:</label>
          <select value={selectedMunicipio} onChange={(e) => setSelectedMunicipio(e.target.value)}>
            {municipiosFiltrados.map((mun) => (
              <option key={mun} value={mun}>{mun}</option>
            ))}
          </select>

          <label>Unidade Administrativa:</label>
            <select 
              value={selectedUnidade} 
              onChange={(e) => setSelectedUnidade(e.target.value)}
              style={{ fontSize: '12px'}}
            >
              {(unidadesOptions || []).map((unid) => (
                <option key={unid} value={unid}>{unid}</option>
              ))}
            </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 10 }}>
          <label style={{ fontWeight: "bold", fontSize: "12px"}}>Exibir camadas:</label>
          {layerOptions.map(({ key, label, hasData }) =>
            hasData ? (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "70%" }}>
                <input
                  type="checkbox"
                  checked={layersVisibility[key]}
                  onChange={() => toggleLayer(key)}
                />
                {label}
              </label>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
