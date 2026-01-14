// components/PainelNgeoInfo.js

import React from 'react';
import PainelRetratil from "./RatratilPainel";
import NucleoInfoCards from './NucleoInfoCards';
import TerritoryInfoCards from './TerritoryInfoCards'; // <-- 1. Importe o componente

const NoDataMessage = ({ message = "Nenhum dado a exibir para a seleção atual." }) => (
    <div style={{ padding: '15px', color: '#888', fontStyle: 'italic', fontSize: '14px' }}>
      {message}
    </div>
);

const PainelNgeoInfo = ({ data, loading, error }) => {
  
  if (loading) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando dados das atividades...</p>;
  }

  if (error) {
    return <p style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Erro ao carregar dados:  {error}</p>;
  }

  if (!data || !data.resumo) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Nenhum dado encontrado.</p>;
  }

  const { resumo } = data;

  // Formata os números para o componente de cards
  const cardsResumoGeral = {
    "Total de Nucleos": resumo.totalAreas,
    "Total de Quadras": resumo.totalQuadras,
    "Total de Lotes": resumo.totalLotes,
    "Área Total (Ha)": resumo.areaTotal.toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <PainelRetratil titulo="Atividades NGEO - 2025">
        <div style={{ padding: '10px', background: '#fff' }}>
            <NucleoInfoCards contagens={cardsResumoGeral} />
        </div>
      </PainelRetratil>
      
      <PainelRetratil titulo="🏙️ Lotes por Situação">
         <div style={{ padding: '15px', background: '#fff' }}>
            {Object.keys(resumo.porSituacao).length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {Object.entries(resumo.porSituacao).map(([situacao, dados]) => (
                    <li key={situacao} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: '500' }}>{situacao}</span>
                    <span style={{ background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {dados.lotes} {dados.lotes === 1 ? 'Lote' : 'Lotes'}
                    </span>
                    </li>
                ))}
                </ul>
            ) : <p>Nenhuma informação de situação.</p>}
         </div>
      </PainelRetratil>

            <PainelRetratil titulo="🗺️ Estatísticas por Território">
        {resumo.porTerritorio && Object.keys(resumo.porTerritorio).length > 0 ? (
          <div style={{ background: "#fff", padding: 10, borderRadius: "0px 0px 8px 8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <TerritoryInfoCards estatisticas={resumo.porTerritorio} />
          </div>
        ) : (
          <NoDataMessage message="Nenhum dado de território para a seleção atual." />
        )}
      </PainelRetratil>
    </div>
  );
};

export default PainelNgeoInfo;