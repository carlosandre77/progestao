import React from 'react';

const ViewSwitcher = ({ activeView, setActiveView }) => {
  const buttonStyle = (view) => ({
    padding: '8px 16px',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: activeView === view ? '#1976d2' : '#e0e0e0',
    color: activeView === view ? 'white' : 'black',
    fontWeight: activeView === view ? 'bold' : 'normal',
    transition: 'background-color 0.3s ease',
  });

  return (
    <div style={{ display: 'flex', marginBottom: '10px', width: '100%', boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <button 
        style={{ ...buttonStyle('painel1'), borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }} 
        onClick={() => setActiveView('painel1')}
      >
        Painel Principal
      </button>
      {/* <button 
        style={{ ...buttonStyle('painel2'), borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} 
        onClick={() => setActiveView('painel2')}
      >
        Dados CERURB GOV
      </button>
      <button 
        style={{ ...buttonStyle('painel3'), borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} 
        onClick={() => setActiveView('painel3')}
      >
        Atividades GEO - 2025
      </button>
      <button 
        style={{ ...buttonStyle('painel4'), borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} 
        onClick={() => setActiveView('painel4')}
      >
        Informações NGEO
      </button> */}
    </div>
  );
};

export default ViewSwitcher;