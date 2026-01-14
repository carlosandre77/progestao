import React, { useState } from "react";
import axios from "axios";
import '../App.css'; // Supondo que App.css contenha seus estilos de login

const BACKEND_URL = process.env.REACT_APP_API_URL 


const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();


        try {

            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                username,
                password,
                rememberMe,
            });

            const { token, user } = response.data;
            
            // Armazena o token e os dados do usuário no localStorage
            localStorage.setItem("authToken", token);
            localStorage.setItem("authUser", JSON.stringify(user));

            setError("");
            // CORREÇÃO: Chama a função de login passando as strings username e role separadamente,
            // prevenindo o erro "Objects are not valid as a React child" no componente pai.
            onLogin(user.username, user.role); 

        } catch (err) {

            
            // Trata erros de login (ex: 401 Credenciais inválidas)
            const errorMessage = err.response?.data?.error || "Ocorreu um erro desconhecido. Verifique a conexão com o servidor.";
            setError(errorMessage);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Login</h2>
                <input
                    className="login-input"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ marginRight: '10px' }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: '14px', color: '#555' }}>Manter conectado</label>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button className="login-button" type="submit">
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
