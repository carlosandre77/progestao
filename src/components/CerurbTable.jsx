// src/components/CerurbTable.js

import React, { useMemo } from 'react';

// Estilos
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    fontSize: '12px',
    margin: '10px',
};
const thStyle = {
    border: '1px solid #ddd',
    padding: '4px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    fontSize: '10px',
};
const tdStyle = {
    border: '1px solid #ddd',
    padding: '4px',
    verticalAlign: 'top',
    fontSize: '10px',
    textAlign: 'center',
};
const containerStyle = {
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
};


const CerurbTable = ({ data }) => {

    // Lógica para "Desempacotar" os Status
    const allStatusNames = useMemo(() => {
        const statusSet = new Set();
        data.forEach(item => {
            if (item.quantidadeImovelStatus) {
                Object.keys(item.quantidadeImovelStatus).forEach(status => {
                    statusSet.add(status);
                });
            }
        });
        return [...statusSet].sort();
    }, [data]); 

    if (!data || data.length === 0) {
        return <p style={{ fontSize: '8px' }}>Nenhum dado da planilha CERURB disponível.</p>;
    }

    // --- [INÍCIO DA CORREÇÃO] ---
    // O JSX abaixo está formatado sem espaços entre as tags 
    // <table>, <thead>, <tbody>, e <tr> para evitar o erro.
    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead>{/* COLADO */}
                    <tr>{/* COLADO */}
                        <th style={{...thStyle, textAlign: 'left'}}>Núcleo</th>
                        <th style={{...thStyle, textAlign: 'left'}}>Município</th>
                        <th style={thStyle}>Total Unid.</th>
                        <th style={thStyle}>Total Vetor.</th>
                        
                        {/* O .map() é JS, não é um nó de texto, então está OK */}
                        {allStatusNames.map(statusName => (
                            <th key={statusName} style={thStyle}>
                                {statusName}
                            </th>
                        ))}
                    </tr>
                </thead>{/* COLADO */}
                <tbody>{/* COLADO */}
                    {/* O .map() é JS, não é um nó de texto, então está OK */}
                    {data.map((item, index) => (
                        <tr key={item.id || index}>{/* COLADO */}
                            <td style={{...tdStyle, textAlign: 'left'}}>{item.nome}</td>
                            <td style={{...tdStyle, textAlign: 'left'}}>{item.cidadeNucleo}</td>
                            <td style={tdStyle}>{item.somaTodosStatus}</td>
                            <td style={tdStyle}>{item.totalVetorizados}</td>

                            {allStatusNames.map(statusName => (
                                <td key={statusName} style={tdStyle}>
                                    {item.quantidadeImovelStatus?.[statusName] || 0}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    // --- [FIM DA CORREÇÃO] ---
};

export default CerurbTable;