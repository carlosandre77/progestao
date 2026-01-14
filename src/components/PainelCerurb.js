// components/PainelCerurb.js

import React from 'react';
import PainelRetratil from "./RatratilPainel";
import NucleoInfoCards from "./NucleoInfoCards";
import CerurbTable from "./CerurbTable";

const NoDataMessage = ({ message = "Nenhum dado a exibir para a seleção atual." }) => (
    <div style={{ padding: '15px', color: '#888', fontStyle: 'italic', fontSize: '14px' }}>
      {message}
    </div>
);

const PainelCerurb = ({ 
  loading,
  error,
  statusCounts,
  totalVetorizados,
  nucleosExternosFiltrados,
}) => {
  
  if (loading) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando dados...</p>;
  }

  if (error) {
    return <p style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Erro ao carregar dados:  {error}</p>;
  }

  const hasCardData = (statusCounts && Object.keys(statusCounts).length > 0) || totalVetorizados > 0;


  return (
    <div style={{ display: "flex", flexDirection: "column"}}>
      <PainelRetratil titulo="📑 Planilha Resumo (CERURB)">{
        nucleosExternosFiltrados && nucleosExternosFiltrados.length > 0 ? (
          <div style={{ background: "#fff", borderRadius: "0px 0px 8px 8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <CerurbTable data={nucleosExternosFiltrados} />
          </div>
        ) : (
          <NoDataMessage message="Nenhum dado da planilha CERURB para a seleção atual." />
        )
      }</PainelRetratil>


      <PainelRetratil titulo="📊 Informações por status">{
        hasCardData ? (
          <div style={{ background: "#fff", padding: 10, borderRadius: "0px 0px 8px 8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <NucleoInfoCards contagens={statusCounts} totalVetorizados={totalVetorizados} />
          </div>
        ) : (
          <NoDataMessage />
        )
      }</PainelRetratil>
    </div>
  );
};

export default PainelCerurb;