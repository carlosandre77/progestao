import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    ChartDataLabels
);

// --- Helpers de Estilização ---
const defaultFontSize = 9;
const defaultTitleFontSize = 11;

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

const defaultPlugins = (titleText, legendVisible = false) => ({
    legend: {
        display: legendVisible,
        position: 'bottom',
        labels: { font: { size: defaultFontSize }, boxWidth: 8 }
    },
    title: {
        display: true,
        text: titleText,
        font: { size: defaultTitleFontSize },
        color: '#333'
    },
    datalabels: {
        color: '#444',
        anchor: 'end',
        align: 'top',
        font: { size: 8, weight: 'bold' },
        formatter: (value) => value > 0 ? value.toLocaleString("pt-BR") : ''
    }
});

const ChartsProGestao = ({ data = [], loading = false }) => {

    // 1. Tipologia dos Prédios (Barra - Top 10)
    const barTipologiaData = useMemo(() => {
        const counts = {};
        data.forEach(item => {
            const tipo = item.tipo_unidade || "OUTROS";
            counts[tipo] = (counts[tipo] || 0) + 1;
        });

        const sortedTypes = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return {
            labels: sortedTypes.map(([label]) => label),
            datasets: [{
                label: 'Quantidade',
                data: sortedTypes.map(([, val]) => val),
                backgroundColor: '#36A2EB90',
                borderColor: '#36A2EB',
                borderWidth: 1,
                borderRadius: 4
            }]
        };
    }, [data]);

    // 2. Área Construída por Unidade (Horizontal - Top 10)
    const barAreaConstruidaData = useMemo(() => {
        const topData = [...data]
            .map(item => ({ 
                nome: abreviarNome(item.unidade || "S/N"), 
                valor: parseArea(item.area_construida) 
            }))
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 10);

        return {
            labels: topData.map(d => d.nome),
            datasets: [{
                label: 'Área Construída (m²)',
                data: topData.map(d => d.valor),
                backgroundColor: '#4BC0C090',
                borderColor: '#4BC0C0',
                borderWidth: 1
            }]
        };
    }, [data]);

    // 3. Área de Terreno por Unidade (Horizontal - Top 10)
    const barAreaTerrenoData = useMemo(() => {
        const topData = [...data]
            .map(item => ({ 
                nome: abreviarNome(item.unidade || "S/N"), 
                valor: parseArea(item.area_total) 
            }))
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 10);

        return {
            labels: topData.map(d => d.nome),
            datasets: [{
                label: 'Área do Terreno (m²)',
                data: topData.map(d => d.valor),
                backgroundColor: '#FFCE5690',
                borderColor: '#FFCE56',
                borderWidth: 1
            }]
        };
    }, [data]);

    // 4. Área Construída por Município (Top 10)
    const barAreaMunicipioData = useMemo(() => {
        const munMap = {};
        data.forEach(item => {
            const mun = item.municipio || "OUTROS";
            munMap[mun] = (munMap[mun] || 0) + parseArea(item.area_construida);
        });

        const sorted = Object.entries(munMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        return {
            labels: sorted.map(([k]) => k),
            datasets: [{
                label: 'm² Totais',
                data: sorted.map(([, v]) => v),
                backgroundColor: '#9966FF90',
                borderRadius: 4
            }]
        };
    }, [data]);

    if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Carregando dados...</div>;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#fff",
            borderRadius: 10,
            gap: 15,
            padding: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #ddd",
        }}>
            {/* Gráfico 1: Tipologia */}
            <div style={{ height: 280 }}>
                <Bar 
                    data={barTipologiaData} 
                    options={{
                        maintainAspectRatio: false,
                        plugins: defaultPlugins("Tipologia dos Prédios (Top 10)"),
                        scales: {
                            x: { ticks: { font: { size: 8 } }, grid: { display: false } },
                            y: { beginAtZero: true }
                        }
                    }} 
                />
            </div>

            {/* Gráfico 2: Área por Município */}
            <div style={{ height: 280 }}>
                <Bar 
                    data={barAreaMunicipioData} 
                    options={{
                        maintainAspectRatio: false,
                        plugins: defaultPlugins("Área Const. por Município (Top 10)"),
                        scales: {
                            x: { ticks: { font: { size: 8 } }, grid: { display: false } },
                            y: { beginAtZero: true }
                        }
                    }} 
                />
            </div>

            {/* Gráfico 3: Área Construída Individual */}
            <div style={{ height: 280 }}>
                <Bar 
                    data={barAreaConstruidaData} 
                    options={{
                        indexAxis: 'y',
                        maintainAspectRatio: false,
                        plugins: defaultPlugins("Top 10 Unidades (Área Construída)"),
                        scales: {
                            x: { beginAtZero: true },
                            y: { ticks: { font: { size: 8 } }, grid: { display: false } }
                        }
                    }} 
                />
            </div>

            {/* Gráfico 4: Área Terreno Individual */}
            <div style={{ height: 280 }}>
                <Bar 
                    data={barAreaTerrenoData} 
                    options={{
                        indexAxis: 'y',
                        maintainAspectRatio: false,
                        plugins: defaultPlugins("Top 10 Unidades (Área Terreno)"),
                        scales: {
                            x: { beginAtZero: true },
                            y: { ticks: { font: { size: 8 } }, grid: { display: false } }
                        }
                    }} 
                />
            </div>
        </div>
    );
};

export default ChartsProGestao;