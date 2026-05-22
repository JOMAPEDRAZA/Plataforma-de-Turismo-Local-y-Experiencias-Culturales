import { useState, useEffect } from "react";

const API_USERS = "http://localhost:3000/api/users";
const API_EXP = "http://localhost:3000/api/experiencias/todas";

function getToken() { return localStorage.getItem("token"); }

export default function AdminPanel() {
  const [seccion, setSeccion] = useState("dashboard");
  const [usuarios, setUsuarios] = useState([]);
  const [experiencias, setExperiencias] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "turista" });
  const [modalExp, setModalExp] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { cargarUsuarios(); cargarExperiencias(); }, []);

  async function cargarUsuarios() {
    try {
      const res = await fetch(API_USERS, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch { setUsuarios([]); }
  }

  async function cargarExperiencias() {
    try {
      const res = await fetch(API_EXP, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setExperiencias(Array.isArray(data) ? data : []);
    } catch { setExperiencias([]); }
  }

  const turistas = usuarios.filter(u => u.rol === "turista");
  const guias = usuarios.filter(u => ["guia_turistico", "guia_gastronomico", "anfitrion"].includes(u.rol));
  const admins = usuarios.filter(u => u.rol === "admin");
  const pendientes = experiencias.filter(e => e.estado === "pendiente");
  const aprobadas = experiencias.filter(e => e.estado === "aprobada");
  const rechazadas = experiencias.filter(e => e.estado === "rechazada");

  function mostrarMensaje(msg, esError = false) {
    if (esError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  }

  async function guardarUsuario() {
    try {
      let res;
      if (modal === "crear") {
        res = await fetch(API_USERS, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`${API_USERS}/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ nombre: form.nombre, email: form.email, rol: form.rol }),
        });
      }
      const data = await res.json();
      if (!res.ok) { mostrarMensaje(data.message, true); return; }
      mostrarMensaje(modal === "crear" ? "Usuario creado ✓" : "Usuario actualizado ✓");
      setModal(null);
      cargarUsuarios();
    } catch { mostrarMensaje("Error de conexión", true); }
  }

  async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch(`${API_USERS}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    mostrarMensaje("Usuario eliminado ✓");
    cargarUsuarios();
  }

  async function validarExperiencia(id, estado) {
    if (estado === "rechazada" && !motivoRechazo) { mostrarMensaje("Escribe el motivo de rechazo", true); return; }
    const res = await fetch(`http://localhost:3000/api/experiencias/${id}/validar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ estado, motivo_rechazo: motivoRechazo }),
    });
    const data = await res.json();
    mostrarMensaje(data.message);
    setModalExp(null);
    setMotivoRechazo("");
    cargarExperiencias();
  }

  async function eliminarExperiencia(id) {
    if (!confirm("¿Eliminar esta experiencia?")) return;
    await fetch(`http://localhost:3000/api/experiencias/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    mostrarMensaje("Experiencia eliminada ✓");
    cargarExperiencias();
  }

  const rolLabel = { turista: "🧳 Turista", guia_turistico: "🗺️ Guía Turístico", guia_gastronomico: "🍽️ Guía Gastronómico", anfitrion: "🏨 Anfitrión", admin: "🛡️ Admin" };
  const rolColor = { turista: "#2563eb", guia_turistico: "#0891b2", guia_gastronomico: "#d97706", anfitrion: "#059669", admin: "#7c3aed" };

  const menuItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "turistas", icon: "🧳", label: "Turistas", count: turistas.length },
    { id: "guias", icon: "🗺️", label: "Guías y Anfitriones", count: guias.length },
    { id: "admins", icon: "🛡️", label: "Administradores", count: admins.length },
    { id: "experiencias", icon: "✅", label: "Validar Experiencias", count: pendientes.length, alert: pendientes.length > 0 },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontSize: 24 }}>🌄</span>
          <div>
            <div style={styles.sidebarTitle}>Turismo Local</div>
            <div style={styles.sidebarSub}>Panel Admin</div>
          </div>
        </div>
        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setSeccion(item.id)}
              style={{ ...styles.navItem, ...(seccion === item.id ? styles.navItemActive : {}) }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ ...styles.badge, background: item.alert ? "#ef4444" : "#e2e8f0", color: item.alert ? "#fff" : "#64748b" }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={styles.logoutBtn}>
          🚪 Cerrar sesión
        </button>
      </div>

      {/* Contenido */}
      <div style={styles.main}>
        {/* Mensajes */}
        {success && <div style={styles.successMsg}>✅ {success}</div>}
        {error && <div style={styles.errorMsg}>⚠️ {error}</div>}

        {/* DASHBOARD */}
        {seccion === "dashboard" && (
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <div style={styles.statsGrid}>
              {[
                { label: "Turistas", value: turistas.length, icon: "🧳", color: "#2563eb" },
                { label: "Guías", value: guias.length, icon: "🗺️", color: "#0891b2" },
                { label: "Experiencias aprobadas", value: aprobadas.length, icon: "✅", color: "#059669" },
                { label: "Pendientes de validar", value: pendientes.length, icon: "⏳", color: "#d97706" },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: 32 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {pendientes.length > 0 && (
              <div style={styles.alertBox}>
                <span>⚠️</span>
                <span>Tienes <strong>{pendientes.length}</strong> experiencia(s) pendientes de validación.</span>
                <button onClick={() => setSeccion("experiencias")} style={styles.alertBtn}>Ver ahora</button>
              </div>
            )}
          </div>
        )}

        {/* TABLA DE USUARIOS */}
        {["turistas", "guias", "admins"].includes(seccion) && (
          <div>
            <div style={styles.toolbar}>
              <div>
                <h1 style={styles.pageTitle}>
                  {seccion === "turistas" && "🧳 Turistas registrados"}
                  {seccion === "guias" && "🗺️ Guías y Anfitriones"}
                  {seccion === "admins" && "🛡️ Administradores"}
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                  {seccion === "turistas" && `${turistas.length} turistas`}
                  {seccion === "guias" && `${guias.length} guías y anfitriones`}
                  {seccion === "admins" && `${admins.length} administradores`}
                </p>
              </div>
              <button onClick={() => { setForm({ nombre: "", email: "", password: "", rol: seccion === "turistas" ? "turista" : seccion === "admins" ? "admin" : "guia_turistico" }); setModal("crear"); }}
                style={styles.btnPrimary}>＋ Nuevo</button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>{["#", "Nombre", "Correo", "Rol", "Registrado", "Acciones"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {(seccion === "turistas" ? turistas : seccion === "guias" ? guias : admins).map((u, i) => (
                    <tr key={u.id} style={i % 2 === 0 ? {} : { background: "#fafafa" }}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{u.nombre}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={{ background: `${rolColor[u.rol]}20`, color: rolColor[u.rol], padding: "0.2rem 0.7rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                          {rolLabel[u.rol]}
                        </span>
                      </td>
                      <td style={styles.td}>{new Date(u.created_at).toLocaleDateString("es-BO")}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setSelected(u); setForm({ nombre: u.nombre, email: u.email, password: "", rol: u.rol }); setModal("editar"); }}
                            style={styles.btnEdit}>✏️ Editar</button>
                          <button onClick={() => eliminarUsuario(u.id)} style={styles.btnDelete}>🗑️ Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(seccion === "turistas" ? turistas : seccion === "guias" ? guias : admins).length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No hay usuarios en esta sección</div>
              )}
            </div>
          </div>
        )}

        {/* VALIDAR EXPERIENCIAS */}
        {seccion === "experiencias" && (
          <div>
            <h1 style={styles.pageTitle}>✅ Validar Experiencias</h1>
            <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {[
                { label: `⏳ Pendientes (${pendientes.length})`, estado: "pendiente", color: "#d97706" },
                { label: `✅ Aprobadas (${aprobadas.length})`, estado: "aprobada", color: "#059669" },
                { label: `❌ Rechazadas (${rechazadas.length})`, estado: "rechazada", color: "#dc2626" },
              ].map(tab => (
                <div key={tab.estado} style={{ padding: "0.5rem 1rem", borderRadius: 20, background: `${tab.color}15`, color: tab.color, fontWeight: 600, fontSize: "0.85rem" }}>
                  {tab.label}
                </div>
              ))}
            </div>

            {experiencias.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No hay experiencias registradas aún</div>
            ) : (
              <div style={styles.expGrid}>
                {experiencias.map(exp => (
                  <div key={exp.id} style={styles.expCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>{exp.titulo}</h3>
                      <span style={{
                        padding: "0.2rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600,
                        background: exp.estado === "aprobada" ? "#f0fdf4" : exp.estado === "rechazada" ? "#fef2f2" : "#fffbeb",
                        color: exp.estado === "aprobada" ? "#059669" : exp.estado === "rechazada" ? "#dc2626" : "#d97706",
                      }}>
                        {exp.estado === "aprobada" ? "✅ Aprobada" : exp.estado === "rechazada" ? "❌ Rechazada" : "⏳ Pendiente"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 8px", lineHeight: 1.4 }}>{exp.descripcion}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: "0.78rem", color: "#94a3b8", marginBottom: 10 }}>
                      <span>{exp.categoria === "tour_turistico" ? "🗺️ Tour" : "🍽️ Gastronomía"}</span>
                      <span>💰 Bs. {exp.precio}</span>
                      <span>⏱️ {exp.duracion}h</span>
                      <span>👤 {exp.guia_nombre}</span>
                    </div>
                    {exp.motivo_rechazo && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#b91c1c", marginBottom: 10 }}>
                        Motivo: {exp.motivo_rechazo}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      {exp.estado === "pendiente" && (
                        <>
                          <button onClick={() => validarExperiencia(exp.id, "aprobada")} style={{ ...styles.btnEdit, background: "#f0fdf4", color: "#059669", borderColor: "#bbf7d0" }}>✅ Aprobar</button>
                          <button onClick={() => setModalExp(exp)} style={{ ...styles.btnDelete, background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}>❌ Rechazar</button>
                        </>
                      )}
                      <button onClick={() => eliminarExperiencia(exp.id)} style={styles.btnDelete}>🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Usuario */}
      {modal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                {modal === "crear" ? "➕ Crear usuario" : "✏️ Editar usuario"}
              </h3>
              <button onClick={() => setModal(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Nombre", name: "nombre", type: "text" },
                { label: "Correo", name: "email", type: "email" },
                { label: modal === "editar" ? "Nueva contraseña (opcional)" : "Contraseña", name: "password", type: "password" },
              ].map(f => (
                <div key={f.name}>
                  <label style={styles.label}>{f.label}</label>
                  <input type={f.type} value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.name !== "password" || modal === "crear"}
                    style={styles.input} />
                </div>
              ))}
              <div>
                <label style={styles.label}>Rol</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={styles.input}>
                  <option value="turista">🧳 Turista</option>
                  <option value="guia_turistico">🗺️ Guía Turístico</option>
                  <option value="guia_gastronomico">🍽️ Guía Gastronómico</option>
                  <option value="anfitrion">🏨 Anfitrión</option>
                  <option value="admin">🛡️ Administrador</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => setModal(null)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={guardarUsuario} style={styles.btnPrimary}>
                {modal === "crear" ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazo */}
      {modalExp && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setModalExp(null)}>
          <div style={{ ...styles.modalBox, maxWidth: 400 }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>❌ Rechazar experiencia</h3>
              <button onClick={() => setModalExp(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "1rem" }}>
                Explica al guía por qué se rechaza: <strong>{modalExp?.titulo}</strong>
              </p>
              <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)}
                placeholder="Ej: La descripción está incompleta..."
                style={{ ...styles.input, height: 100, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => setModalExp(null)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={() => validarExperiencia(modalExp.id, "rechazada")}
                style={{ ...styles.btnPrimary, background: "#dc2626" }}>Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI',system-ui,sans-serif" },
  sidebar: { width: 260, background: "linear-gradient(180deg,#1e3a5f,#1e293b)", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", zIndex: 10 },
  sidebarHeader: { display: "flex", alignItems: "center", gap: 12, padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  sidebarTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#fff" },
  sidebarSub: { fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" },
  nav: { flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "0.7rem 1rem", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", cursor: "pointer", width: "100%", transition: "all 0.2s" },
  navItemActive: { background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, padding: "0 6px" },
  logoutBtn: { margin: "1rem", padding: "0.65rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "0.85rem" },
  main: { flex: 1, marginLeft: 260, padding: "2rem", background: "#f8fafc", minHeight: "100vh" },
  pageTitle: { fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", margin: "0 0 1.5rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "#fff", borderRadius: 14, padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 },
  alertBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12, fontSize: "0.88rem", color: "#92400e" },
  alertBtn: { marginLeft: "auto", background: "#d97706", color: "#fff", border: "none", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" },
  tableWrap: { background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f8fafc", padding: "0.85rem 1rem", fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "0.85rem 1rem", fontSize: "0.875rem", color: "#374151", verticalAlign: "middle" },
  expGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1rem" },
  expCard: { background: "#fff", borderRadius: 14, padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  btnPrimary: { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", border: "none", borderRadius: 9, padding: "0.65rem 1.3rem", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" },
  btnEdit: { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 7, padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  btnDelete: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 7, padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  btnCancel: { background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 9, padding: "0.65rem 1.2rem", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" },
  modalBox: { background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 440 },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  input: { width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  successMsg: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.88rem" },
  errorMsg: { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.84rem" },
};
