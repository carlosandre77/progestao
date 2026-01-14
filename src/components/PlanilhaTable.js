// src/components/PlanilhaTable.js
import React, { useState } from 'react';

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
    verticalAlign: 'middle', // Ajustado para alinhar inputs
    fontSize: '10px',
};

const containerStyle = {
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
};

const inputStyle = {
    width: '100%',
    padding: '2px',
    fontSize: '10px', // Ajustado para bater com a tabela
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '2px'
};

const PlanilhaTable = ({ data, onSaveRow }) => {
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // --- LÓGICA DE EDIÇÃO ---

    const handleEditClick = (event, row) => {
        event.preventDefault();
        setEditingId(row.id); 
        setEditFormData({ ...row });
    };

    const handleCancelClick = () => {
        setEditingId(null);
    };

    const handleEditFormChange = (event, colName) => {
        const fieldValue = event.target.value;
        const newFormData = { ...editFormData };
        newFormData[colName] = fieldValue;
        setEditFormData(newFormData);
    };

    const handleSaveClick = async () => {
        if (onSaveRow) {
            await onSaveRow(editFormData);
        }
        setEditingId(null);
    };

    // ------------------------

    if (!data || data.length === 0) {
        return <p style={{ fontSize: '8px' }}>Nenhum dado da planilha disponível.</p>;
    }

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...thStyle, width: '60px' }}>Ações</th>
                        <th style={thStyle}>Núcleo</th>
                        <th style={thStyle}>Município</th>
                        <th style={thStyle}>Território</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Qtd. Unidades</th>
                        <th style={thStyle}>Registros Emitidos</th>
                        <th style={thStyle}>Enviados ao Cartório</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const isEditing = editingId === item.id;
                        
                        return (
                            <tr key={item.id || index} style={{ backgroundColor: isEditing ? '#e8f0fe' : (index % 2 === 0 ? '#fff' : '#f9f9f9') }}>
                                
                                {/* COLUNA DE AÇÕES */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button onClick={handleSaveClick} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }} title="Salvar">💾</button>
                                            <button onClick={handleCancelClick} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }} title="Cancelar">❌</button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => handleEditClick(e, item)} 
                                            style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: '0', color: '#555' }}
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                            </svg>
                                        </button>
                                    )}
                                </td>

                                {/* CÉLULAS DE DADOS (Com Input Condicional) */}
                                
                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="text" style={inputStyle} value={editFormData.nucleo || ''} onChange={(e) => handleEditFormChange(e, 'nucleo')} />
                                    ) : item.nucleo}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="text" style={inputStyle} value={editFormData.municipio || ''} onChange={(e) => handleEditFormChange(e, 'municipio')} />
                                    ) : item.municipio}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="text" style={inputStyle} value={editFormData.territorio || ''} onChange={(e) => handleEditFormChange(e, 'territorio')} />
                                    ) : item.territorio}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="text" style={inputStyle} value={editFormData.status || ''} onChange={(e) => handleEditFormChange(e, 'status')} />
                                    ) : item.status}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="number" style={inputStyle} value={editFormData.quantidade_unidades_total || 0} onChange={(e) => handleEditFormChange(e, 'quantidade_unidades_total')} />
                                    ) : item.quantidade_unidades_total}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="number" style={inputStyle} value={editFormData.total_registros_emitidos || 0} onChange={(e) => handleEditFormChange(e, 'total_registros_emitidos')} />
                                    ) : item.total_registros_emitidos}
                                </td>

                                <td style={tdStyle}>
                                    {isEditing ? (
                                        <input type="number" style={inputStyle} value={editFormData.enviados_cartorio || 0} onChange={(e) => handleEditFormChange(e, 'enviados_cartorio')} />
                                    ) : item.enviados_cartorio}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PlanilhaTable;