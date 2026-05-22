import { useState, useEffect } from "react";

export default function MiPerfil() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { window.location.href = "/login"; return; }
    setUser(JSON.parse(stored));
  }, []);

  function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/login";
  }

  if (!user) return null;

  const rolLabel = { viajero: "🧳 Viajero", guia: "🗺️ Guía local", admin: "🛡️ Admin" };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 20 }}>🌄</span>
          <div>
            <h1 style={styles.headerTitle}>Turismo Local</h1>
            <p style={styles.headerSub}>Mi perfil</p>
          </div>
        </div>
        <button onClick={cerrarSesion} style={styles.logoutBtn}>
          🚪 Cerrar sesión
        </button>
      </div>

      <div style={styles.container}>
        {/* Tarjeta de perfil */}
        <div style={styles.card}>
          <div style={styles.avatarBox}>
            <div style={styles.avatar}>
              {user.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={styles.userName}>{user.nombre}</h2>
              <span style={styles.rolBadge}>{rolLabel[user.rol] || user.rol}</span>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Datos de solo lectura */}
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Información de la cuenta</h3>
            <p style={styles.readonlyNote}>
              🔒 Tus datos son de solo lectura. Contacta al administrador para realizar cambios.
            </p>

            {[
              { label: "Nombre completo", value: user.nombre, icon: "👤" },
              { label: "Correo electrónico", value: user.email, icon: "✉️" },
              { label: "Tipo de cuenta", value: rolLabel[user.rol] || user.rol, icon: "🎫" },
            ].map((item) => (
              <div key={item.label} style={styles.dataRow}>
                <span style={styles.dataIcon}>{item.icon}</span>
                <div>
                  <p style={styles.dataLabel}>{item.label}</p>
                  <p style={styles.dataValue}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info de permisos */}
        <div style={styles.permsCard}>
          <h3 style={styles.permsTitle}>¿Qué puedes hacer?</h3>
          <div style={styles.permsList}>
            {[
              { icon: "✅", text: "Ver experiencias turísticas disponibles" },
              { icon: "✅", text: "Reservar actividades" },
              { icon: "✅", text: "Ver tu historial de reservas" },
              { icon: "✅", text: "Dejar reseñas y calificaciones" },
              { icon: "❌", text: "Gestionar otros usuarios (solo admin)" },
              { icon: "❌", text: "Crear o eliminar experiencias (solo admin)" },
            ].map((p, i) => (
              <div key={i} style={styles.permItem}>
                <span>{p.icon}</span>
                <span style={{ color: p.icon === "✅" ? "#374151" : "#94a3b8" }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header: {
    background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
    padding: "1rem 2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 },
  headerSub: { fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", margin: 0 },
  logoutBtn: {
    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff", borderRadius: 8, padding: "0.45rem 1rem",
    cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
  },
  container: { maxWidth: 560, margin: "0 auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  card: {
    background: "#fff", borderRadius: 18,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    padding: "1.75rem",
  },
  avatarBox: { display: "flex", alignItems: "center", gap: 16, marginBottom: "1.25rem" },
  avatar: {
    width: 62, height: 62, borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.6rem", fontWeight: 700, color: "#fff",
    boxShadow: "0 4px 14px rgba(37,99,235,0.28)",
  },
  userName: { fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px" },
  rolBadge: {
    display: "inline-block", background: "#eff6ff", color: "#2563eb",
    borderRadius: 20, padding: "0.2rem 0.75rem", fontSize: "0.8rem", fontWeight: 600,
  },
  divider: { height: 1, background: "#f1f5f9", margin: "0 0 1.25rem" },
  infoSection: {},
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.5rem" },
  readonlyNote: {
    background: "#fefce8", border: "1px solid #fde68a", color: "#92400e",
    borderRadius: 8, padding: "0.6rem 0.85rem", fontSize: "0.82rem", marginBottom: "1rem",
  },
  dataRow: {
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "0.75rem 0", borderBottom: "1px solid #f8fafc",
  },
  dataIcon: { fontSize: 18, marginTop: 2 },
  dataLabel: { fontSize: "0.76rem", color: "#94a3b8", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  dataValue: { fontSize: "0.92rem", color: "#1e293b", margin: 0, fontWeight: 500 },
  permsCard: {
    background: "#fff", borderRadius: 18,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    padding: "1.5rem 1.75rem",
  },
  permsTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 1rem" },
  permsList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  permItem: { display: "flex", alignItems: "center", gap: 10, fontSize: "0.875rem" },
};
