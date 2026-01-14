// src/components/TerritoryInfoCards.jsx

import React, { useState } from "react";

const TerritoryInfoCards = ({ estatisticas }) => {
  if (!estatisticas || Object.keys(estatisticas).length === 0) {
    return null;
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", overflow: "hidden" }}>
        {Object.entries(estatisticas).map(([territorio, dados]) => (
          <CardRetratil key={territorio} territorio={territorio} dados={dados} />
        ))}
      </div>
    </div>
  );
};

const CardRetratil = ({ territorio, dados }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div
      style={{
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        cursor: "pointer",
        fontSize: "12px" 
      }}
      onClick={() => setAberto(!aberto)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>{territorio}</strong> <br />
          {/* A propriedade 'count' representa o número de áreas/núcleos, então está correto. */}
          <label style={{ fontSize: "12px" ,color: "#302e2eff", fontWeight: "bold" }}>Núcleos</label>: {dados.count}
        </div>
        <div style={{ fontSize: "12px" ,color: "#999" }}>{aberto ? "▲" : "▼"}</div>
      </div>

      {aberto && (
        <div>
          {/* --- MUDANÇAS AQUI --- */}
          {/* Exibe 'Lotes' e 'Quadras' que existem nos dados do PainelAtividadesNgeo */}
          {/* E também funciona para o PainelPrincipal, pois a prop 'unidades' foi mapeada para lotes */}
          <label style={{ fontSize: "12px" ,color: "#302e2eff", fontWeight: "bold" }}>Lotes</label>: {dados.lotes ?? dados.unidades} <br />
          <label style={{ fontSize: "12px" ,color: "#302e2eff", fontWeight: "bold" }}>Quadras</label>: {dados.quadras ?? 'N/A'} <br />

          {/* Opcional: Mostra os outros campos apenas se eles existirem (para manter a compatibilidade com o PainelPrincipal) */}
          {dados.unidades_sentenca !== undefined && <>
            <label style={{ fontSize: "12px" ,color: "#302e2eff", fontWeight: "bold" }}>Sentenças</label>: {dados.unidades_sentenca} <br />
          </>}
          {dados.registros_emitidos !== undefined && <>
            <label style={{ fontSize: "12px" ,color: "#302e2eff", fontWeight: "bold" }}>Emitidos</label>: {dados.registros_emitidos}
          </>}
        </div>
      )}
    </div>
  );
};

export default TerritoryInfoCards;