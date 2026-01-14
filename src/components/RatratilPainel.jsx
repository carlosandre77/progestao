import React, { useState } from "react";

const PainelRetratil = ({ titulo, children, defaultOpen = true }) => {
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <div
      style={{
        // border: "1px solid #ccc",
        marginBottom: "12px",
        backgroundColor: "#f9f9f9",
        margin:'0px',
        padding:'0px',

      }}
    >
      <div
        onClick={() => setAberto(!aberto)}
        style={{
          padding: "10px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#eee",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <strong>{titulo}</strong>
        <div style={{ fontSize: "8px"  ,color: "#999" }}>{aberto ? "▲" : "▼"}</div>
      </div>

      {aberto && <div style={{ padding: "0px"}}>{children}</div>}
    </div>
  );
};

export default PainelRetratil;
