// /hooks/useAtividadesGeo.js

import { useState, useEffect } from 'react';
import axios from 'axios';

// O hook agora recebe os filtros como argumentos
export const useAtividadesGeo = (selectedTerritorio, selectedMunicipio) => {
  const [atividadesData, setAtividadesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    const API_KEY = process.env.REACT_APP_API_KEY;
    const authHeaders = { headers: { Authorization: `Bearer ${API_KEY}` } };

    const fetchData = async () => {
      setLoading(true);
      try {
        // Constrói a URL com os parâmetros de filtro
        const params = new URLSearchParams({
            territorio: selectedTerritorio,
            municipio: selectedMunicipio
        });
        
        const response = await axios.get(`${API_URL}/api/atividades-geo-resumo?${params.toString()}`, authHeaders);
        
        setAtividadesData(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados de atividades GEO:", err);
        setError(err.message || 'Falha ao buscar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // O hook agora depende dos filtros e será executado novamente sempre que eles mudarem
  }, [selectedTerritorio, selectedMunicipio]);

  return { atividadesData, loading, error };
};