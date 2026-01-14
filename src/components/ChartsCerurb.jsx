import React, { useMemo } from "react";
import { Pie, Bar , Radar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { normalizeString } from "../utils/string"; // Verifique o caminho

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title 
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  RadialLinearScale,
  Title,
  PointElement,
  ChartDataLabels 
);

// --- Helpers (Considere mover para um utils/chartUtils.js) ---
const defaultFontSize = 9;
const defaultTitleFontSize = 12;

const statusColors = {
  'Coleta Recusada': '#faad83CC',
  'Concluído': '#00fff7a2',
  'Correção de coleta': '#9d00ffcc',
  'Apto para Migração': '#4eb2ecCC',
  'Iniciado': '#949895CC',
  'Em análise': '#000000CC',
  'Regularizado Externamente': '#79e781CC',
  'Casa Fechada': '#ff8000af',
  'Cancelado': '#f68f8fe0',
  'Coleta Segunda Etapa': '#d4d4d4CC',
  'Processo Administrativo': '#643a3aCC',
  'Análise Jurídica': '#f6ff00CC',
  'Validação Jurídica': '#cada14CC',
  'Enviado ao CerurbJus': '#1638b4CC',
  'Regularizado': '#279916ba',
  'Pendente': '#ff0000CC',
  'Memorial Para Correção': '#ff4af6c5',
  'Inconsistência no sistema da ADH': '#8a6565CC',
  'Bloqueado': '#9f0000CC',
  'Correção de Mapa': '#a98cffbf',
  'DEFAULT': '#f4f7fcCC'
};

const defaultPlugins = (titleText, legendVisible = true) => ({
  legend: {
    display: legendVisible,
    position: 'bottom',
    labels: {
      font: { size: defaultFontSize },
      boxWidth: 8,
      padding: 6
    }
  },
  title: {
    display: true,
    text: titleText,
    font: { size: defaultTitleFontSize },
    color: '#333'
  },
  datalabels: {
    color: '#333',
    anchor: 'end',
    align: 'bottom',
    font: { size: 9 },
    formatter: (value) => value > 5 ? value.toLocaleString("pt-BR") : ''
  }
});

const defaultScales = {
  x: {
    ticks: { color: "#444", font: { size: defaultFontSize } },
    grid: { display: false }
  },
  y: {
    ticks: { color: "#444", font: { size: defaultFontSize } },
    grid: { color: "#ddd" },
    beginAtZero: true
  }
};

const abreviarNome = (nome) => {
  if (!nome) return "";
  return nome
    .replace(/Conjunto Habitacional /gi, "CH ")
    .replace(/Núcleo de Apoio/gi, "NA")
    .replace(/Ocupação/gi, "Ocup.")
    .replace(/São Francisco de Assis do Piauí/gi, "SF Assis")
    .replace(/São Raimundo Nonato/gi, "SRN")
    .replace(/Padre Marcos/gi, "P. Marcos")
    .replace(/Teresina/gi, "THE")
    .replace(/\s+/g, " ")
    .trim();
};
// --- Fim dos Helpers ---


const ChartsCerurb = ({ 
  statusCounts = {}, 
  nucleosExternos = [], 
  selectedMunicipio = "Todos", 
  loading = false 
}) => {

  // Gráfico de Pizza (Painel CERURB)
  const pieData = useMemo(() => {
    if (!statusCounts || Object.keys(statusCounts).length === 0) {
      return { labels: [], datasets: [] };
    }
    const originalLabels = Object.keys(statusCounts);
    const displayLabels = originalLabels.map(label =>
      label === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : label
    );
    const backgroundColors = originalLabels.map(label => 
      statusColors[label] || statusColors.DEFAULT
    );

    return {
      labels: displayLabels,
      datasets: [{
        label: "Quantidade",
        data: Object.values(statusCounts),
        backgroundColor: backgroundColors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 5,
      }]
    };
  }, [statusCounts]);

  // Gráfico de Radar (Painel CERURB)
  const barData = useMemo(() => {
    if (!statusCounts || Object.keys(statusCounts).length === 0) {
      return { labels: [], datasets: [] };
    }
    const originalLabels = Object.values(statusCounts);
    const displayLabels = Object.keys(statusCounts).map(label =>
      label === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : label
    );

    return {
    labels: displayLabels,
    datasets: [{
      label: "Quantidade",
      data: originalLabels,
      backgroundColor: "#1e88e5CC", // Adicionado transparência
      borderColor: "#1e88e5",
      borderWidth: 1,
    }]
    };
  }, [statusCounts]);

  // Vetorizados por Núcleo (Painel CERURB)
  const barNucleosData = useMemo(() => {
    const topNucleos = [...nucleosExternos]
      .sort((a, b) => (b.totalVetorizados || 0) - (a.totalVetorizados || 0))
      .slice(0, 10); 

    return {
      labels: topNucleos.map(n => abreviarNome(n.nome)),
      datasets: [{
        label: "Total Vetorizados",
        data: topNucleos.map(n => n.totalVetorizados),
        backgroundColor: "#4caf50",
        borderColor: "#388e3c",
        borderWidth: 1
      }]
    };
  }, [nucleosExternos]);

  // Status por Núcleo (Painel CERURB)
  const barStatusPorNucleoData = useMemo(() => {
    if (nucleosExternos.length === 0) return { labels: [], datasets: [] };

    const mun = normalizeString(selectedMunicipio);
    const nucleosFiltrados = selectedMunicipio === "Todos"
      ? nucleosExternos
      : nucleosExternos.filter(n =>
          normalizeString(n.cidadeNucleo || "") === mun
        );

    const topNucleos = [...nucleosFiltrados]
      .sort((a, b) => (b.totalVetorizados || 0) - (a.totalVetorizados || 0))
      .slice(0, 10);

    const statusKeysSet = new Set();
    topNucleos.forEach(n => {
      const statusObj = n.quantidadeImovelStatus || {};
      Object.keys(statusObj).forEach(k => statusKeysSet.add(k));
    });
    const statusKeys = Array.from(statusKeysSet);

    const datasets = statusKeys.map((statusKey) => ({
      label: statusKey === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : statusKey,
      data: topNucleos.map(n => n.quantidadeImovelStatus?.[statusKey] || 0),
      backgroundColor: statusColors[statusKey] || statusColors.DEFAULT,
      stack: "Stack 0"
    }));

    return {
      labels: topNucleos.map(n => abreviarNome(n.nome)),
      datasets
    };
  }, [nucleosExternos, selectedMunicipio]);


  if (loading) {
    return <div style={{ padding: 20, textAlign: "center", color: "#555" }}>Carregando gráficos...</div>
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "#fff",
      borderRadius: 10,
      gap: 12,
      padding: 20, 
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: "1px solid #ddd",
    }}>
      
      <div style={{ height: "100%", minHeight: 250 }}>
        <Pie
          data={pieData}
          options={{
            plugins: {...defaultPlugins("Distribuição por status"),
            datalabels: {
              display: pieData.labels.length <= 10, 
              color: '#333',
              anchor: 'end',
              align: 'bottom',
              font: { size: 9 },
              formatter: (value) => value > 10 ? value.toLocaleString("pt-BR") : ''
            },
            }
          }}
      />
      </div>

      <div style={{ height: "100%",minHeight: 250}}>
        <Radar
          data={barData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: "#ddd" },
                grid: { color: "#ddd" },
                pointLabels: {
                  font: { size: defaultFontSize },
                  color: "#444"
                },
                ticks: {
                  beginAtZero: true,
                  color: "#666",
                  font: { size: defaultFontSize }
                }
              }
            },
            plugins: {
              ...defaultPlugins("Status por núcleo (Radar)"),
              datalabels: {
                display: false
              }
            }
          }}
        />
      </div>

      <div style={{ height: "100%", minHeight: 250 }}>
        <Bar
          data={barNucleosData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...defaultPlugins("Total vetorizado por núcleo"),
              datalabels: {
                display: barNucleosData.labels.length <= 10,
                color: "#333",
                anchor: "end",
                align: "top",
                font: { size: 9 },
                formatter: (value) => value > 10 ? value.toLocaleString("pt-BR") : ""
              }
            },
            scales: defaultScales,
          }}
        />
      </div>

      <div style={{ height: "100%", minHeight: 250}}>
        <Bar
          data={barStatusPorNucleoData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...defaultPlugins("Status por núcleo (Empilhado)", barStatusPorNucleoData.datasets.length <= 10),
              datalabels: {
                  display: false // Desabilitado para não poluir
              }
            },
            scales: {
              x: {
                ticks: { color: "#444", font: { size: defaultFontSize } },
                grid: { color: "#ddd" },
                beginAtZero: true,
                stacked: true
              },
              y: {
                ticks: { color: "#444", font: { size: defaultFontSize } },
                grid: { display: false },
                stacked: true
              },
            }
          }}
        />
      </div>
      
    </div>
  );
};

export default ChartsCerurb;