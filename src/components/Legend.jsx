// components/Legend.jsx
import React, { useState } from 'react'; // Importe o useState
import './styles/Legend.css'; 

/**
 * Componente de Legenda Reutilizável com estado de minimizar
 * @param {object} colors - Objeto de cores (chave: nome, valor: cor)
 * @param {string} title - O título para a caixa da legenda
 */
const Legend = ({ colors, title }) => {
  // --- ADICIONE ESTE ESTADO ---
  // true = minimizado (padrão), false = maximizado
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className="legend-container">
      {/* O header agora contém o título e o botão */}
      <div className="legend-header"
        onClick={() => setIsMinimized(!isMinimized)}
        >
        
        {title && <h4>{title}</h4>}
        <span style={{ fontSize: "6px"  ,color: "#999" }}
          className="legend-minimize-btn"
        >
          {/* Mostra + quando minimizado, – quando maximizado */}
          {isMinimized ? '▲' : '▼'}
        </span>
      </div>

      {/* --- RENDERIZAÇÃO CONDICIONAL --- */}
      {/* Só mostra a lista se NÃO estiver minimizado */}
      {!isMinimized && (
        <ul>
          {Object.entries(colors).map(([name, color]) => (
            <li key={name}>
              <span 
                className="legend-color-box" 
                style={{ backgroundColor: color }}
              ></span>
              {name === 'DEFAULT' ? 'Outros / Padrão' : name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Legend;