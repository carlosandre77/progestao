import React from 'react';
import PainelRetratil from "./RatratilPainel"; 
import ControleTable from "./ControleTable";



const PainelNgeoInfo = ({ 
    data, 
    error,
    onSaveRow
  }) => {



  if (error) {
    return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            <p>Erro ao carregar dados: {error.message || error}</p>
        </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: '15px' }}>
      
      {/* 1. SEÇÃO DA PLANILHA CONTROLE */}
      <PainelRetratil titulo="📑 Planilha Controle - NGEO">
        <div style={{ background: "#fff", borderRadius: "0 0 8px 8px", padding: '5px' }}>
            {/* 2. REPASSAR A PROP PARA A TABELA */}
            <ControleTable
                data={data}
                onSaveRow={onSaveRow}
            />
        </div>
      </PainelRetratil>



    </div>
  );
};

export default PainelNgeoInfo;