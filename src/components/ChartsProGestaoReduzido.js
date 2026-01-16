import React, { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2"; // Importar Doughnut
import { Chart as ChartJS, ArcElement, Tooltip, Legend,  Title } from 'chart.js';
import PainelRetratil from "./RatratilPainel";

// Helpers de conversão
const parseArea = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
};

// --- FUNÇÃO DE MÁSCARA CONDICIONAL ---
const formatValueWithMask = (val, isFullData) => {
    if (val === 0) return "0,00";
    
    // Se não houver filtro (dados completos), exibe em "mil"
    if (isFullData) {
        return (val / 1000).toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        }) + " mil";
    }
    
    // Se houver filtro, exibe o valor real formatado
    return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + " m²";
};

const abreviarNome = (nome) => {
    if (!nome || nome === "S/N") return "NÃO IDENTIFICADO";
    let nomeTratado = nome
        .replace(/UNIDADE ESCOLAR /gi, "U.E. ")
        .replace(/GRUPAMENTO DE POLÍCIA MILITAR/gi, "GPM")
        .replace(/DELEGACIA DE POLÍCIA CIVIL/gi, "DPC")
        .replace(/CENTRO DE SAÚDE/gi, "C. SAÚDE")
        .replace(/CENTRO ADMINISTRATIVO/gi, "C. ADM")
        .replace(/\s+/g, " ")
        .trim();

    const limiteCaracteres = 25; 
    if (nomeTratado.length > limiteCaracteres) {
        return nomeTratado.substring(0, limiteCaracteres) + "...";
    }
    return nomeTratado;
};
ChartJS.register(ArcElement, Tooltip, Legend, Title);



const ChartsProGestaoReduzido = ({ data = [], loading = false }) => {
    const isFullData = data.length > 900;

    const metrics = useMemo(() => {
        const totalUnidades = data.length;
        const totalMatriculas = data.filter(item => 
            item.matricula && 
            item.matricula.toUpperCase() !== "SEM REGISTRO" && 
            item.matricula.trim() !== ""
        ).length;

        const areaConstruida = data.reduce((acc, item) => acc + parseArea(item.area_construida), 0);
        const areaTerreno = data.reduce((acc, item) => acc + parseArea(item.area_total), 0);

        // --- LÓGICA PARA O GRÁFICO DE ROSCA (TIPOS) ---
            const contagemTipos = data.reduce((acc, item) => {
                const t = item.tipo || "NÃO INFORMADO";
                acc[t] = (acc[t] || 0) + 1;
                return acc;
            }, {});

            return { totalUnidades, totalMatriculas, areaConstruida, areaTerreno, contagemTipos };
        }, [data]);

        // Dados do Gráfico de Rosca
    const doughnutData = useMemo(() => {
        const labels = Object.keys(metrics.contagemTipos);
        const values = Object.values(metrics.contagemTipos);

        return {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4BC0C090', // Verde água
                    '#FFCE5690', // Amarelo
                    '#36A2EB90', // Azul
                    '#FF638490', // Rosa
                    '#9966FF90', // Roxo
                ],
                borderWidth: 1,
            }]
        };
    }, [metrics.contagemTipos]);
// Lógica dos Gráficos (Ranking Top 10)
    const barAreaConstruidaData = useMemo(() => {
        const topData = [...data]
            .filter(item => parseArea(item.area_construida) > 0 && (item.unidade || item.tipo_unidade))
            .map(item => ({ 
                nome: abreviarNome(item.unidade || item.tipo_unidade), 
                valor: parseArea(item.area_construida) 
            }))
            .sort((a, b) => b.valor - a.valor).slice(0, 10);

        return {
            labels: topData.map(d => d.nome),
            datasets: [{ label: 'm²', data: topData.map(d => d.valor), backgroundColor: '#4BC0C090' }]
        };
    }, [data]);

    const barAreaTerrenoData = useMemo(() => {
        const topData = [...data]
            .filter(item => parseArea(item.area_total) > 0 && (item.unidade || item.tipo_unidade))
            .map(item => ({ 
                nome: abreviarNome(item.unidade || item.tipo_unidade), 
                valor: parseArea(item.area_total) 
            }))
            .sort((a, b) => b.valor - a.valor).slice(0, 10);

        return {
            labels: topData.map(d => d.nome),
            datasets: [{ label: 'm²', data: topData.map(d => d.valor), backgroundColor: '#FFCE5690' }]
        };
    }, [data]);

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Carregando dados...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            
            {/* LINHA DE CARDS COM VALORES MASCARADOS OU REAIS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", width: "490px" }}>
                <div className="metric-card" style={cardStyle("#e3f2fd")}>
                    <span style={labelStyle}>Total Unidades</span>
                    <div style={valueStyle}>{metrics.totalUnidades}</div>
                </div>
                <div className="metric-card" style={cardStyle("#fff3e0")}>
                    <span style={labelStyle}>Com Matrícula</span>
                    <div style={valueStyle}>{metrics.totalMatriculas}</div>
                </div>
                <div className="metric-card" style={cardStyle("#e8f5e9")}>
                    <span style={labelStyle}>Soma Área Const.</span>
                    <div style={valueStyle}>
                        {formatValueWithMask(metrics.areaConstruida, isFullData)}
                    </div>
                </div>
                <div className="metric-card" style={cardStyle("#f3e5f5")}>
                    <span style={labelStyle}>Soma Área Terreno</span>
                    <div style={valueStyle}>
                        {formatValueWithMask(metrics.areaTerreno, isFullData)}
                    </div>
                </div>
            </div>
             
            <div style={{ display: "flex", flexDirection: "column", width: "490px", gap: 15, background: "#fff", padding: 15, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
                <PainelRetratil > 
                <div style={{ height: 200, marginBottom: 10 }}>
                    <Doughnut 
                        data={doughnutData} 
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                title: { display: true, text: "Distribuição por Tipo de Imóvel", font: { size: 11 } },
                                legend: { 
                                    position: 'right',
                                    labels: { boxWidth: 10, font: { size: 9 } }
                                }
                            }
                        }} 
                    />
                </div>
                </PainelRetratil>
                <PainelRetratil > 
                <div style={{ height: 250 }}>
                    <Bar data={barAreaConstruidaData} options={options("Top 10 Unidades (Área Construída)")} />
                </div>
                </PainelRetratil>
                <PainelRetratil > 
                
                <div style={{ height: 250 }}>
                    <Bar data={barAreaTerrenoData} options={options("Top 10 Unidades (Área Terreno)")} />
                </div>
                </PainelRetratil>
            </div>
        </div>
    );
};

// Funções de Estilo
const options = (title) => ({
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
        title: { display: true, text: title, font: { size: 11 } },
        legend: { display: false },
        datalabels: { 
            color: '#444', anchor: 'end', align: 'right', font: { size: 8 },
            formatter: (val) => val > 0 ? val.toLocaleString('pt-BR') : ''
        }
    },
    scales: { x: { beginAtZero: true, ticks: { font: { size: 8 } } }, y: { ticks: { font: { size: 8 } }, grid: { display: false } } }
});

const cardStyle = (bgColor) => ({
    background: bgColor, padding: "10px", borderRadius: "8px", textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #eee",
    display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "65px"
});

const labelStyle = { fontSize: "8px", color: "#666", textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "4px" };
const valueStyle = { fontSize: "11px", fontWeight: "bold", color: "#333" };

export default ChartsProGestaoReduzido;