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

// --- Configurações Visuais ---
const defaultFontSize = 10;
const defaultTitleFontSize = 13;

const defaultPlugins = (titleText, legendVisible = true) => ({
  legend: {
    display: legendVisible,
    position: 'bottom',
    labels: { font: { size: defaultFontSize }, boxWidth: 10, padding: 10 }
  },
  title: {
    display: true,
    text: titleText,
    font: { size: defaultTitleFontSize, weight: 'bold' },
    color: '#333',
    padding: { bottom: 15 }
  },
  datalabels: {
    color: '#333',
    anchor: 'end',
    align: 'top',
    offset: -4,
    font: { size: 9, weight: 'bold' },
    formatter: (value) => value > 0 ? value : ''
  }
});

const defaultScales = {
  x: { ticks: { color: "#555", font: { size: 9 } }, grid: { display: false } },
  y: { ticks: { color: "#555", font: { size: 9 } }, grid: { color: "#eee" }, beginAtZero: true }
};

const abreviarNome = (nome) => {
  if (!nome) return "";
  // Pega o primeiro nome e a inicial do último, se houver
  const partes = nome.trim().split(" ");
  if (partes.length > 1) {
      return `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`;
  }
  return partes[0];
};

const ChartsNgeoInfo = ({ data = [] }) => {

  // --- LÓGICA DE PROCESSAMENTO DE DADOS ---

  // 1. Gráfico: Núcleos por Responsável (Técnico Geral)
  const barResponsavelData = useMemo(() => {
    if (!data.length) return { labels: [], datasets: [] };

    const counts = {};
    data.forEach(item => {
        const resp = item.responsavel ? item.responsavel.trim().toUpperCase() : "NÃO DEFINIDO";
        // Filtra valores vazios ou traços
        if (resp && resp !== "-" && resp !== "") {
            counts[resp] = (counts[resp] || 0) + 1;
        }
    });

    const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);

    return {
        labels: sorted.map(([k]) => abreviarNome(k)),
        datasets: [{
            label: 'Qtd. Núcleos',
            data: sorted.map(([, v]) => v),
            backgroundColor: '#FF6384', // Rosa/Vermelho
            borderRadius: 4,
            barThickness: 30,
        }]
    };
  }, [data]);

  // 2. Gráfico: Núcleos por Memoriais (Campo solicitado)
  const barMemoriaisData = useMemo(() => {
    if (!data.length) return { labels: [], datasets: [] };

    const counts = {};
    data.forEach(item => {
        // Pega o campo 'memoriais', normaliza para maiúsculo
        const memorialName = item.memoriais ? item.memoriais.trim().toUpperCase() : "NÃO PREENCHIDO";
        
        // Ignora campos vazios se desejar, ou conta como "Não Preenchido"
        if (memorialName && memorialName !== "-" && memorialName !== "") {
            counts[memorialName] = (counts[memorialName] || 0) + 1;
        }
    });

    // Ordena do maior para o menor
    const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);

    return {
        labels: sorted.map(([k]) => abreviarNome(k)), // Abrevia o nome para caber no gráfico
        datasets: [{
            label: 'Memoriais por Pessoa',
            data: sorted.map(([, v]) => v),
            backgroundColor: '#4BC0C0', // Verde Água
            borderRadius: 4,
            barThickness: 30, // Largura da barra fixa para ficar bonito
        }]
    };
  }, [data]);

//   // 2. Gráfico: Status (Mantido)
//   const pieStatusData = useMemo(() => {
//     if (!data.length) return { labels: [], datasets: [] };

//     const counts = {};
//     data.forEach(item => {
//         const st = item.status ? item.status.trim().toUpperCase() : "SEM STATUS";
//         if (st !== "") {
//             counts[st] = (counts[st] || 0) + 1;
//         }
//     });

//     const labels = Object.keys(counts);
//     const values = Object.values(counts);

//     return {
//         labels: labels,
//         datasets: [{
//             label: 'Status',
//             data: values,
//             backgroundColor: [
//                 '#36A2EB', '#FFCE56', '#FF9F40', '#9966FF', '#C9CBCF', '#4BC0C0'
//             ],
//             borderWidth: 1,
//             borderColor: '#fff'
//         }]
//     };
//   }, [data]);


  if (!data || data.length === 0) {
    return <div style={{ padding: 20, textAlign: "center", color: "#888" }}>Sem dados para exibir gráficos.</div>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr ", 
      background: "#fff",
      borderRadius: 10,
      gap: 15,
      padding: 20, 
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: "1px solid #e0e0e0",
    }}>

      {/* Gráfico 1: Responsáveis (Barras) */}
      <div style={{ height: "300px" }}>
        <Bar
          data={barResponsavelData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: defaultPlugins("Núcleos por Responsável", false),
            scales: defaultScales
          }}
        />
      </div>

      {/* Gráfico 2: Memoriais (Substituindo Municípios) - Ocupa linha inteira */}
      <div style={{ height: "280px", marginTop: "10px" }}>
        <Bar
          data={barMemoriaisData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: defaultPlugins("Produção de Memoriais (Por Técnico)", false),
            scales: defaultScales
          }}
        />
      </div>

    </div>
  );
};

export default ChartsNgeoInfo;