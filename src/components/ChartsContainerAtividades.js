// src/components/ChartsContainerAtividades.js

import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the plugin
import { Chart as ChartJS } from "chart.js";
ChartJS.register(ChartDataLabels);

// --- Helpers and Configuration (No Changes Here) ---
const defaultFontSize = 9;
const defaultTitleFontSize = 11;

const defaultPlugins = (titleText, legendVisible = true) => ({
  legend: {
    display: legendVisible,
    position: 'bottom',
    labels: { font: { size: defaultFontSize }, boxWidth: 8, padding: 6 }
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
    align: 'top',
    font: { size: defaultFontSize, weight: 'bold' },
    formatter: (value) => value > 0 ? value.toLocaleString("pt-BR") : null
  }
});

const ChartWrapper = ({ title, children }) => (
  <div style={{ 
    background: '#fff', 
    padding: '20px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '250px'
  }}>
    <div style={{ flex: 1, position: 'relative' }}> 
        {children}
    </div>
  </div>
);

const chartColors = [
    'rgba(25, 118, 210, 0.8)', 'rgba(211, 47, 47, 0.8)', 'rgba(251, 192, 45, 0.8)',
    'rgba(56, 142, 60, 0.8)', 'rgba(230, 81, 0, 0.8)', 'rgba(123, 31, 162, 0.8)',
];

// --- Component Logic (Corrections Applied Here) ---

const ChartsContainerAtividades = ({ data }) => {
  // 1. Extraia os dados de forma segura, com fallback para objetos vazios.
  const { porSituacao, porMunicipio, porTerritorio } = data?.resumo || {};

  // 2. Mova os Hooks para o topo, ANTES do return condicional.
  const processedDoughnutData = useMemo(() => {
    // 3. Adicione a verificação DENTRO de cada useMemo.
    if (!porSituacao) return { labels: [], datasets: [] };

    const sortedSituacao = Object.entries(porSituacao)
      .sort(([, a], [, b]) => b.lotes - a.lotes);

    return {
      labels: sortedSituacao.map(([label]) => label),
      datasets: [{
        label: 'Lotes',
        data: sortedSituacao.map(([, values]) => values.lotes),
        backgroundColor: chartColors,
        borderColor: '#fff',
        borderWidth: 2,
      }],
    };
  }, [porSituacao]);

  const processedBarDataTerritorios = useMemo(() => {
    if (!porTerritorio) return { labels: [], datasets: [] };

    const topTerritorios = Object.entries(porTerritorio)
      .sort(([, a], [, b]) => b.lotes - a.lotes)
      .slice(0, 10);
      
    return {
      labels: topTerritorios.map(([label]) => label),
      datasets: [
        {
          label: 'Total de Lotes',
          data: topTerritorios.map(([, values]) => values.lotes),
          backgroundColor: 'rgba(230, 81, 0, 0.7)', // Laranja
        },
      ],
    };
  }, [porTerritorio]);
  
  const processedBarData = useMemo(() => {
    if (!porMunicipio) return { labels: [], datasets: [] };

  const topMunicipios = Object.entries(porMunicipio)
    .sort(([, a], [, b]) => b.lotes - a.lotes)
    .slice(0, 10);
    return {
      labels: topMunicipios.map(([label]) => label),
      datasets: [
        {
          label: 'Total de Lotes',
          data: topMunicipios.map(([, values]) => values.lotes),
          backgroundColor: 'rgba(25, 118, 210, 0.7)',
        },
        {
          label: 'Total de Quadras',
          data: topMunicipios.map(([, values]) => values.quadras),
          backgroundColor: 'rgba(56, 142, 60, 0.7)',
        },
      ],
    };
  }, [porMunicipio]);

  // 4. O return condicional agora fica DEPOIS dos Hooks.
  if (!porSituacao || !porMunicipio) {
    return <p style={{ padding: '20px' }}>Aguardando dados para gerar gráficos...</p>;
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateRows: '1fr 1fr',
      gap: '20px',
      height: '100%',

    }}>
      <ChartWrapper>
        <Doughnut 
          data={processedDoughnutData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...defaultPlugins("Lotes por Situação - 2025" ),
              datalabels: {
                color: '#fff',
                anchor: 'center',
                align: 'center',

                formatter: (value, context) => {
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  if (total === 0) return '0%';
                  const percentage = ((value / total) * 100).toFixed(0) + '%';
                  return percentage;
                }
              }
            }
          }} 
        />
      </ChartWrapper>
      
      <ChartWrapper>
        <Bar 
          data={processedBarData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: defaultPlugins("Municípios por Nº de Lotes - 2025"),
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 8 
                        }
                    }
                }
            }
          }} 
        />
      </ChartWrapper>

      <ChartWrapper>
        <Bar 
          data={processedBarDataTerritorios} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // <-- Transforma em gráfico de barras horizontais
            plugins: {
              ...defaultPlugins("Territórios por Nº de Lotes - 2025"),
              datalabels: { // Customização para alinhar à direita
                color: '#333',
                anchor: 'end',
                align: 'end',
                font: { size: defaultFontSize, weight: 'bold' },
                formatter: (value) => value > 0 ? value.toLocaleString("pt-BR") : null
              }
            },
            scales: {
                y: {
                    ticks: {
                        font: {
                            size: 9 // Diminui a fonte para caber melhor os nomes
                        }
                    }
                }
            }
          }} 
        />
      </ChartWrapper>
    </div>
  );
};

export default ChartsContainerAtividades;