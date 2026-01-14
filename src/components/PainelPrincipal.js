// src/components/PainelPrincipal.js
import React from 'react';
import PainelRetratil from "./RatratilPainel";
import ProGestaoTable from "./ProGestaoTable"; // Importando a nova tabela

const PainelPrincipal = ({ loading, progestaoData, resumoProgestao }) => {
    if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando dados...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            
            {/* Bloco de Resumo Estatístico */}
            <PainelRetratil titulo="🏠 Resumo Pró-Gestão">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px', background: '#fff' }}>
                    <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#555' }}>Total de Imóveis</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{resumoProgestao?.total_imoveis || 0}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#555' }}>Área Construída Total</span>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {resumoProgestao?.area_total_construida?.toLocaleString('pt-BR')} m²
                        </div>
                    </div>
                </div>
            </PainelRetratil>

            {/* Bloco da Tabela de Dados */}
            <PainelRetratil titulo="📋 Lista de Imóveis Estaduais">
                <div style={{ background: "#fff", padding: 10, borderRadius: "0px 0px 8px 8px" }}>
                    <ProGestaoTable data={progestaoData} />
                </div>
            </PainelRetratil>
        </div>
    );
};

export default PainelPrincipal;