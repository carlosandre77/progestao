import React, { useMemo, useState } from 'react';

// Estilos (Mantidos)
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
    fontSize: '11px',
    margin: '10px 0',
};
const thStyle = {
    border: '1px solid #ddd',
    padding: '6px 4px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
    fontWeight: 'bold',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    fontSize: '10px',
    whiteSpace: 'nowrap',
};
const tdStyle = {
    border: '1px solid #ddd',
    padding: '4px',
    verticalAlign: 'middle',
    fontSize: '11px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};
const containerStyle = {
    maxHeight: '500px',
    overflow: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
};
const inputStyle = {
    width: '100%',
    padding: '2px',
    fontSize: '11px',
    boxSizing: 'border-box'
};

const ControleTable = ({ data, onSaveRow }) => {
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    // 1. COLUNAS BOLEANAS IDENTIFICADAS: Adicione aqui qualquer outra coluna de status ou sim/não.
    const BOOLEAN_COLUMNS = ['status_vetorizacao', 'status_confrontacao'];

    // Função de formatação (mantida)
    const formatHeader = (key) => {
        let label = key.replace(/_/g, ' ');
        label = label.replace(/\badh\b/gi, 'ADH');
        label = label.replace(/\bbd\b/gi, 'BD');
        label = label.replace(/\bcerurb\b/gi, 'CERURB');
        return label.replace(/\w\S*/g, (txt) => {
            return txt === txt.toUpperCase() && txt.length > 1 ? txt : txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    const columns = useMemo(() => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        // Ignorar chaves técnicas
        const ignoredKeys = ['id','geom', '	Quantidade Lotes','	Quantidade Quadras','geometry', 'municipio_normalizado', 'nucleo_normalizado', 'territorio_normalizado', 'nm_cerurb_normalizado'];
        const filteredKeys = keys.filter(k => !ignoredKeys.includes(k));
        
        // Colunas prioritárias
        const priority = ['nucleo','memoriais', 'responsavel_vetorizacao','status_vetorizacao','responsavel_confrontacao','status_confrontacao'];
        
        return filteredKeys.sort((a, b) => {
            const indexA = priority.indexOf(a.toLowerCase());
            const indexB = priority.indexOf(b.toLowerCase());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [data]);

    // Iniciar edição
    const handleEditClick = (event, row) => {
        event.preventDefault();
        setEditingId(row.id); // Assume que cada linha tem um 'id' único
        setEditFormData({ ...row });
    };

    // Cancelar edição
    const handleCancelClick = () => {
        setEditingId(null);
    };

    // 2. FUNÇÃO MODIFICADA: Agora verifica se é checkbox ou texto.
    const handleEditFormChange = (event, colName) => {
        const target = event.target;
        let fieldValue;

        if (target.type === 'checkbox') {
            // Se for checkbox, o valor é o estado de 'checked' (true ou false)
            fieldValue = target.checked; 
        } else {
            // Se for input de texto, o valor é o texto digitado
            fieldValue = target.value; 
        }

        const newFormData = { ...editFormData };
        newFormData[colName] = fieldValue;
        setEditFormData(newFormData);
    };

    // Salvar
    const handleSaveClick = async () => {
        // Chama a função passada pelo componente pai
        await onSaveRow(editFormData); 
        setEditingId(null);
    };

    // Função para renderizar o valor da célula (para visualização, não edição)
    const renderCellValue = (value) => {
        if (value === true || value === 'TRUE') {
            // Checkmark verde para 'TRUE' / concluído
            return <span style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>✔</span>; 
        }
        if (value === false || value === 'FALSE') {
            // X vermelho para 'FALSE' / pendente
            return <span style={{ color: 'red', fontWeight: 'bold', fontSize: '14px' }}></span>;
        }
        
        // Para todos os outros valores
        return value !== null && value !== undefined ? value.toString() : '-';
    };


    if (!data || data.length === 0) return <p>Sem dados.</p>;

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Ações</th>{columns.map((col) => (
                            <th key={col} style={thStyle}>{formatHeader(col)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const isEditing = editingId === row.id;
                        return (
                            <tr key={row.id || index} style={{ backgroundColor: isEditing ? '#e8f0fe' : (index % 2 === 0 ? '#fff' : '#f9f9f9') }}>
                                <td style={{ ...tdStyle, width: '8px', minWidth: '8px' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                            <button onClick={handleSaveClick} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>💾</button>
                                            <button onClick={handleCancelClick} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>❌</button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => handleEditClick(e, row)} 
                                            style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: '3px', color: '#555' }}
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                            </svg>
                                        </button>
                                    )}
                                </td>{columns.map((col) => {
                                    const value = row[col];
                                    const isEditable = col !== 'id'; // Impede editar ID

                                    return (
                                        <td key={`${index}-${col}`} style={tdStyle}>
                                            {isEditing && isEditable ? (
                                                // 3. RENDERIZAÇÃO CONDICIONAL: Mostra checkbox para colunas booleanas
                                                BOOLEAN_COLUMNS.includes(col) ? (
                                                    <input
                                                        type="checkbox"
                                                        // O estado 'checked' deve refletir o valor atual em edição
                                                        checked={editFormData[col] === true || editFormData[col] === 'TRUE'}
                                                        onChange={(e) => handleEditFormChange(e, col)}
                                                        style={{ width: 'auto', margin: 'auto' }}
                                                    />
                                                ) : (
                                                    // Input de texto para outras colunas
                                                    <input
                                                        type="text"
                                                        style={inputStyle}
                                                        value={editFormData[col] !== null ? editFormData[col] : ''}
                                                        onChange={(e) => handleEditFormChange(e, col)}
                                                    />
                                                )
                                            ) : (
                                                // RENDERIZAÇÃO DE VALOR (Visualização)
                                                renderCellValue(value)
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ControleTable;