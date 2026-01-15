// App.js
import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useLogin } from "./hooks/useLogin";
import { useNucleoFilters } from "./hooks/useNucleoFilters";


import MapComponent from "./components/MapComponent";
import FilterControls from "./components/FilterControls";

import LoginForm from "./components/LoginForm";

import ViewSwitcher from './components/ViewSwitcher';
import PainelPrincipal from './components/PainelPrincipal';

import ChartsProGestaoReduzido from './components/ChartsProGestaoReduzido';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";


import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function App() {
  const { isLoggedIn, username, login, logout } = useLogin();
  const [selectedTerritorio, setSelectedTerritorio] = useState("Todos");
  const [selectedMunicipio, setSelectedMunicipio] = useState("Todos");
  const [selectedNucleo, setSelectedNucleo] = useState("Todos");
  const [showCharts] = useState(true);
  const [activeView, setActiveView] = useState('painel1');
  const [selectedUnidade, setSelectedUnidade] = useState("Todos");
  



  const handleBuscarCerurbDados = () => { /* ... */ };
  const handleBuscarNGEODados = () => { /* ... */ };

  
useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, [selectedTerritorio, selectedMunicipio, selectedNucleo, selectedUnidade]);

  useEffect(() => {
    setSelectedMunicipio("Todos");
    setSelectedNucleo("Todos");
    setSelectedUnidade("Todos"); // Adicionado reset
  }, [selectedTerritorio]);

  useEffect(() => {
    setSelectedNucleo("Todos");
    setSelectedUnidade("Todos"); // Adicionado reset
  }, [selectedMunicipio]);

  useEffect(() => {
    setSelectedNucleo("Todos");
    setSelectedUnidade("Todos"); // Adicionado reset ao trocar painel
  }, [activeView]);




  const [layersVisibility, setLayersVisibility] = useState({
    lotes: true,
    quadras: true,
    nucleos: true,
    municipios: true,
    territorios: true
  });


  const {
lotes,
    quadras,
    nucleosFiltrados,
    municipiosMap,
    nucleos,
    territorios,
    territoriosOptions,
    municipiosFiltrados,
    unidadesOptions, // <-- NOVA LISTA VINDA DO HOOK

    filteredBounds,


    progestaoData, // <-- DADOS FILTRADOS PARA O PAINEL 5 OU AFINS
    loading: loadingPainel1,

    

  } = useNucleoFilters(selectedTerritorio, selectedMunicipio, selectedNucleo,selectedUnidade,activeView);


  
  const isAppLoading = loadingPainel1  ;


  
  const [mapKey, setMapKey] = useState(0);
  const boundsKey = `${activeView}-${selectedTerritorio}-${selectedMunicipio}-${selectedNucleo}-${selectedUnidade}`;
  
  useEffect(() => {
    // Incrementa mapKey para recriar o MapContainer apenas em casos críticos de redimensionamento
    // Para movimentos de câmera, usamos a prop boundsKey internamente no componente
    setMapKey(prevKey => prevKey + 1);
  }, [showCharts]);

  // const handleSaveControleRow = async (updatedRow) => {
  //   try {
  //       const API_URL = process.env.REACT_APP_API_URL;
  //       const API_KEY = process.env.REACT_APP_API_KEY;

  //       // Envia para o Backend
  //       await axios.put(`${API_URL}/api/planilha-controle/${updatedRow.id}`, updatedRow, {
  //           headers: { Authorization: `Bearer ${API_KEY}` }
  //       });

  //       alert("Linha atualizada com sucesso!");
        
  //       // Opcional: Recarregar a página para ver os dados atualizados
  //       // window.location.reload(); 
        
  //   } catch (error) {
  //       console.error("Erro ao salvar:", error);
  //       alert("Erro ao salvar alterações no servidor.");
  //   }
  // };

  // const handleSavePlanilhaRow = async (updatedRow) => {
  //   try {
  //       const API_URL = process.env.REACT_APP_API_URL;
  //       const API_KEY = process.env.REACT_APP_API_KEY;

  //       if (!updatedRow.id) {
  //            alert("Erro: ID da linha não encontrado. (Planilha casalegal)");
  //            return;
  //       }

  //       // Envia para o novo endpoint que criamos (/api/planilha-cerurb/:id)
  //       await axios.put(`${API_URL}/api/planilha-casalegal/${updatedRow.id}`, updatedRow, {
  //           headers: { Authorization: `Bearer ${API_KEY}` }
  //       });

  //       alert("Sucesso! Linha atualizada na Planilha CERURB.");
        
  //   } catch (error) {
  //       console.error("Erro ao salvar Planilha CERURB:", error);
  //       if (error.response) {
  //            alert(`Erro do Servidor: ${error.response.data.message || "Falha desconhecida"}`);
  //       } else {
  //            alert("Erro de conexão ao salvar.");
  //       }
  //   }
  // };

  if (!isLoggedIn) return <LoginForm onLogin={login} />;

  
  return (
    <div className="dashboard" style={{
        display: "flex",  
        height: "100vh",
        width: "100vw",
        background: "#f5f5f5"
      }}>
      {/* Sidebar (filtros + cards) */}
      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "10px",
        // overflowY: "auto",
        display: "flex",
        gap: "10px",
        borderRight: "1px solid #ddd"
      }}>
        <div style={{ display: "flex", flexDirection: "column",  maxWidth: "600px" }}>
          <FilterControls
            onBuscarResumoSPI={handleBuscarCerurbDados}
            onBuscarNGEODados={handleBuscarNGEODados}
            username={username}
            handleLogout={logout}

            selectedTerritorio={selectedTerritorio}
            setSelectedTerritorio={setSelectedTerritorio}
            territoriosOptions={territoriosOptions}

            selectedMunicipio={selectedMunicipio}
            setSelectedMunicipio={setSelectedMunicipio}
            municipiosFiltrados={municipiosFiltrados}
            selectedNucleo={selectedNucleo}
            setSelectedNucleo={setSelectedNucleo}

            nucleos={nucleos} // <-- Lista para Painel 1

            activeView={activeView}


            layersVisibility={layersVisibility}
            setLayersVisibility={setLayersVisibility}
            lotes={lotes}
            quadras={quadras}
            municipios={municipiosMap}
            nucleosFiltrados={nucleosFiltrados}
            territorios={territorios}

            selectedUnidade={selectedUnidade}
            setSelectedUnidade={setSelectedUnidade}
            unidadesOptions={unidadesOptions}
          />
          
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{
              width: "450px",
              background: "#fff",
              padding: 4,
              marginTop: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}>
              {isAppLoading  ? (
                <p style={{ fontSize: 14, color: "#888", height: "200px" }}>Carregando dados...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                

                  <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />

                  {/*  RENDERIZAÇÃO CONDICIONAL PARA OS PAINÉIS */}
                  {activeView === 'painel1' && (
                  <PainelPrincipal
                          loading={isAppLoading}
                          progestaoData={progestaoData} // Dados filtrados vindos do useNucleoFilters
                          resumoProgestao={progestaoData} // Objeto com total_imoveis e area_total
                      />
                  )}




                </div>
              )}
            </div>
          </div>
        
        </div>
          
        <div style={{
          width: showCharts ? 520 : 20,
          height: "100vh",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "row",
        }}>
          <div style={{  display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* <button
              onClick={() => {
                setShowCharts((prev) => !prev);
                setTimeout(() => {
                  setMapKey((prev) => prev + 1); // força recriação do mapa
                }, 300); 
              }}
              style={{
                display: "flex",
                margin: 5,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                cursor: "pointer",
                alignItems: "center",
                height: 32
                
              }}
          >

            {showCharts ? "<" : ">"}
          </button> */}
          </div>

          

          {showCharts && (
            <>
              <div style={{  
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(550px, 5fr))",
                alignContent: "center",
              }}>
                {/* <label style={{ fontWeight: "bold", fontSize: "14px", margin: "5px 0" }}>
                  Gráficos
                </label> */}
                
                {/* 4. RENDERIZAÇÃO CONDICIONAL PARA OS GRÁFICOS */}
                {activeView === 'painel1' && (
                  <div style={{ width: "100%" }}>
                        <ChartsProGestaoReduzido 
                                data={progestaoData} 
                                loading={isAppLoading} 
                            />
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ display: "flex", flex: 1, 
            width: "100%",
            padding: 20,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <MapComponent
          key={`map-${mapKey}`}
          boundsKey={boundsKey}
          lotes={lotes}
          nucleos={nucleosFiltrados}
          quadras={quadras}
          territorios={territorios}
          municipios={municipiosMap}
          bounds={filteredBounds}
          layers={layersVisibility}
          progestaoData={progestaoData}
        />
      </div>
    </div>
  );
}

export default App;