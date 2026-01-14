import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";


// Helpers de conversão e abreviação
const parseArea = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
};

const abreviarNome = (nome) => {
    if (!nome) return "";
    return nome
        .replace(/UNIDADE ESCOLAR /gi, "U.E. ")
        .replace(/GRUPAMENTO DE POLÍCIA MILITAR/gi, "GPM")
        .replace(/DELEGACIA DE POLÍCIA CIVIL/gi, "DPC")
        .replace(/CENTRO DE SAÚDE/gi, "C. SAÚDE")
        .replace(/CENTRO ADMINISTRATIVO/gi, "C. ADM")
        .replace(/\s+/g, " ")
        .trim();
};

const ChartsProGestaoReduzido = ({ data = [], loading = false }) => {
    
    // 1. Cálculos dos Indicadores (Cards)
    const metrics = useMemo(() => {
        const totalUnidades = data.length;
        const totalMatriculas = data.filter(item => 
            item.matricula && 
            item.matricula.toUpperCase() !== "SEM REGISTRO" && 
            item.matricula.trim() !== ""
        ).length;

        const areaConstruida = data.reduce((acc, item) => acc + parseArea(item.area_construida), 0);
        const areaTerreno = data.reduce((acc, item) => acc + parseArea(item.area_total), 0);

        return { totalUnidades, totalMatriculas, areaConstruida, areaTerreno };
    }, [data]);

    // 2. Rankings para os Gráficos
    const barAreaConstruidaData = useMemo(() => {
        const topData = [...data]
            .map(item => ({ nome: abreviarNome(item.unidade || "S/N"), valor: parseArea(item.area_construida) }))
            .sort((a, b) => b.valor - a.valor).slice(0, 10);
        return {
            labels: topData.map(d => d.nome),
            datasets: [{ label: 'm²', data: topData.map(d => d.valor), backgroundColor: '#4BC0C090' }]
        };
    }, [data]);

    const barAreaTerrenoData = useMemo(() => {
        const topData = [...data]
            .map(item => ({ nome: abreviarNome(item.unidade || "S/N"), valor: parseArea(item.area_total) }))
            .sort((a, b) => b.valor - a.valor).slice(0, 10);
        return {
            labels: topData.map(d => d.nome),
            datasets: [{ label: 'm²', data: topData.map(d => d.valor), backgroundColor: '#FFCE5690' }]
        };
    }, [data]);

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Carregando dados...</div>;

    const options = (title) => ({
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: title, font: { size: 11 } },
            legend: { display: false },
            datalabels: { color: '#444', anchor: 'end', align: 'right', font: { size: 8 } }
        },
        scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 8 } }, grid: { display: false } } }
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            
            {/* LINHA DE CARDS DE INDICADORES */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", width: 100 }}>
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
                    <div style={valueStyle}>{metrics.areaConstruida.toLocaleString('pt-BR')} m²</div>
                </div>
                <div className="metric-card" style={cardStyle("#f3e5f5")}>
                    <span style={labelStyle}>Soma Área Terreno</span>
                    <div style={valueStyle}>{metrics.areaTerreno.toLocaleString('pt-BR')} m²</div>
                </div>
            </div>

            {/* CONTAINER DOS GRÁFICOS */}
            <div style={{ display: "flex", flexDirection: "column",width: 490, gap: 15, background: "#fff", padding: 15, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
                <div style={{ height: 260 }}><Bar data={barAreaConstruidaData} options={options("Top 10 Unidades (Área Construída)")} /></div>
                <div style={{ height: 260 }}><Bar data={barAreaTerrenoData} options={options("Top 10 Unidades (Área Terreno)")} /></div>
            </div>
        </div>
    );
};

// Estilos internos rápidos para os cards
const cardStyle = (bgColor) => ({
    background: bgColor,
    padding: "10px",
    width: 100,
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #eee"
});
const labelStyle = { fontSize: "9px", color: "#666", textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "4px", };
const valueStyle = { fontSize: "14px", fontWeight: "bold", color: "#333"};

export default ChartsProGestaoReduzido;