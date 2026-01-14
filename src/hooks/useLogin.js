// src/hooks/useLogin.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios"; // 1. Importe o axios

const BACKEND_URL = process.env.REACT_APP_API_URL;

export function useLogin() {


    const [isLoggedIn, setIsLoggedIn] = useState(true);
    
    // 2. Definimos um usuário padrão para evitar erros de undefined nos componentes
    const [user, setUser] = useState({
      username: "admin_user",
      role: "29092025"
    });


  // Adiciona um estado de 'carregando' para evitar piscar a tela
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // 2. Transforma o useEffect em uma função async
    const verifyToken = async () => {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setIsLoading(false);
        return; // Não há token, não está logado
      }

      try {
        // 3. Tenta validar o token com o backend
        const response = await axios.get(`${BACKEND_URL}/user_api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // 4. Se funcionar, o token é válido. Pega os dados do usuário da resposta.
        const userData = response.data.user; 
        
        // (Opcional) Sincroniza o localStorage com os dados frescos do backend
        localStorage.setItem("authUser", JSON.stringify(userData)); 

        setIsLoggedIn(true);
        setUser(userData);

      } catch (error) {
        // 5. Se falhar (401, 403, etc), o token é inválido!
        // Limpa o localStorage e desloga.
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        // 6. Termina o carregamento
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []); // Ainda roda só uma vez

  const login = useCallback((userData) => {
    // O LoginForm já salvou no localStorage
    setIsLoggedIn(true);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // Retorna o isLoading para o App.js poder exibir um "Carregando..."
  return { isLoggedIn, user, login, logout, isLoading }; 
}