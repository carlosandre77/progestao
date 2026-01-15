import React, { useMemo } from 'react';
import PainelRetratil from "./RatratilPainel";
import ProGestaoTable from "./ProGestaoTable";
import { Bar } from "react-chartjs-2";

// Função de abreviação (mesma lógica do painel lateral)
const abreviarNome = (nome) => {
    if (!nome) return "OUTROS";
    
    let nomeTratado = nome
        .replace(/UNIDADE ESCOLAR /gi, "U.E. ")
        .replace(/GRUPAMENTO DE POLÍCIA MILITAR/gi, "GPM")
        .replace(/DELEGACIA DE POLÍCIA CIVIL/gi, "DPC")
        .replace(/CENTRO DE SAÚDE/gi, "C. SAÚDE")
        .replace(/CENTRO ADMINISTRATIVO/gi, "C. ADM")
        .replace(/\s+/g, " ")
        .trim();

    // No painel principal, o espaço é menor, então o limite pode ser mais curto (ex: 20 caracteres)
    const limiteCaracteres = 20; 
    if (nomeTratado.length > limiteCaracteres) {
        return nomeTratado.substring(0, limiteCaracteres) + "...";
    }

    return nomeTratado;
};

const PainelPrincipal = ({ loading, progestaoData, resumoProgestao }) => {

    // Lógica para o gráfico de Tipologia
    const barTipologiaData = useMemo(() => {
        const counts = {};
        progestaoData.forEach(item => {
            const tipo = item.tipo_unidade || "OUTROS";
            counts[tipo] = (counts[tipo] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return {
            // Aplicando a abreviação nos labels aqui
            labels: sorted.map(([l]) => abreviarNome(l)),
            datasets: [{ 
                label: 'Qtd', 
                data: sorted.map(([, v]) => v), 
                backgroundColor: '#36A2EB90',
                borderRadius: 4
            }]
        };
    }, [progestaoData]);

    if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Carregando dados...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PainelRetratil titulo="Resumo Pro-Gestão">            

                {/* Gráfico de Tipologia com nomes abreviados */}
                <div style={{ height: 220, padding: '10px' }}>
                    <Bar 
                        data={barTipologiaData} 
                        options={{ 
                            maintainAspectRatio: false, 
                            plugins: { 
                                title: { 
                                    display: true, 
                                    text: 'Tipologia dos Prédios (Top 10)', 
                                    font: { size: 11, weight: 'bold' } 
                                }, 
                                legend: { display: false },
                                datalabels: {
                                    anchor: 'end',
                                    align: 'top',
                                    font: { size: 9, weight: 'bold' }
                                }
                            },
                            scales: { 
                                x: { ticks: { font: { size: 8 }, maxRotation: 45, minRotation: 45 } }, 
                                y: { beginAtZero: true, ticks: { font: { size: 9 } } } 
                            }
                        }} 
                    />
                </div>
            </PainelRetratil>

            <PainelRetratil titulo="Dados Tabulados">
                <div style={{ background: "#fff", padding: 5 }}>
                    <ProGestaoTable data={progestaoData} />
                </div>
            </PainelRetratil>
        </div>
    );
};

export default PainelPrincipal;