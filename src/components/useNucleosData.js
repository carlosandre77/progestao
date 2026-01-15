// import { useEffect, useState } from "react";
// import axios from "axios";

// const normalizeString = (s) =>
//   s ? s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim().replace(/\s+/g, " ") : "";

// function useNucleosData(selectedMunicipio, selectedNucleo, refreshInterval = 600000) {
//   const [nucleosExternos, setNucleosExternos] = useState([]);
//   const [contagens, setContagens] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let intervalId;
//     const API_KEY = process.env.REACT_APP_API_KEY;
//     const authHeaders = {
//       headers:{
//         Authorization:`Bearer ${API_KEY}`        
//       }
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         let response;
//         try {
//           response = await axios.get(`${process.env.REACT_APP_API_URL}/api/nucleos-externos`,authHeaders);
//         } catch (primaryError) {
//           console.warn("Primary API route failed, trying fallback route:", primaryError);
//           response = await axios.get(`${process.env.REACT_APP_API_URL}/api/nucleos-externos-locais`,authHeaders);
          
//           const processedData = response.data.data.features.map(feature => ({
//             id: feature.properties.id,
//             nome: feature.properties.nome,
//             cidadeNucleo: feature.properties.cidadeNucleo,
//             quantidadeImovelStatus: feature.properties.quantidadeImovelStatus,
//             somaTodosStatus: feature.properties.somaTodosStatus,
//             totalVetorizados: feature.properties.totalVetorizados
//           }));
//           response.data = processedData;
//         }

//         const data = response.data.map(item => ({
//           ...item,
//           cidade_normalizada: normalizeString(item.cidadeNucleo),
//           nucleo_normalizado: normalizeString(item.nome)
//         }));
        
//         setNucleosExternos(data);
//       } catch (error) {
//         console.error("Error loading data from both API routes:", error);
//         setNucleosExternos([]);
//         setContagens({});
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();

//     if (refreshInterval > 0) {
//       intervalId = setInterval(fetchData, refreshInterval);
//     }

//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, [refreshInterval]);

//   useEffect(() => {
//     const newContagens = {};
    
//     const filteredData = nucleosExternos.filter(item => {
//       const matchesMunicipio = !selectedMunicipio || item.cidade_normalizada.includes(normalizeString(selectedMunicipio));
//       const matchesNucleo = !selectedNucleo || item.nucleo_normalizado.includes(normalizeString(selectedNucleo));
//       return matchesMunicipio && matchesNucleo;
//     });
    
//     filteredData.forEach(item => {
//       newContagens[item.nome] = item.quantidadeImovelStatus;
//     });
    
//     setContagens(newContagens);
//   }, [nucleosExternos, selectedMunicipio, selectedNucleo]);


//   return { nucleosExternos, contagens, loading };
// }

// export default useNucleosData;