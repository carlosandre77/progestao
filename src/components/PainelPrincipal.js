import React, { useMemo } from 'react';
import PainelRetratil from "./RatratilPainel";
import ProGestaoTable from "./ProGestaoTable";
import { Bar } from "react-chartjs-2";

const PainelPrincipal = ({ loading, progestaoData, resumoProgestao }) => {

    // Lógica para o gráfico de Tipologia
    const barTipologiaData = useMemo(() => {
        const counts = {};
        progestaoData.forEach(item => {
            const tipo = item.tipo_unidade || "OUTROS";
            counts[tipo] = (counts[tipo] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);
        return {
            labels: sorted.map(([l]) => l),
            datasets: [{ label: 'Qtd', data: sorted.map(([, v]) => v), backgroundColor: '#36A2EB90' }]
        };
    }, [progestaoData]);

    if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando dados...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PainelRetratil titulo="🏠 Resumo Pró-Gestão">
                {/* Gráfico de Tipologia integrado no resumo */}
                <div style={{ height: 180, padding: '10px' }}>
                    <Bar 
                        data={barTipologiaData} 
                        options={{ 
                            maintainAspectRatio: false, 
                            plugins: { title: { display: true, text: 'Tipologia (Top 10)', font: { size: 10 } }, legend: { display: false } },
                            scales: { x: { ticks: { font: { size: 7 } } }, y: { ticks: { font: { size: 8 } } } }
                        }} 
                    />
                </div>
                

            </PainelRetratil>

            <PainelRetratil titulo="📋 Lista de Imóveis Estaduais">
                <div style={{ background: "#fff", padding: 5 }}>
                    <ProGestaoTable data={progestaoData} />
                </div>
            </PainelRetratil>
        </div>
    );
};

export default PainelPrincipal;