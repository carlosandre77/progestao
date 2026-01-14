// src/components/ProGestaoTable.js
import React from 'react';

const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '11px' };
const thStyle = { border: '1px solid #ddd', padding: '6px', backgroundColor: '#f2f2f2', textAlign: 'left', position: 'sticky', top: 0 };
const tdStyle = { border: '1px solid #ddd', padding: '6px' };

const ProGestaoTable = ({ data }) => {
    if (!data || data.length === 0) return <p>Nenhum imóvel encontrado.</p>;

    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #ccc' }}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Unidade</th>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Bairro</th>
                        <th style={thStyle}>Município</th>
                        <th style={thStyle}>Área Const. (m²)</th>
                        <th style={thStyle}>Matrícula</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                            <td style={tdStyle}><strong>{item.unidade}</strong></td>
                            <td style={tdStyle}>{item.tipo_unidade}</td>
                            <td style={tdStyle}>{item.bairro}</td>
                            <td style={tdStyle}>{item.municipio || item.localizacao}</td>
                            <td style={tdStyle}>{item.area_construida}</td>
                            <td style={tdStyle}>{item.matricula}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProGestaoTable;