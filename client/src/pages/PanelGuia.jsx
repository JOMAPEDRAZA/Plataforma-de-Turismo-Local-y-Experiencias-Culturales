import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/experiencias";
const API_MENU = "http://localhost:3000/api/menu";

function getToken() { return localStorage.getItem("token"); }
function getUser() { return JSON.parse(localStorage.getItem("user") || "null"); }

export default function PanelGuia() {
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [menuModal, setMenuModal] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [nuevoItem, setNuevoItem] = useState({ nombre: "", categoria: "plato_principal", precio: "", descripcion: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = getUser();
  const esGastronomico = user?.rol === "guia_gastronomico";

  const [form, setForm] = useState({
    titulo: "", descripcion: "",
    categoria: esGastronomico ? "gastronomia" : "tour_turistico",
    precio: "", duracion: "", capacidad: "",
    imagen_url: "",
    // Gastronomía
    tipo_especifico: "", horario: "", direccion: "",
    // Turismo
    incluye: "", punto_encuentro: "",
  });

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const res = await fetch(`${API}/mis-experiencias`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch { setProductos([]); }
  }

  function resetForm() {
    setForm({
      titulo: "", descripcion: "",
      categoria: esGastronomico ? "gastronomia" : "tour_turistico",
      precio: "", duracion: "", capacidad: "", imagen_url: "",
      tipo_especifico: "", horario: "", direccion: "",
      incluye: "", punto_encuentro: "",
    });
  }

  function abrirCrear() {
    setEditando(null);
    resetForm();
    setError("");
    setModal(true);
  }

  function abrirEditar(p) {
    setEditando(p);
    setForm({
      titulo: p.titulo, descripcion: p.descripcion,
      categoria: p.categoria,
      precio: p.precio, duracion: p.duracion, capacidad: p.capacidad,
      imagen_url: p.imagen_url || "",
      tipo_especifico: p.tipo_especifico || "",
      horario: p.horario || "",
      direccion: p.direccion || "",
      incluye: p.incluye || "",
      punto_encuentro: p.punto_encuentro || "",
    });
    setError("");
    setModal(true);
  }

  async function abrirMenu(p) {
    setMenuModal(p);
    try {
      const res = await fetch(`${API_MENU}/${p.id}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch { setMenuItems([]); }
  }

  async function guardar() {
    if (!form.titulo || !form.descripcion) {
      setError("El título y descripción son obligatorios"); return;
    }
    if (!esGastronomico && (!form.precio || !form.duracion || !form.capacidad)) {
      setError("Completa precio, duración y capacidad"); return;
    }
    setLoading(true);
    try {
      const body = {
        ...form,
        precio: parseFloat(form.precio || 0),
        duracion: parseFloat(form.duracion || 0),
        capacidad: parseInt(form.capacidad || 0),
      };
      const url = editando ? `${API}/${editando.id}` : API;
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error al guardar"); return; }
      setSuccess(editando ? "Producto actualizado — pendiente de aprobación ✓" : "Producto creado — pendiente de aprobación ✓");
      setModal(false);
      cargar();
      setTimeout(() => setSuccess(""), 4000);
    } catch { setError("Error de conexión"); }
    finally { setLoading(false); }
  }

  async function agregarItem() {
    if (!nuevoItem.nombre || !nuevoItem.precio) { setError("Nombre y precio son obligatorios"); return; }
    try {
      await fetch(API_MENU, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...nuevoItem, producto_id: menuModal.id, precio: parseFloat(nuevoItem.precio) }),
      });
      setNuevoItem({ nombre: "", categoria: "plato_principal", precio: "", descripcion: "" });
      const res = await fetch(`${API_MENU}/${menuModal.id}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch { setError("Error al agregar ítem"); }
  }

  async function eliminarItem(id) {
    await fetch(`${API_MENU}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    const res = await fetch(`${API_MENU}/${menuModal.id}`);
    const data = await res.json();
    setMenuItems(Array.isArray(data) ? data : []);
  }

  const estadoStyle = {
    pendiente: { bg: "#fffbeb", color: "#d97706", label: "⏳ Pendiente de aprobación" },
    aprobada: { bg: "#f0fdf4", color: "#059669", label: "✅ Aprobado y publicado" },
    rechazada: { bg: "#fef2f2", color: "#dc2626", label: "❌ Rechazado" },
  };

  const catItems = {
    entrada: "🥗 Entrada",
    plato_principal: "🍽️ Plato principal",
    bebida: "🥤 Bebida",
    postre: "🍮 Postre",
    otro: "🍴 Otro",
  };

  const tiposTurismo = ["Cultural", "Histórico", "Naturaleza", "Aventura", "Arquitectónico", "Religioso"];
  const tiposGastronomia = ["Boliviana", "Internacional", "Fusión", "Vegetariana", "Panadería/Café", "Mariscos"];

  return (
    <div style={styles.page}>
      <div style={{ ...styles.header, background: esGastronomico ? "linear-gradient(135deg,#92400e,#d97706)" : "linear-gradient(135deg,#1e3a5f,#2563eb)" }}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 24 }}>{esGastronomico ? "🍽️" : "🗺️"}</span>
          <div>
            <h1 style={styles.headerTitle}>
              {esGastronomico ? "Panel Guía Gastronómico" : user?.rol === "anfitrion" ? "Panel Anfitrión" : "Panel Guía Turístico"}
            </h1>
            <p style={styles.headerSub}>Gestiona tus {esGastronomico ? "restaurantes y menús" : "tours y excursiones"}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/experiencias" style={styles.navBtn}>🌐 Ver productos</a>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} style={styles.logoutBtn}>🚪 Salir</button>
        </div>
      </div>

      <div style={styles.container}>
        {success && <div style={styles.successMsg}>✅ {success}</div>}
        {error && !modal && !menuModal && <div style={styles.errorMsg}>⚠️ {error}</div>}

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { label: "Total", value: productos.length, color: "#7c3aed", icon: "📋" },
            { label: "Aprobados", value: productos.filter(p => p.estado === "aprobada").length, color: "#059669", icon: "✅" },
            { label: "Pendientes", value: productos.filter(p => p.estado === "pendiente").length, color: "#d97706", icon: "⏳" },
            { label: "Rechazados", value: productos.filter(p => p.estado === "rechazada").length, color: "#dc2626", icon: "❌" },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, borderLeft: `4px solid ${s.color}` }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.infoBox}>
          <span>💡</span>
          <span>Los productos que crees serán revisados por el administrador antes de publicarse.</span>
        </div>

        <div style={styles.toolbar}>
          <h2 style={styles.sectionTitle}>Mis {esGastronomico ? "Restaurantes/Locales" : "Tours"}</h2>
          <button onClick={abrirCrear} style={{ ...styles.btnPrimary, background: esGastronomico ? "linear-gradient(135deg,#d97706,#92400e)" : "linear-gradient(135deg,#2563eb,#0ea5e9)" }}>
            ➕ {esGastronomico ? "Nuevo local/menú" : "Nuevo tour"}
          </button>
        </div>

        {productos.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "3rem", margin: 0 }}>{esGastronomico ? "🍽️" : "🗺️"}</p>
            <p style={{ color: "#64748b", margin: "0.5rem 0 0" }}>No has creado productos aún</p>
            <button onClick={abrirCrear} style={{ ...styles.btnPrimary, marginTop: "1rem" }}>
              Crear mi primer {esGastronomico ? "menú" : "tour"}
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {productos.map(p => {
              const est = estadoStyle[p.estado] || estadoStyle.pendiente;
              return (
                <div key={p.id} style={styles.card}>
                  <div style={styles.cardImg}>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                    ) : (
                      <div style={styles.imgPlaceholder}>{esGastronomico ? "🍽️" : "🗺️"}</div>
                    )}
                    <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>{est.label}</span>
                  </div>

                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{p.titulo}</h3>
                    <p style={styles.cardDesc}>{p.descripcion}</p>

                    {esGastronomico ? (
                      <div style={styles.cardMeta}>
                        {p.tipo_especifico && <span>🍴 {p.tipo_especifico}</span>}
                        {p.horario && <span>🕐 {p.horario}</span>}
                        {p.direccion && <span>📍 {p.direccion}</span>}
                      </div>
                    ) : (
                      <div style={styles.cardMeta}>
                        {p.tipo_especifico && <span>🏷️ {p.tipo_especifico}</span>}
                        <span>💰 Bs. {p.precio}/persona</span>
                        <span>⏱️ {p.duracion}h</span>
                        <span>👥 Máx. {p.capacidad}</span>
                        {p.punto_encuentro && <span>📍 {p.punto_encuentro}</span>}
                      </div>
                    )}

                    {p.motivo_rechazo && (
                      <div style={styles.rechazadoBox}><strong>Motivo:</strong> {p.motivo_rechazo}</div>
                    )}

                    <div style={styles.cardActions}>
                      <button onClick={() => abrirEditar(p)} style={styles.btnEdit}>✏️ Editar</button>
                      {esGastronomico && (
                        <button onClick={() => abrirMenu(p)} style={styles.btnMenu}>🍴 Gestionar carta</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                {editando ? "✏️ Editar producto" : `➕ ${esGastronomico ? "Nuevo local/menú" : "Nuevo tour"}`}
              </h3>
              <button onClick={() => setModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.fg}>
                <label style={styles.label}>Nombre *</label>
                <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder={esGastronomico ? "Ej. Restaurante El Sabor Boliviano" : "Ej. Tour por el Centro Histórico de Sucre"}
                  style={styles.input} />
              </div>

              <div style={styles.fg}>
                <label style={styles.label}>Descripción *</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder={esGastronomico ? "Describe tu local, ambiente, especialidades..." : "Describe el recorrido, qué verán, qué aprenderán..."}
                  style={{ ...styles.input, height: 80, resize: "vertical" }} />
              </div>

              <div style={styles.fg}>
                <label style={styles.label}>{esGastronomico ? "Tipo de cocina" : "Tipo de tour"}</label>
                <select value={form.tipo_especifico} onChange={e => setForm({ ...form, tipo_especifico: e.target.value })} style={styles.input}>
                  <option value="">Selecciona...</option>
                  {(esGastronomico ? tiposGastronomia : tiposTurismo).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {esGastronomico ? (
                <>
                  <div style={styles.fg}>
                    <label style={styles.label}>Horario de atención</label>
                    <input value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })}
                      placeholder="Ej. Lun-Sab 8:00-21:00" style={styles.input} />
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Dirección / Ubicación</label>
                    <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
                      placeholder="Ej. Calle Aniceto Arce #123, Sucre" style={styles.input} />
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Capacidad (personas)</label>
                    <input type="number" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })}
                      placeholder="Ej. 30" min="1" style={styles.input} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={styles.fg}>
                      <label style={styles.label}>Precio por persona (Bs.) *</label>
                      <input type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })}
                        placeholder="Ej. 150" min="0" style={styles.input} />
                    </div>
                    <div style={styles.fg}>
                      <label style={styles.label}>Duración (horas) *</label>
                      <input type="number" value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })}
                        placeholder="Ej. 3" min="0.5" step="0.5" style={styles.input} />
                    </div>
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Capacidad máxima (personas) *</label>
                    <input type="number" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })}
                      placeholder="Ej. 15" min="1" style={styles.input} />
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>¿Qué incluye el tour?</label>
                    <textarea value={form.incluye} onChange={e => setForm({ ...form, incluye: e.target.value })}
                      placeholder="Ej. Transporte, guía bilingüe, entrada a museos, agua..."
                      style={{ ...styles.input, height: 70, resize: "vertical" }} />
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Punto de encuentro</label>
                    <input value={form.punto_encuentro} onChange={e => setForm({ ...form, punto_encuentro: e.target.value })}
                      placeholder="Ej. Plaza 25 de Mayo, frente a la Catedral" style={styles.input} />
                  </div>
                </>
              )}

              <div style={styles.fg}>
                <label style={styles.label}>URL de imagen</label>
                <input value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg" style={styles.input} />
                {form.imagen_url && (
                  <img src={form.imagen_url} alt="preview"
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 6 }}
                    onError={e => e.target.style.display = "none"} />
                )}
              </div>

              {error && <div style={styles.errorMsg}>⚠️ {error}</div>}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setModal(false)} style={styles.btnCancel}>Cancelar</button>
              <button onClick={guardar} disabled={loading}
                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1, background: esGastronomico ? "linear-gradient(135deg,#d97706,#92400e)" : "linear-gradient(135deg,#2563eb,#0ea5e9)" }}>
                {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal carta del menú */}
      {menuModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setMenuModal(null)}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>🍴 Carta — {menuModal.titulo}</h3>
              <button onClick={() => setMenuModal(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {/* Agregar ítem */}
              <div style={{ background: "#fffbeb", borderRadius: 12, padding: "1rem", border: "1.5px solid #fde68a" }}>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", fontWeight: 700, color: "#92400e" }}>➕ Agregar a la carta</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div style={styles.fg}>
                    <label style={styles.label}>Nombre *</label>
                    <input value={nuevoItem.nombre} onChange={e => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
                      placeholder="Ej. Sopa de maní" style={styles.input} />
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Precio (Bs.) *</label>
                    <input type="number" value={nuevoItem.precio} onChange={e => setNuevoItem({ ...nuevoItem, precio: e.target.value })}
                      placeholder="Ej. 35" style={styles.input} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div style={styles.fg}>
                    <label style={styles.label}>Categoría</label>
                    <select value={nuevoItem.categoria} onChange={e => setNuevoItem({ ...nuevoItem, categoria: e.target.value })} style={styles.input}>
                      {Object.entries(catItems).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div style={styles.fg}>
                    <label style={styles.label}>Descripción (opcional)</label>
                    <input value={nuevoItem.descripcion} onChange={e => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                      placeholder="Ingredientes, preparación..." style={styles.input} />
                  </div>
                </div>
                <button onClick={agregarItem} style={{ ...styles.btnPrimary, background: "linear-gradient(135deg,#d97706,#92400e)", width: "100%" }}>
                  ➕ Agregar a la carta
                </button>
              </div>

              {/* Lista de ítems */}
              <div>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", fontWeight: 700 }}>📋 Carta actual ({menuItems.length} ítems)</h4>
                {menuItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                    No hay ítems en la carta aún
                  </div>
                ) : (
                  Object.entries(catItems).map(([cat, catLabel]) => {
                    const itemsCat = menuItems.filter(i => i.categoria === cat);
                    if (itemsCat.length === 0) return null;
                    return (
                      <div key={cat} style={{ marginBottom: "0.75rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{catLabel}</div>
                        {itemsCat.map(item => (
                          <div key={item.id} style={styles.menuItem}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.nombre}</span>
                              {item.descripcion && <span style={{ fontSize: "0.78rem", color: "#64748b", marginLeft: 6 }}>— {item.descripcion}</span>}
                            </div>
                            <span style={{ fontWeight: 700, color: "#d97706", fontSize: "0.9rem" }}>Bs. {item.precio}</span>
                            <button onClick={() => eliminarItem(item.id)} style={{ ...styles.btnDelete, padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}>🗑️</button>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setMenuModal(null)} style={styles.btnCancel}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI',system-ui,sans-serif" },
  header: { padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 },
  headerSub: { fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", margin: 0 },
  navBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none" },
  logoutBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" },
  successMsg: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.88rem" },
  errorMsg: { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 8, padding: "0.7rem 1rem", marginBottom: "1rem", fontSize: "0.84rem" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem", marginBottom: "1rem" },
  statCard: { background: "#fff", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 },
  infoBox: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: 8, fontSize: "0.85rem", color: "#1d4ed8" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0 },
  btnPrimary: { color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.3rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" },
  btnEdit: { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 7, padding: "0.35rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  btnMenu: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", borderRadius: 7, padding: "0.35rem 0.85rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  btnDelete: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 7, padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  btnCancel: { background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 9, padding: "0.65rem 1.2rem", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" },
  empty: { textAlign: "center", padding: "3rem", background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" },
  cardImg: { height: 160, position: "relative", background: "#f1f5f9" },
  imgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", background: "linear-gradient(135deg,#fff7ed,#fde68a)" },
  estadoBadge: { position: "absolute", top: 8, right: 8, padding: "0.2rem 0.65rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 },
  cardBody: { padding: "1.1rem" },
  cardTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.4rem" },
  cardDesc: { fontSize: "0.82rem", color: "#64748b", margin: "0 0 0.75rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: 6, fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem" },
  rechazadoBox: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#b91c1c", marginBottom: "0.75rem" },
  cardActions: { display: "flex", gap: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" },
  modalBox: { background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" },
  modalBody: { padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", position: "sticky", bottom: 0, background: "#fff" },
  fg: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" },
  input: { padding: "0.65rem 0.85rem", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.9rem", color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box", width: "100%", fontFamily: "inherit" },
  menuItem: { display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.75rem", background: "#fafafa", borderRadius: 8, marginBottom: 4 },
};
