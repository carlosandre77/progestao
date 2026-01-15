import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { normalizeString } from "../utils/string";
import { getBoundsFromGeometry } from "../utils/getBoundsFromGeometry";

// Helper para encapsular a busca de todos os dados do Backend
const fetchAllData = async () => {
    const API_KEY = process.env.REACT_APP_API_KEY;
    const API_URL = process.env.REACT_APP_API_URL;
    const authHeaders = { headers: { Authorization: `Bearer ${API_KEY}` } };

    const [geoJsonRes, planilhaRes, resumoRes, controleRes, progestaoRes] = await Promise.all([
        axios.get(`${API_URL}/api/dados_separados`, authHeaders),
        axios.get(`${API_URL}/api/planilha-cerurb`, authHeaders),
        axios.get(`${API_URL}/api/planilha-resumo`, authHeaders),
        axios.get(`${API_URL}/api/planilha-controle`, authHeaders),
        axios.get(`${API_URL}/api/imoveis-progestao`, authHeaders)
    ]);

    // Pré-processa os dados geográficos (Camadas do Mapa)
    const features = (geoJsonRes.data.features || []).map(f => ({
        ...f,
        properties: {
            ...f.properties,
            municipio_normalizado: normalizeString(f.properties.MUNICIPIO),
            nucleo_normalizado: normalizeString(f.properties.NUCLEO),
            nm_cerurb_normalizado: normalizeString(f.properties.NM_CERURB || ""),
            territorio_normalizado: normalizeString(f.properties.TERRITORIO || "")
        }
    }));

    return { 
        features, 
        planilhaData: planilhaRes.data.data || [], 
        planilhaControleData: controleRes.data.data || [],
        estatisticasPlanilha: resumoRes.data.estatisticas || {}, 
        progestaoData: progestaoRes.data.data || [] 
    };
};

export function useNucleoFilters(selectedTerritorio, selectedMunicipio, selectedNucleo, selectedUnidade, nucleosExternos, activeView) {
    const [allData, setAllData] = useState({ 
        features: [], 
        planilhaData: [], 
        planilhaControleData: [],
        estatisticasPlanilha: {},
        progestaoData: []
    });
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efeito de carga inicial
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await fetchAllData();
                setAllData(data);
                setError(null);
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const { features, planilhaData, planilhaControleData, progestaoData, estatisticasPlanilha } = allData;

    // --- 1. Mapeamentos e Opções de Seleção (Dinamismo dos Filtros) ---

    const municipioToTerritorioMap = useMemo(() => {
        const map = {};
        features.forEach(f => {
            const m = f.properties.municipio_normalizado;
            const t = f.properties.territorio_normalizado;
            if (m && t && !map[m]) map[m] = t;
        });
        return map;
    }, [features]);

    const territoriosOptions = useMemo(() => {
        const unique = new Set(features.map(f => f.properties.TERRITORIO).filter(Boolean));
        return ["Todos", ...Array.from(unique).sort()];
    }, [features]);

    const municipiosFiltrados = useMemo(() => {
        // 1. Pega os dados do Pró-Gestão (onde estão as unidades administrativas)
        const dataArr = Array.isArray(progestaoData) ? progestaoData : [];
        
        const tNorm = normalizeString(selectedTerritorio);
        const isTAll = selectedTerritorio === "Todos";

        // 2. Filtra os dados pelo Território selecionado
        const filtradosPorTerritorio = dataArr.filter(item => {
            const itemT = normalizeString(item.territorio || "");
            return isTAll || itemT === tNorm;
        });

        // 3. Extrai apenas os nomes dos municípios que aparecem nesses dados
        const uniqueMunicipios = new Set(
            filtradosPorTerritorio
                .map(item => item.municipio || item.localizacao)
                .filter(Boolean)
        );

        // 4. Retorna a lista ordenada com o "Todos"
        return ["Todos", ...Array.from(uniqueMunicipios).sort()];
    }, [progestaoData, selectedTerritorio]);


    // Opções de Unidade Administrativa baseada no Município/Território
    const unidadesOptions = useMemo(() => {
        const dataArr = Array.isArray(progestaoData) ? progestaoData : [];
        const tNorm = normalizeString(selectedTerritorio);
        const mNorm = normalizeString(selectedMunicipio);
        
        const filtered = dataArr.filter(item => {
            const itemT = normalizeString(item.territorio || "");
            const itemM = normalizeString(item.municipio || item.localizacao || "");
            return (selectedTerritorio === "Todos" || itemT === tNorm) && 
                   (selectedMunicipio === "Todos" || itemM === mNorm);
        });

        const unique = new Set(filtered.map(i => i.unidade || i.tipo_unidade).filter(Boolean));
        return ["Todos", ...Array.from(unique).sort()];
    }, [progestaoData, selectedTerritorio, selectedMunicipio]);
    

    const nucleos = useMemo(() => {
        const mNorm = normalizeString(selectedMunicipio);
        const allNucleos = features.filter(f => f.properties.TIPO?.toLowerCase() === "nucleo");
        const filtered = (selectedMunicipio === "Todos")
            ? allNucleos
            : allNucleos.filter(f => f.properties.municipio_normalizado === mNorm);
        
        const nomes = filtered.map(f => f.properties.NUCLEO);
        return ["Todos", ...Array.from(new Set(nomes.filter(Boolean))).sort()];
    }, [features, selectedMunicipio]);

    // --- 2. Lógica de Filtragem de Dados ---

    const filteredData = useMemo(() => {
        const tNorm = normalizeString(selectedTerritorio);
        const mNorm = normalizeString(selectedMunicipio);
        const nNorm = normalizeString(selectedNucleo);
        const uNorm = normalizeString(selectedUnidade);
        const isTAll = selectedTerritorio === "Todos";
        const isMAll = selectedMunicipio === "Todos";
        const isNAll = selectedNucleo === "Todos";
        const isUAll = selectedUnidade === "Todos";

        // Filtro Pró-Gestão
        const progestaoFiltrados = (Array.isArray(progestaoData) ? progestaoData : []).filter(item => {
            const itemT = normalizeString(item.territorio || "");
            const itemM = normalizeString(item.municipio || item.localizacao || "");
            const itemB = normalizeString(item.bairro || "");
            const itemU = normalizeString(item.unidade || item.tipo_unidade || "");

            return (isTAll || itemT === tNorm) && 
                   (isMAll || itemM === mNorm) && 
                   (isUAll || itemU === uNorm) && 
                   (isNAll || itemB === nNorm);
        });

        // Filtro GeoJSON (Mapa)
        const filteredFeatures = features.filter(f => {
            const itemM = f.properties.municipio_normalizado;
            const itemT = municipioToTerritorioMap[itemM] || f.properties.territorio_normalizado;
            if (!(isTAll || itemT === tNorm)) return false;
            if (!(isMAll || itemM === mNorm)) return false;
            if (!isNAll) {
                return (activeView === 'painel2')
                    ? f.properties.nm_cerurb_normalizado === nNorm
                    : f.properties.nucleo_normalizado === nNorm;
            }
            return true;
        });

        // Filtro Planilha Controle (SPI)
        const dadoscontroleFiltrados = planilhaControleData.filter(item => {
            const itemM = normalizeString(item.municipio || item.MUNICIPIO || "");
            const itemT = municipioToTerritorioMap[itemM] || normalizeString(item.territorio || "");
            return (isTAll || itemT === tNorm) && 
                   (isMAll || itemM === mNorm) && 
                   (isNAll || normalizeString(item.nucleo) === nNorm);
        });

        // Filtro Planilha Cerurb
        const planilhaFiltrada = planilhaData.filter(item => {
            const itemM = normalizeString(item.municipio);
            const itemT = municipioToTerritorioMap[itemM] || "";
            return (isTAll || itemT === tNorm) && 
                   (isMAll || itemM === mNorm) && 
                   (isNAll || normalizeString(item.nucleo) === nNorm);
        });

        // Filtro Núcleos Externos (SPI) - Proteção contra erro de .filter
        const nucleosExternosFiltrados = (Array.isArray(nucleosExternos) ? nucleosExternos : []).filter(n => {
            const itemMNorm = normalizeString(n.cidadeNucleo || "");
            return (isMAll || itemMNorm === mNorm) && 
                (isNAll || normalizeString(n.nome || "") === nNorm);
        });

        return { 
            filteredFeatures, 
            planilhaFiltrada, 
            nucleosExternosFiltrados, 
            dadoscontroleFiltrados, 
            progestaoFiltrados 
        };
    }, [features, planilhaData, planilhaControleData, progestaoData, nucleosExternos, selectedTerritorio, selectedMunicipio, selectedNucleo, selectedUnidade, municipioToTerritorioMap, activeView]);

    const { filteredFeatures, planilhaFiltrada, nucleosExternosFiltrados, dadoscontroleFiltrados, progestaoFiltrados } = filteredData;

    // --- 3. Cálculos de Resumo (Cards e Gráficos) ---

    const resumoProgestao = useMemo(() => {
        return progestaoFiltrados.reduce((acc, item) => {
            acc.total_imoveis += 1;
            // Converte string de área (ex: "1.200,50") para número float tratável
            const areaStr = String(item.area_construida || "0").replace(/\./g, '').replace(',', '.');
            const area = parseFloat(areaStr);
            acc.area_total_construida += isNaN(area) ? 0 : area;
            return acc;
        }, { total_imoveis: 0, area_total_construida: 0 });
    }, [progestaoFiltrados]);

    const resumoPlanilha = useMemo(() => {
        return planilhaFiltrada.reduce((acc, item) => {
            acc.total_nucleos += 1;
            acc.total_unidades += Number(item.quantidade_unidades_total) || 0;
            acc.total_unidades_sentenca += Number(item.quantidade_unidades_sentenca) || 0;
            acc.total_registros_emitidos += Number(item.total_registros_emitidos) || 0;
            acc.enviados_cartorio += Number(item.enviados_cartorio) || 0;
            acc.emitidos_central += Number(item.emitidos_central) || 0;
            return acc;
        }, { total_nucleos: 0, total_unidades: 0, total_unidades_sentenca: 0, total_registros_emitidos: 0, enviados_cartorio: 0, emitidos_central: 0 });
    }, [planilhaFiltrada]);

    const resumoSPI = useMemo(() => {
        const counts = { totalLotes: 0, totalQuadras: 0, totalNucleos: 0 };
        const municipiosSet = new Set();
        filteredFeatures.forEach(f => {
            const tipo = f.properties.TIPO?.toLowerCase();
            if (tipo === "lote") counts.totalLotes++;
            else if (tipo === "quadra") counts.totalQuadras++;
            else if (tipo === "nucleo") {
                counts.totalNucleos++;
                if (f.properties.MUNICIPIO) municipiosSet.add(f.properties.MUNICIPIO);
            }
        });
        return { ...counts, municipiosComNucleos: municipiosSet.size };
    }, [filteredFeatures]);

    const statusCounts = useMemo(() => {
        return nucleosExternosFiltrados.reduce((acc, n) => {
            const status = n.quantidadeImovelStatus || {};
            for (const [key, value] of Object.entries(status)) {
                acc[key] = (acc[key] || 0) + value;
            }
            return acc;
        }, {});
    }, [nucleosExternosFiltrados]);

        // --- 4. Camadas e Bounds do Mapa ---

    const filteredBounds = useMemo(() => {
        if (loading) return null;

        const tNorm = normalizeString(selectedTerritorio);
        const mNorm = normalizeString(selectedMunicipio);


        // 1. PRIORIDADE MÁXIMA: Unidade Administrativa (Pontos do Pró-Gestão)
        if (selectedUnidade !== "Todos" && progestaoFiltrados.length > 0) {
            let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
            let hasCoords = false;

            progestaoFiltrados.forEach(item => {
                const lat = parseFloat(String(item.latitude).replace(',', '.'));
                const lng = parseFloat(String(item.longitude).replace(',', '.'));
                if (!isNaN(lat) && !isNaN(lng)) {
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);
                    hasCoords = true;
                }
            });

            if (hasCoords) {
                if (minLat === maxLat) return [[minLat - 0.005, minLng - 0.005], [maxLat + 0.005, maxLng + 0.005]];
                return [[minLat, minLng], [maxLat, maxLng]];
            }
        }

        // 2. SEGUNDA PRIORIDADE: Município Selecionado (Polígono)
        if (selectedMunicipio !== "Todos") {
            const munFeature = features.find(f => 
                f.properties.TIPO === "MUNICIPIO" && 
                normalizeString(f.properties.MUNICIPIO) === mNorm
            );
            if (munFeature) return getBoundsFromGeometry(munFeature.geometry);
        }

        // 3. TERCEIRA PRIORIDADE: Território Selecionado (Fit no polígono do território)
        if (selectedTerritorio !== "Todos") {
            const terrFeature = features.find(f => 
                f.properties.TIPO === "TERRITORIO" && 
                normalizeString(f.properties.TERRITORIO) === tNorm
            );
            if (terrFeature) return getBoundsFromGeometry(terrFeature.geometry);
        }

        // 4. FALLBACK: Todas as feições visíveis (Geral do Estado)
        if (features.length > 0) {
            return features.reduce((acc, f) => {
                const b = getBoundsFromGeometry(f.geometry);
                if (!b) return acc;
                if (!acc) return b;
                return [
                    [Math.min(acc[0][0], b[0][0]), Math.min(acc[0][1], b[0][1])],
                    [Math.max(acc[1][0], b[1][0]), Math.max(acc[1][1], b[1][1])]
                ];
            }, null);
        }

        return null;
    }, [selectedTerritorio, selectedMunicipio, selectedUnidade, progestaoFiltrados, features, loading]);


    return {
        loading,
        error,
        features,
        planilhaData: planilhaFiltrada,
        dadoscontroleFiltrados,
        progestaoData: progestaoFiltrados,
        resumoProgestao,
        territoriosOptions,
        municipiosFiltrados,
        unidadesOptions,
        nucleos,
        lotes: selectedNucleo !== "Todos" ? filteredFeatures.filter(f => f.properties.TIPO?.toLowerCase() === "lote") : [],
        quadras: selectedNucleo !== "Todos" ? filteredFeatures.filter(f => f.properties.TIPO?.toLowerCase() === "quadra") : [],
        nucleosFiltrados: filteredFeatures.filter(f => f.properties.TIPO?.toLowerCase() === "nucleo"),
        municipiosMap: features.filter(f => f.properties.TIPO?.toLowerCase() === "municipio"),
        territorios: features.filter(f => f.properties.TIPO?.toLowerCase() === "territorio"),
        statusCounts,
        filteredBounds,
        nucleosExternosFiltrados,
        resumoSPI,
        resumoPlanilha,
        estatisticasPlanilha
    };
}