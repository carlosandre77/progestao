// src/hooks/useGoogleMaps.js
import { useEffect, useState } from "react";

export default function useGoogleMaps(apiKey) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Se já está disponível
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    // Verifica se o script já foi inserido
    const existingScript = document.querySelector("script[src*='maps.googleapis']");
    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        setLoaded(true);
      } else {
        existingScript.addEventListener("load", () => setLoaded(true));
      }
      return;
    }

    // Cria novo script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-loaded", "false");

    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      setLoaded(true);
    };

    script.onerror = () => {
      console.error("Erro ao carregar a Google Maps API");
    };

    document.head.appendChild(script);
  }, [apiKey]);

  return loaded;
}
