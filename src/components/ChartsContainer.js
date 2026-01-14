import React, { useMemo } from "react";
import { Pie, Bar , Radar  } from "react-chartjs-2";
import { normalizeString } from "../utils/string";
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

const defaultFontSize = 9;
const defaultTitleFontSize = 12;


const statusColors = {
  'Coleta Recusada': '#faad83CC',
  'Concluído': '#00fff7a2',
  'Correção de coleta': '#9d00ffcc', // Já tinha transparência
  'Apto para Migração': '#4eb2ecCC',
  'Iniciado': '#949895CC',
  'Em análise': '#000000CC',
  'Regularizado Externamente': '#79e781CC',
  'Casa Fechada': '#ff8000af',
  'Cancelado': '#f68f8fe0', // Já tinha transparência
  'Coleta Segunda Etapa': '#d4d4d4CC',
  'Processo Administrativo': '#643a3aCC',
  'Análise Jurídica': '#f6ff00CC',
  'Validação Jurídica': '#cada14CC',
  'Enviado ao CerurbJus': '#1638b4CC',
  'Regularizado': '#279916ba', // Já tinha transparência
  'Pendente': '#ff0000CC',
  'Memorial Para Correção': '#ff4af6c5', // Já tinha transparência
  'Inconsistência no sistema da ADH': '#8a6565CC',
  'Bloqueado': '#9f0000CC',
  'Correção de Mapa': '#a98cffbf', // Já tinha transparência
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
 



const ChartsContainer = ({ 
    statusCounts = {}, 
    nucleosExternos = [], 
    municipios = [], 
    selectedMunicipio = [], 
    loading = false 
  }) => {
  const pieData = useMemo(() => {
      // ADICIONE ESTA GUARDA
      if (!statusCounts || Object.keys(statusCounts).length === 0) {
        return { labels: [], datasets: [] };
      }

      const originalLabels = Object.keys(statusCounts);
      const displayLabels = originalLabels.map(label =>
        label === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : label
      );
      // ... (o resto da sua lógica de cores que você já aplicou) ...
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

  const barData = useMemo(() => {
    const originalLabels = Object.values(statusCounts);
    const displayLabels =  Object.keys(statusCounts).map(label =>
      label === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : label
    );

    return {
    labels: displayLabels,
    datasets: [{
      label: "Quantidade",
      data: originalLabels,
      backgroundColor: "#1e88e5",
      borderColor: "#1e88e5",

      borderWidth: 1,
    }]
    };
  }, [statusCounts]);

  // vetorizados por nucleo
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


  

const barStatusPorNucleoData = useMemo(() => {
    if (nucleosExternos.length === 0) return { labels: [], datasets: [] };

    // ... (lógica de filtro e ordenação não muda) ...
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

    // Monta os datasets
    // A variável 'idx' não é mais necessária
    const datasets = statusKeys.map((statusKey) => ({
      label: statusKey === "Inconsistência no sistema da ADH" ? "Inconsistência ADH" : statusKey,
      data: topNucleos.map(n => n.quantidadeImovelStatus?.[statusKey] || 0),
      // Use a 'statusKey' para buscar a cor no objeto 'statusColors'
      backgroundColor: statusColors[statusKey] || statusColors.DEFAULT, // <-- MODIFICADO
      stack: "Stack 0"
    }));

    return {
      labels: topNucleos.map(n => abreviarNome(n.nome)),
      datasets
    };
  }, [nucleosExternos, selectedMunicipio]);



  const barPopulacaoMunicipio = useMemo(() => {
    const municipiosFiltrados = selectedMunicipio === "Todos"
      ? municipios
      : municipios.filter(m =>
          normalizeString(m.properties?.MUNICIPIO) === normalizeString(selectedMunicipio)
        );

    const ordenados = [...municipiosFiltrados]
      .sort((a, b) =>
        parseInt(b.properties?.POPULACAO || 0) - parseInt(a.properties?.POPULACAO || 0)
      )
      .slice(0, 10); 

    return {
      labels: ordenados.map(m => m.properties?.MUNICIPIO || "N/D"),
      datasets: [{
        label: "População (IBGE 2022)",
        data: ordenados.map(m => parseInt(m.properties?.POPULACAO || 0)),
        backgroundColor: "#DF2E2F",
        borderColor: "#F18D82",
        borderWidth: 1
      }]
    };
  }, [municipios, selectedMunicipio]);


  const barDomiciliosMunicipio = useMemo(() => {
    const municipiosFiltrados = selectedMunicipio === "Todos"
      ? municipios
      : municipios.filter(m =>
          normalizeString(m.properties?.MUNICIPIO) === normalizeString(selectedMunicipio)
        );

    const ordenados = [...municipiosFiltrados]
      .sort((a, b) =>
        parseInt(b.properties?.DOMICILIOS || 0) - parseInt(a.properties?.DOMICILIOS || 0)
      )
      .slice(0, 10); 


    return {
      labels: ordenados.map(m => m.properties?.MUNICIPIO || "N/D"),
      datasets: [{
        label: "Domicílios (IBGE 2022)",
        data: ordenados.map(m => parseInt(m.properties?.DOMICILIOS || 0)),
        backgroundColor: "#0E65AF",
        borderColor: "#1567AC",
        borderWidth: 1
      }]
    };
  }, [municipios, selectedMunicipio]);

  

  // if (loading) {
  //   return (
  //     <div style={{
  //       background: "#fff",
  //       borderRadius: 10,
  //       padding: 20,
  //       boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  //       border: "1px solid #ddd",
  //       backdropFilter: "blur(4px)",
  //       opacity: 0.95,
  //       textAlign: "center",
  //       fontSize: 14,
  //       color: "#555",
  //       height: 260,
  //       display: "flex",
  //       alignItems: "center",
  //       justifyContent: "center"
  //     }}>
  //       Carregando gráficos...
  //     </div>
  //   );
  // }
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "#fff",
      borderRadius: 10,

      // overflow: "auto",
      gap: 12,
      padding: 20,      
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: "1px solid #ddd",
      backdropFilter: "blur(4px)",
      opacity: 0.95
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

    {/* <div style={{  height: 250, width: 200   }}>
      <Bar
        data={barData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {...defaultPlugins("Gráfico de Barras - Status"),
                    datalabels: {
          display: barData.labels.length <= 10, 
          color: '#333',
          anchor: 'end',
          align: 'bottom',
          font: { size: 9 },
          formatter: (value) => value > 10 ? value.toLocaleString("pt-BR") : ''
        },
          scales: defaultScales
        }}}
      />
    </div> */}

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
            ...defaultPlugins("Status por núcleo"),
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
          elements: {
            line: {
              tension: 0.3, // suaviza as curvas
              borderWidth: 2
            },
            point: {
              radius: 4,
              hoverRadius: 6
            }
          }
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
            ...defaultPlugins("Status por núcleo", barStatusPorNucleoData.datasets.length <= 10),
            datalabels: {
              display: barStatusPorNucleoData.labels.length <= 10 && barStatusPorNucleoData.datasets.length <= 10,
              color: '#333',
              anchor: 'end',
              align: 'bottom',
              font: { size: 9 },
              formatter: (value) => value > 10 ? value.toLocaleString("pt-BR") : ''
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

    <div style={{ height: "100%", minHeight: 250, flex: "1 1 250px" }}>
    <Bar
      data={barPopulacaoMunicipio}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...defaultPlugins("População por município"),
          datalabels: {
            display: barPopulacaoMunicipio.labels.length <= 10, 
            color: '#fff',
            anchor: 'end',
            align: 'bottom',
            font: { size: 11 , fontWeight: 'bold'},
            formatter: (value) => value > 10 ? value.toLocaleString("pt-BR") : ''
          }
        },
          scales: {
            x: {
              ticks: { color: "#444", font: { size: defaultFontSize } },
              grid: { color: "#ddd" },
              beginAtZero: true,
            },
            y: {
              ticks: { color: "#444", font: { size: defaultFontSize } },
              grid: { display: false },
            },
          },
      }}
    />
    </div>
    <div style={{ height: "100%", minHeight: 250, flex: "1 1 450px" }}>
      <Bar
        data={barDomiciliosMunicipio}
        options={{
          responsive: true,
          indexAxis: "y", 
          maintainAspectRatio: false,
          plugins: {
            ...defaultPlugins("Domicílios por município"),
            datalabels: {
              display: barDomiciliosMunicipio.labels.length <= 15,
              color: "#fff",
              anchor: "end",
              align: "left",
              font: { size: 11, fontWeight: "bold" },
              formatter: (value) =>
                value > 10 ? value.toLocaleString("pt-BR") : "",
            },
          },
          scales: {
            x: {
              ticks: { color: "#444", font: { size: defaultFontSize } },
              grid: { color: "#ddd" },
              beginAtZero: true,
            },
            y: {
              ticks: { color: "#444", font: { size: defaultFontSize } },
              grid: { display: false },
            },
          },
        }}
      />
    </div>

    </div>
  );
};

export default ChartsContainer;
