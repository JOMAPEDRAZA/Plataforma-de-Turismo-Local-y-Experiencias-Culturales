import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/experiencias";

export default function Experiencias() {
  const [experiencias, setExperiencias] = useState([]);
  const [categoria, setCategoria] = useState("todas");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    cargar();
  }, [categoria]);

  async function cargar() {
    setLoading(true);
    try {
      const url = categoria === "todas" ? API : `${API}?categoria=${categoria}`;
      const res = await fetch(url);
      const data = await res.json();
      setExperiencias(data);
    } catch { setExperiencias([]); }
    finally { setLoading(false); }
  }

  function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/login";
  }

  const catColor = {
    tour_turistico: { bg: "#eff6ff", color: "#2563eb", label: "🗺️ Tour Turístico" },
    gastronomia: { bg: "#fff7ed", color: "#d97706", label: "🍽️ Gastronomía" },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 22 }}>🌄</span>
          <div>
            <h1 style={styles.headerTitle}>Turismo Local Sucre</h1>
            <p style={styles.headerSub}>Descubre experiencias únicas</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {user?.rol === "admin" && (
            <a href="/admin/usuarios" style={styles.navBtn}>🛡️ Admin</a>
          )}
          {(user?.rol === "guia_turistico" || user?.rol === "guia_gastronomico") && (
            <a href="/panel-guia" style={styles.navBtn}>📋 Mi Panel</a>
          )}
          <a href="/mi-perfil" style={styles.navBtn}>👤 Mi Perfil</a>
          <button onClick={cerrarSesion} style={styles.logoutBtn}>🚪 Salir</button>
        </div>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>Explora Sucre, Bolivia</h2>
        <p style={styles.heroSub}>Tours culturales, gastronómicos y experiencias únicas</p>
      </div>

      {/* Filtros */}
      <div style={styles.container}>
        <div style={styles.filtros}>
          {[
            { id: "todas", label: "✨ Todas", color: "#7c3aed" },
            { id: "tour_turistico", label: "🗺️ Tours Turísticos", color: "#2563eb" },
            { id: "gastronomia", label: "🍽️ Gastronomía", color: "#d97706" },
          ].map((f) => (
            <button key={f.id} onClick={() => setCategoria(f.id)}
              style={{
                ...styles.filtroBtn,
                background: categoria === f.id ? f.color : "#f8fafc",
                color: categoria === f.id ? "#fff" : "#64748b",
                borderColor: categoria === f.id ? f.color : "#e2e8f0",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid de experiencias */}
        {loading ? (
          <div style={styles.empty}>Cargando experiencias...</div>
        ) : experiencias.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "3rem" }}>🏔️</p>
            <p>No hay experiencias disponibles aún</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {experiencias.map((exp) => (
              <div key={exp.id} style={styles.card}>
                {/* Imagen */}
                <div style={styles.cardImg}>
                  {exp.imagen_url ? (
                    <img src={exp.imagen_url} alt={exp.titulo}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={styles.cardImgPlaceholder}>
                      {exp.categoria === "tour_turistico" ? "🗺️" : "🍽️"}
                    </div>
                  )}
                  <span style={{
                    ...styles.catBadge,
                    background: catColor[exp.categoria]?.bg,
                    color: catColor[exp.categoria]?.color,
                  }}>
                    {catColor[exp.categoria]?.label}
                  </span>
                </div>

                {/* Contenido */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{exp.titulo}</h3>
                  <p style={styles.cardDesc}>{exp.descripcion}</p>

                  <div style={styles.cardMeta}>
                    <span>⏱️ {exp.duracion}h</span>
                    <span>👥 Máx. {exp.capacidad} personas</span>
                    <span>👤 {exp.guia_nombre}</span>
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.precio}>Bs. {exp.precio}</span>
                    {user?.rol === "turista" && (
                      <button style={styles.reservarBtn}>🎫 Reservar</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI',system-ui,sans-serif" },
  header: { background: "linear-gradient(135deg,#1e3a5f,#2563eb)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 },
  headerSub: { fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  navBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", cursor: "pointer" },
  logoutBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  hero: { background: "linear-gradient(135deg,#1e3a5f,#2563eb,#0ea5e9)", padding: "3rem 2rem", textAlign: "center" },
  heroTitle: { fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem", letterSpacing: "-0.02em" },
  heroSub: { fontSize: "1rem", color: "rgba(255,255,255,0.85)", margin: 0 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" },
  filtros: { display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" },
  filtroBtn: { padding: "0.6rem 1.2rem", border: "2px solid", borderRadius: 20, fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  empty: { textAlign: "center", color: "#94a3b8", padding: "4rem", fontSize: "1rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" },
  cardImg: { height: 180, position: "relative", background: "#f1f5f9", overflow: "hidden" },
  cardImgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", background: "linear-gradient(135deg,#f0f4ff,#e0e7ff)" },
  catBadge: { position: "absolute", top: 10, left: 10, padding: "0.25rem 0.7rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 },
  cardBody: { padding: "1.25rem" },
  cardTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" },
  cardDesc: { fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.75rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: 8, fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.75rem" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  precio: { fontSize: "1.1rem", fontWeight: 700, color: "#2563eb" },
  reservarBtn: { background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "#fff", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" },
};
