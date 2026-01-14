import React, { useMemo } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  Title, 
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
  LineElement,
  PointElement,
  ChartDataLabels,
  PointElement, 

);

// --- Helpers de Gráfico ---
const defaultFontSize = 9;
const defaultTitleFontSize = 12;


const territoryColors = {
  'CARNAÚBAIS': '#E41A1C90', 
  'CHAPADA DAS MANGABEIRAS': '#377EB890', 
  'CHAPADA VALE DO ITAIM': '#4DAF4A90', 
  'COCAIS': '#984EA390', 
  'ENTRE RIOS': '#ff800090', 
  'PLANÍCIE LITORÂNEA': '#FFFF3390', 
  'SERRA DA CAPIVARA': '#A65628CC', 
  'TABULEIROS DO ALTO PARNAÍBA': '#F781BF90', 
  'VALE DO CANINDÉ': '#99999990', 
  'VALE DO RIO GUARIBAS': '#66C2A590', 
  'VALE DO SAMBITO': '#FC8D62CC', 
  'VALE DOS RIOS PIAUÍ E ITAUEIRAS': '#8da0cb90',
  'DEFAULT': '#CCCCCC' // Cor padrão 
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
    // Regras de Núcleo/Município (do ChartsCerurb.js)
    .replace(/Conjunto Habitacional /gi, "CH ")
    .replace(/Núcleo de Apoio/gi, "NA")
    .replace(/Ocupação/gi, "Ocup.")
    .replace(/São Francisco de Assis do Piauí/gi, "SF Assis")
    .replace(/São Raimundo Nonato/gi, "SRN")
    .replace(/Padre Marcos/gi, "P. Marcos")
    .replace(/Teresina/gi, "THE")

    // Novas Regras de Território (com base nos seus logs)
    .replace(/CHAPADA DAS MANGABEIRAS/gi, "CHAPADA MANGABEIRAS")
    .replace(/CHAPADA VALE DO ITAIM/gi, "CHAPADA V. ITAIM")
    .replace(/PLANICIE LITORANEA/gi, "PLAN. LITORANEA")
    .replace(/TABULEIROS DO ALTO PARNAÍBA/gi, "TAB. ALTO PARNAÍBA")
    .replace(/VALE DO RIO GUARIBAS/gi, "VALE RIO GUARIBAS")
    .replace(/VALE DOS RIOS PIAUI E ITAUEIRAS/gi, "VALE RIOS PI/ITAUEIRAS")

    // Limpeza final
    .replace(/\s+/g, " ")
    .trim();
};



const ChartsPrincipal = ({ 
  municipios = [], 
  selectedMunicipio = "Todos", 
  resumoPlanilha = {},

  loading = false, 

  territorioStatsFiltrado = {}, 
  estatisticasPorMesFiltrado= {}, 
  planilhaData = []
}) => {
  // Gráfico Resumo de Unidades (Planilha)
  const barUnidadesData = useMemo(() => {
    if (!resumoPlanilha) return { labels: [], datasets: [] };
    const labels = ["Total de Unidades", "Unidades com Sentença"];
    const data = [
        resumoPlanilha.total_unidades || 0,
        resumoPlanilha.total_unidades_sentenca || 0
    ];
    return {
        labels: labels,
        datasets: [{
            label: "Unidades",
            data: data,
            backgroundColor: ["#36A2EB", "#4BC0C0"],
            borderColor: ["#36A2EB", "#4BC0C0"],
            borderWidth: 1
        }]
    };
  }, [resumoPlanilha]);

  // Gráfico Resumo de Registros (Planilha)
  const barRegistrosData = useMemo(() => {
      if (!resumoPlanilha) return { labels: [], datasets: [] };
      const labels = ["Enviados ao Cartório", "Registros Emitidos", "Emitidos pela Central"];
      const data = [
          resumoPlanilha.enviados_cartorio || 0,
          resumoPlanilha.total_registros_emitidos || 0,
          resumoPlanilha.emitidos_central || 0
      ];
      return {
          labels: labels,
          datasets: [{
              label: "Registros",
              data: data,
              backgroundColor: ["#FFCE56", "#FF6384", "#9966FF"],
              borderColor: ["#FFCE56", "#FF6384", "#9966FF"],
              borderWidth: 1
          }]
      };
  }, [resumoPlanilha]);

  // Gráfico Unidades por Território (Planilha)
  const pieTerritoriosData = useMemo(() => {
    // Use a prop FILTRADA
    const territorios = territorioStatsFiltrado || {};
    
    const labelsOrdenados = Object.keys(territorios).sort((a, b) => 
        (territorios[b].unidades || 0) - (territorios[a].unidades || 0)
    );
    
    const labelsFiltrados = labelsOrdenados
      .filter(label => label && label.trim() !== "");
      // .slice(0, 12); // Removido slice para pizza

    const data = labelsFiltrados.map(label => territorios[label].unidades || 0);
    
    const backgroundColors = labelsFiltrados.map(label =>
      territoryColors[label.trim().toUpperCase()] || territoryColors.DEFAULT
    );
    return {
        labels: labelsFiltrados.map(abreviarNome), 
        datasets: [{
            label: 'Total de Unidades por Território',
            data: data,
            backgroundColor:backgroundColors,
            opacity: 0.1
        }]
    };
  // Dependa da prop FILTRADA
  }, [territorioStatsFiltrado]);
  
  // Gráfico Unidades por Mês da Sentença (Planilha)
  const lineMesSentencaData = useMemo(() => {
      const porMes = estatisticasPorMesFiltrado || {};
      
      const labelsOrdenados = Object.keys(porMes).sort((a, b) => {
          const [mesA, anoA] = a.split('/');
          const [mesB, anoB] = b.split('/');
          const dataA = new Date(anoA, mesA - 1); 
          const dataB = new Date(anoB, mesB - 1);
          return dataA - dataB;
      });
      
      const labelsFiltrados = labelsOrdenados.filter(mes => porMes[mes] && porMes[mes].unidades_sentenca > 0);
      const data = labelsFiltrados.map(mes => porMes[mes].unidades_sentenca || 0);
      
      return {
          labels: labelsFiltrados, // <-- Retorna os labels (strings "MM/YYYY")
          datasets: [{
              label: 'Unidades com Sentença por Mês',
              data: data, // <-- Retorna a data (números)
              backgroundColor: '#4BC0C090', // Cor com opacidade
              borderColor: '#4BC0C0', // Cor sólida
              fill: true, // Preenche a área abaixo da linha
              tension: 0.3 // Deixa a linha suave
          }]
      };
  }, [estatisticasPorMesFiltrado]);


  const barNucleosPorMunicipioData = useMemo(() => {
    if (!planilhaData || planilhaData.length === 0) {
        return { labels: [], datasets: [] };
    }
    
    // 1. Conta núcleos por município
    const counts = planilhaData.reduce((acc, item) => {
        const municipio = item.municipio || 'Não Especificado';
        acc[municipio] = (acc[municipio] || 0) + 1;
        return acc;
    }, {});

    // 2. Ordena e pega os Top 10 (para manter o layout do gráfico original)
    const sortedData = Object.entries(counts)
        .sort(([, a], [, b]) => b - a) // Descendente
        .slice(0, 10); 
    
    return {
        labels: sortedData.map(([key]) => abreviarNome(key)), // Usa o helper
        datasets: [{
            label: 'Nº de Núcleos (Planilha)',
            data: sortedData.map(([, value]) => value),
            backgroundColor: "#4c85dbff", // Mantém a cor do gráfico original
        }]
    };
  }, [planilhaData]); // Depende da nova prop

  // --- [LÓGICA SUBSTITUÍDA 2] ---
  // Gráfico de Núcleos por Território (Planilha)
  // (Substitui o antigo 'barDomiciliosMunicipio')
  const barNucleosPorTerritorioData = useMemo(() => {
    const territorios = territorioStatsFiltrado || {};
    if (Object.keys(territorios).length === 0) {
        return { labels: [], datasets: [] };
    }
    
    // 1. Filtra, ordena por contagem de núcleos (descendente)
    const sortedData = Object.entries(territorios)
      .filter(([key]) => key && key.trim() !== "")
      .sort(([, a], [, b]) =>
        (a.count || 0) - (b.count || 0) // Mantém ordenação do gráfico original (ascendente)
      ); 

    // 2. Mapeia cores
    const labels = sortedData.map(([key]) => abreviarNome(key));
    const data = sortedData.map(([, value]) => value.count || 0);
    const bgColors = sortedData.map(([key]) => 
      territoryColors[key.trim().toUpperCase()] || territoryColors.DEFAULT
    );

    return {
      labels: labels,
      datasets: [{
        label: 'Nº de Núcleos',
        data: data,
        backgroundColor: bgColors, // Usa as cores do território
      }]
    };
  }, [territorioStatsFiltrado]);


  if (loading) {
    return <div style={{ padding: 20, textAlign: "center", color: "#555" }}>Carregando gráficos...</div>
  }

  // Renderiza todos os 6 gráficos em uma grade
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
      
      {/* --- Linha 1 (Resumo Planilha) --- */}
      <div style={{ height: "100%", minHeight: 250 }}>
        <Bar
          data={barUnidadesData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { ...defaultPlugins("Resumo de Unidades") },
            scales: defaultScales,
          }}
        />
      </div>

      <div style={{ height: "100%", minHeight: 250 }}>
        <Bar
          data={barRegistrosData}
          options={{
            responsive: true,
            indexAxis: "y", 
            maintainAspectRatio: false,
            plugins: { ...defaultPlugins("Resumo de Registros") },
            scales: { 
              x: { ticks: { color: "#444", font: { size: defaultFontSize } }, grid: { color: "#ddd" }, beginAtZero: true },
              y: { ticks: { color: "#444", font: { size: defaultFontSize } }, grid: { display: false } },
            },
          }}
        />
      </div>

      {/* --- Linha 2 (Novos Gráficos da Planilha) --- */}
      <div style={{ height: "100%", minHeight: 250 }}>
              <Pie
                data={pieTerritoriosData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    ...defaultPlugins("Unidades por Território"),
                    // Lógica de datalabel similar ao ChartsCerurb
                    datalabels: {
                      display: pieTerritoriosData.labels.length <= 12, 
                      color: '#333',
                      font: { size: 9 },
                      formatter: (value, ctx) => {
                        // Mostra porcentagem
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value / total * 100);
                        // Só mostra se for > 5%
                        if (percentage > 5) {
                          return value.toLocaleString("pt-BR"); 
                        }
                        return '';
                      },
                    }
                  },
                  // Remove 'scales' que não é usado pelo Pie
                }}
              />
            </div>

        <div style={{ height: "100%", minHeight: 250 }}>
          <Line 
            data={lineMesSentencaData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { ...defaultPlugins("Unidades com Sentença por Mês") },
              scales: defaultScales, // <-- Usa as escalas X/Y padrão (Categoria/Linear)
            }}
          />
        </div>

      {/* --- Linha 3 (por municipio) --- */}
      <div style={{ height: "100%", minHeight: 250 }}>
          <Bar
          // Substitui 'barPopulacaoMunicipio'
          data={barNucleosPorMunicipioData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            // Novo Título
            plugins: { ...defaultPlugins("Top 10 Municípios por Núcleos") }, 
            scales: defaultScales, // Mantém escalas do gráfico original (vertical)
          }}
        />
      </div>
      
      <div style={{ height: "100%", minHeight: 250 }}>
        <Bar
          // Substitui 'barDomiciliosMunicipio'
          data={barNucleosPorTerritorioData} 
          options={{
            responsive: true,
            indexAxis: "y", // Mantém eixo horizontal do gráfico original
            maintainAspectRatio: false,
            // Novo Título
            plugins: { ...defaultPlugins("Núcleos por Território", false) }, // 'false' para esconder legenda
            scales: {
              // Mantém escalas do gráfico original (horizontal)
              x: { ticks: { precision: 0, color: "#444", font: { size: defaultFontSize } }, grid: { color: "#ddd" }, beginAtZero: true },
              y: { ticks: { color: "#444", font: { size: defaultFontSize } }, grid: { display: false } },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ChartsPrincipal;