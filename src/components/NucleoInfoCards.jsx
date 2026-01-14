
const NucleoInfoCards = ({ contagens = {}, totalVetorizados }) => {

  const entries = Object.entries(contagens);
  

  

  return (
    <div style={{ maxWidth:500 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "8px",
        overflow: "hidden",
      }}>

      {totalVetorizados != null && (
        <div style={{
          backgroundColor: "#f5f5f5",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          fontSize: "18px",
        }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            Total Vetorizado
          </div>
          <div>{totalVetorizados}</div>
        </div>
      )}

        {entries.map(([chave, valor]) => (
          <div key={chave} style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            fontSize: "18px",
          }}>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
              {chave.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div>{valor}</div>
          </div>
        ))}


      </div>
    </div>
  );
};

export default NucleoInfoCards;