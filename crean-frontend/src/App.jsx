import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════
const API = "http://localhost:3001/api";
const http = {
  get: async (r) => {
    const res = await fetch(`${API}${r}`);
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    if (j && Array.isArray(j.datos)) return j.datos;
    if (j && j.dato !== undefined) return j.dato;
    return j;
  },
  post: async (r, b) => {
    const res = await fetch(`${API}${r}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    return j.dato || j;
  },
  patch: async (r, b) => {
    const res = await fetch(`${API}${r}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    return j.dato || j;
  },
  del: async (r) => {
    const res = await fetch(`${API}${r}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ═══════════════════════════════════════════════════════
// ESTILOS GLOBALES
// ═══════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,600;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;color:#111827;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#f0f2f5}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px}
input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
`;

// ═══════════════════════════════════════════════════════
// TOKENS DE DISEÑO
// ═══════════════════════════════════════════════════════
const verde = "#166534";
const verdeClaro = "#dcfce7";
const verdeMedia = "#16a34a";
const grisF = "#f9fafb";
const grisB = "#e5e7eb";
const texto = "#111827";
const textoS = "#6b7280";
const blanco = "#ffffff";
const rojo = "#dc2626";
const rojoC = "#fee2e2";
const amarillo = "#d97706";
const amarilloC = "#fef3c7";
const azul = "#2563eb";
const azulC = "#dbeafe";

// ═══════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════

const Badge = ({ txt, color = verde, bg = verdeClaro }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{txt}</span>
);

const estadoBadge = (e) => {
  const m = {
    disponible: <Badge txt="DISPONIBLE" color="#166534" bg="#dcfce7" />,
    prestada: <Badge txt="EN COMODATO" color="#1d4ed8" bg="#dbeafe" />,
    mantenimiento: <Badge txt="MANTENIMIENTO" color="#dc2626" bg="#fee2e2" />,
    revision: <Badge txt="EN REVISIÓN" color="#d97706" bg="#fef3c7" />,
    baja: <Badge txt="BAJA" color="#6b7280" bg="#f3f4f6" />,
    pendiente: <Badge txt="PENDIENTE" color="#d97706" bg="#fef3c7" />,
    aprobada: <Badge txt="APROBADA" color="#166534" bg="#dcfce7" />,
    rechazada: <Badge txt="RECHAZADA" color="#dc2626" bg="#fee2e2" />,
    cancelada: <Badge txt="CANCELADA" color="#6b7280" bg="#f3f4f6" />,
    programado: <Badge txt="PROGRAMADO" color="#d97706" bg="#fef3c7" />,
    activo: <Badge txt="ACTIVO" color="#1d4ed8" bg="#dbeafe" />,
    finalizado: <Badge txt="FINALIZADO" color="#166534" bg="#dcfce7" />,
    incumplido: <Badge txt="INCUMPLIDO" color="#dc2626" bg="#fee2e2" />,
    pendiente_falla: <Badge txt="PENDIENTE" color="#dc2626" bg="#fee2e2" />,
    en_proceso: <Badge txt="EN PROCESO" color="#d97706" bg="#fef3c7" />,
    resuelto: <Badge txt="RESUELTO" color="#166534" bg="#dcfce7" />,
    terminado: <Badge txt="TERMINADO" color="#166534" bg="#dcfce7" />,
    alta: <Badge txt="ALTA" color="#dc2626" bg="#fee2e2" />,
    normal: <Badge txt="NORMAL" color="#d97706" bg="#fef3c7" />,
    baja_urgencia: <Badge txt="BAJA" color="#166534" bg="#dcfce7" />,
  };
  return m[e] || <Badge txt={(e || "—").toUpperCase()} color="#6b7280" bg="#f3f4f6" />;
};

// Botón
const Btn = ({ children, onClick, variante = "primario", size = "md", type = "button", disabled }) => {
  const v = {
    primario: { background: verde, color: blanco, border: "none" },
    secundario: { background: blanco, color: verde, border: `1.5px solid ${verde}` },
    peligro: { background: rojo, color: blanco, border: "none" },
    ghost: { background: "transparent", color: textoS, border: `1.5px solid ${grisB}` },
  };
  const s = { sm: "6px 12px", md: "9px 18px", lg: "11px 24px" };
  const fs = { sm: 12, md: 14, lg: 15 };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...v[variante], padding: s[size], fontSize: fs[size], fontWeight: 600, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
      {children}
    </button>
  );
};

// Campo de formulario
const F = ({ label, type = "text", value, onChange, options, required, placeholder, rows, nota }) => {

  const manejarCambio = (valor) => {

    // Campos que solo aceptan números
    if (
      label?.toLowerCase().includes("teléfono") ||
      label?.toLowerCase().includes("telefono") ||
      label?.toLowerCase().includes("horómetro") ||
      label?.toLowerCase().includes("horometro") ||
      label?.toLowerCase().includes("beneficiarios") ||
      label?.toLowerCase().includes("superficie") ||
      label?.toLowerCase().includes("días") ||
      label?.toLowerCase().includes("dias") ||
      type === "number"
    ) {
      valor = valor.replace(/[^0-9.]/g, "");
    }

    // Campos que solo aceptan letras
    if (
      label?.toLowerCase().includes("nombre") ||
      label?.toLowerCase().includes("municipio") ||
      label?.toLowerCase().includes("ejido") ||
      label?.toLowerCase().includes("localidad") ||
      label?.toLowerCase().includes("cultivo") ||
      label?.toLowerCase().includes("cargo")
    ) {
      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    }

    onChange(valor);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 5
        }}
      >
        {label}
        {required && <span style={{ color: "red" }}> *</span>}
      </label>

      {type === "select" ? (
        <select
          value={value ?? ""}
          onChange={(e) => manejarCambio(e.target.value)}
        >
          <option value="">— Seleccionar —</option>
          {options?.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => manejarCambio(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => manejarCambio(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {nota && (
        <small style={{ display: "block", marginTop: 4 }}>
          {nota}
        </small>
      )}
    </div>
  );
};

// Modal
const Modal = ({ titulo, sub, onClose, children, ancho = 680 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "24px 12px" }}>
    <div style={{ background: blanco, borderRadius: 14, width: "100%", maxWidth: ancho, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${grisB}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: texto }}>{titulo}</h3>
          {sub && <p style={{ fontSize: 13, color: textoS, marginTop: 2 }}>{sub}</p>}
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: textoS, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  </div>
);

// Tarjeta de estadística
const StatCard = ({ icon, label, valor, sub, color = verde, bg = "#f0fdf4", onClick }) => (
  <div onClick={onClick} style={{ background: blanco, borderRadius: 12, padding: "20px 22px", border: `1px solid ${grisB}`, cursor: onClick ? "pointer" : "default", transition: "box-shadow 0.15s" }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: textoS, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: texto, lineHeight: 1, fontFamily: "'Fraunces',serif" }}>{valor}</p>
        {sub && <p style={{ fontSize: 12, color: textoS, marginTop: 6 }}>{sub}</p>}
      </div>
      <div style={{ background: bg, color, width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
    </div>
  </div>
);

// Tabla
const Tabla = ({ cols, filas, vacia = "Sin registros.", loading }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f9fafb", borderBottom: `2px solid ${grisB}` }}>
          {cols.map((c, i) => <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: textoS, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {loading
          ? <tr><td colSpan={cols.length} style={{ padding: 30, textAlign: "center", color: textoS }}>Cargando...</td></tr>
          : filas.length === 0
          ? <tr><td colSpan={cols.length} style={{ padding: 30, textAlign: "center", color: textoS, fontStyle: "italic" }}>{vacia}</td></tr>
          : filas.map((f, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${grisB}`, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = grisF}
              onMouseLeave={e => e.currentTarget.style.background = blanco}>
              {f.map((c, j) => <td key={j} style={{ padding: "11px 14px", verticalAlign: "middle" }}>{c}</td>)}
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

// Paginador
const Pager = ({ page, total, perPage, onChange }) => {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${grisB}` }}>
      <span style={{ fontSize: 13, color: textoS }}>Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <Btn variante="ghost" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}>‹</Btn>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)} style={{ padding: "5px 10px", borderRadius: 6, border: p === page ? "none" : `1.5px solid ${grisB}`, background: p === page ? verde : blanco, color: p === page ? blanco : texto, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{p}</button>
        ))}
        <Btn variante="ghost" size="sm" onClick={() => onChange(page + 1)} disabled={page === pages}>›</Btn>
      </div>
    </div>
  );
};

// Sección de formulario
const SecF = ({ titulo, children, cols = 2 }) => (
  <div style={{ marginBottom: 20 }}>
    <p style={{ fontSize: 12, fontWeight: 700, color: verde, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${grisB}` }}>{titulo}</p>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: "0 16px" }}>{children}</div>
  </div>
);

// Cabecera de sección
const PageHeader = ({ titulo, sub, accion }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: texto, fontFamily: "'Fraunces',serif" }}>{titulo}</h1>
      {sub && <p style={{ fontSize: 14, color: textoS, marginTop: 2 }}>{sub}</p>}
    </div>
    {accion}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: blanco, borderRadius: 12, border: `1px solid ${grisB}`, overflow: "hidden", ...style }}>{children}</div>
);

// Alerta
const Alerta = ({ msg, tipo = "error" }) => {
  const c = tipo === "error" ? [rojo, rojoC] : [verde, verdeClaro];
  return <div style={{ background: c[1], border: `1px solid ${c[0]}44`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: c[0] }}>{msg}</div>;
};

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
const MENU = [
  { id: "dashboard", label: "Panel de Control", icon: "⊞" },
  { id: "inventario", label: "Inventario", icon: "📦" },
  { id: "solicitudes", label: "Solicitudes", icon: "📋" },
  { id: "comodatos", label: "Comodatos", icon: "🤝" },
  { id: "traslados", label: "Traslados", icon: "🚛" },
  { id: "entregas", label: "Entregas", icon: "✅" },
  { id: "devoluciones", label: "Devoluciones", icon: "↩" },
  { id: "fallas", label: "Fallas y Manto.", icon: "🔧" },
  { id: "documentos", label: "Documentos", icon: "📄" },
];

const Sidebar = ({ seccion, onChange }) => (
  <aside style={{ width: 230, background: "#111827", display: "flex", flexDirection: "column", flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100 }}>
    <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: verde, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌾</div>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'Fraunces',serif" }}>CREAN</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Gestión de Maquinaria</div>
        </div>
      </div>
    </div>
    <div style={{ padding: "8px 0", flex: 1, overflowY: "auto" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "12px 18px 6px" }}>Panel de Control</p>
      {MENU.map(m => {
        const activo = seccion === m.id;
        return (
          <button key={m.id} onClick={() => onChange(m.id)} style={{ width: "100%", textAlign: "left", background: activo ? "rgba(22,101,52,0.35)" : "transparent", color: activo ? "#4ade80" : "rgba(255,255,255,0.65)", border: "none", borderLeft: activo ? `3px solid #4ade80` : "3px solid transparent", padding: "10px 18px 10px 15px", fontSize: 13.5, fontWeight: activo ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}
            onMouseEnter={e => { if (!activo) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 15 }}>{m.icon}</span>{m.label}
          </button>
        );
      })}
    </div>
    <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Comodatos · 2026</p>
    </div>
  </aside>
);

// Topbar
const Topbar = ({ titulo }) => (
  <div style={{ height: 56, background: blanco, borderBottom: `1px solid ${grisB}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
    <p style={{ fontSize: 14, fontWeight: 600, color: textoS }}>{titulo}</p>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, color: textoS }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
      <div style={{ width: 1, height: 18, background: grisB }} />
      <div style={{ background: verde, color: blanco, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>C</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: texto }}>C.R.E.A.N.</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard({ irA }) {
  const [data, setData] = useState(null);
  const [maq, setMaq] = useState([]);
  const [fallas, setFallas] = useState([]);
  const [comodatos, setComodatos] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    Promise.all([http.get("/dashboard"), http.get("/maquinaria"), http.get("/fallas"), http.get("/comodatos")])
      .then(([d, m, f, c]) => { setData(d); setMaq(Array.isArray(m) ? m : []); setFallas(Array.isArray(f) ? f : []); setComodatos(Array.isArray(c) ? c : []); })
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <Alerta msg={`Error de conexión: ${err}`} />;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: textoS }}>Cargando panel...</div>;

  const vencidos = comodatos.filter(c => c.fecha_devolucion_esperada && new Date(c.fecha_devolucion_esperada) < new Date() && c.estado === "activo");
  const proximos = comodatos.filter(c => {
    if (!c.fecha_devolucion_esperada || c.estado !== "activo") return false;
    const dias = Math.ceil((new Date(c.fecha_devolucion_esperada) - new Date()) / 86400000);
    return dias >= 0 && dias <= 7;
  });

  return (
    <div>
      <PageHeader titulo="Panel de Control" sub="Resumen general de comodatos y maquinaria" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon="🚜" label="Equipos Disponibles" valor={data.maquinaria?.disponible || 0} sub="listos para préstamo" color="#166534" bg="#dcfce7" onClick={() => irA("inventario")} />
        <StatCard icon="🤝" label="Comodatos Activos" valor={data.comodatos_activos || 0} sub="contratos vigentes" color="#1d4ed8" bg="#dbeafe" onClick={() => irA("comodatos")} />
        <StatCard icon="📋" label="Solicitudes Pendientes" valor={data.solicitudes_pendientes || 0} sub="requieren revisión" color="#d97706" bg="#fef3c7" onClick={() => irA("solicitudes")} />
        <StatCard icon="⚠️" label="Fallas Reportadas" valor={data.fallas_pendientes || 0} sub="pendientes de atención" color="#dc2626" bg="#fee2e2" onClick={() => irA("fallas")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Maquinaria en campo */}
        <Card>
          <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${grisB}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Maquinaria en Campo</p>
            <button onClick={() => irA("inventario")} style={{ fontSize: 12, color: verde, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todo →</button>
          </div>
          <Tabla
            cols={["# ECO", "Tipo", "Modelo", "Ubicación"]}
            vacia="Ninguna maquinaria en préstamo activo."
            filas={maq.filter(m => m.estado_operativo === "prestada").slice(0, 5).map(m => [
              <strong style={{ color: verde }}>{m.numero_economico}</strong>,
              m.tipo_equipo, m.modelo,
              <span style={{ fontSize: 12, color: textoS }}>{m.ubicacion}</span>
            ])}
          />
        </Card>

        {/* Próximos vencimientos */}
        <Card>
          <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${grisB}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Próximos Vencimientos</p>
            <button onClick={() => irA("comodatos")} style={{ fontSize: 12, color: verde, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todos →</button>
          </div>
          {proximos.length === 0 && vencidos.length === 0
            ? <p style={{ padding: "20px 18px", color: textoS, fontSize: 13, fontStyle: "italic" }}>Sin vencimientos próximos.</p>
            : <div style={{ padding: "8px 0" }}>
                {[...vencidos.map(c => ({ ...c, _tipo: "vencido" })), ...proximos.map(c => ({ ...c, _tipo: "proximo" }))].slice(0, 5).map(c => {
                  const dias = Math.ceil((new Date(c.fecha_devolucion_esperada) - new Date()) / 86400000);
                  return (
                    <div key={c.pk_comodato} style={{ padding: "10px 18px", borderBottom: `1px solid ${grisB}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{c.nombre_comodatario}</p>
                        <p style={{ fontSize: 12, color: textoS }}>{c.numero_economico_maq || "—"} · {c.municipio}</p>
                      </div>
                      <span style={{ background: c._tipo === "vencido" ? rojoC : amarilloC, color: c._tipo === "vencido" ? rojo : amarillo, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                        {c._tipo === "vencido" ? `−${Math.abs(dias)}d` : `${dias}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
          }
        </Card>
      </div>

      {/* Fallas recientes */}
      <Card>
        <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${grisB}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700 }}>Fallas Pendientes de Atención</p>
          <button onClick={() => irA("fallas")} style={{ fontSize: 12, color: verde, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todas →</button>
        </div>
        <Tabla
          cols={["Folio", "Equipo", "Tipo", "Descripción", "Urgencia", "Fecha"]}
          vacia="Sin fallas pendientes. ✓"
          filas={fallas.filter(f => f.estado === "pendiente").slice(0, 5).map((f, i) => [
            <span style={{ fontSize: 12, color: textoS }}>FAL-{f.pk_falla}</span>,
            <strong>{f.numero_economico || `#${f.fk_maquinaria}`}</strong>,
            f.tipo,
            <span style={{ fontSize: 12 }}>{f.descripcion?.substring(0, 50)}{f.descripcion?.length > 50 ? "..." : ""}</span>,
            estadoBadge(f.urgencia),
            <span style={{ fontSize: 12, color: textoS }}>{f.fecha_reporte}</span>
          ])}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INVENTARIO
// ═══════════════════════════════════════════════════════
function Inventario() {
  const [maq, setMaq] = useState([]);
  const [veh, setVeh] = useState([]);
  const [tab, setTab] = useState("maq");
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [page, setPage] = useState(1);
  const POR_PAG = 10;
  const [form, setForm] = useState({ numero_economico: "", tipo_equipo: "Tractor", marca: "NEW HOLLAND", modelo: "", serie: "", num_motor: "", horas_actuales: 0, ubicacion: "CREAN", observaciones: "" });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/maquinaria"), http.get("/vehiculos")])
      .then(([m, v]) => { setMaq(Array.isArray(m) ? m : []); setVeh(Array.isArray(v) ? v : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    if (!form.numero_economico || !form.modelo) return alert("Complete los campos obligatorios.");
    try { await http.post("/maquinaria", form); setModal(false); cargar(); setForm({ numero_economico: "", tipo_equipo: "Tractor", marca: "NEW HOLLAND", modelo: "", serie: "", num_motor: "", horas_actuales: 0, ubicacion: "CREAN", observaciones: "" }); }
    catch (e) { alert(e.message); }
  };

  const lista = tab === "maq" ? maq : veh;
  const filtrada = lista.filter(m => {
    const q = busca.toLowerCase();
    const matchQ = !q || JSON.stringify(m).toLowerCase().includes(q);
    const matchE = !filtroEstado || (m.estado_operativo || m.estado) === filtroEstado;
    return matchQ && matchE;
  });
  const pagFiltrada = filtrada.slice((page - 1) * POR_PAG, page * POR_PAG);

  return (
    <div>
      <PageHeader titulo="Inventario de Equipos" sub="Consulta y administración de la maquinaria disponible"
        accion={<Btn onClick={() => setModal(true)}>+ Agregar Maquinaria</Btn>} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `2px solid ${grisB}` }}>
        {[["maq", "🚜 Maquinaria", maq.length], ["veh", "🚛 Vehículos", veh.length]].map(([id, lbl, cnt]) => (
          <button key={id} onClick={() => { setTab(id); setPage(1); setBusca(""); }} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer", borderBottom: tab === id ? `2px solid ${verde}` : "2px solid transparent", color: tab === id ? verde : textoS, marginBottom: -2 }}>
            {lbl} <span style={{ background: grisB, borderRadius: 10, padding: "1px 7px", fontSize: 11, marginLeft: 4 }}>{cnt}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} placeholder="🔍  Buscar equipo, marca, modelo, serie..." style={{ flex: 1, minWidth: 200, padding: "9px 14px", fontSize: 13, border: `1.5px solid ${grisB}`, borderRadius: 8, outline: "none" }} />
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }} style={{ padding: "9px 14px", fontSize: 13, border: `1.5px solid ${grisB}`, borderRadius: 8, outline: "none" }}>
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="prestada">En Comodato</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="revision">En Revisión</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      <Card>
        {tab === "maq"
          ? <Tabla loading={loading} cols={["# ECO", "Tipo", "Marca", "Modelo", "Serie", "Estado", "Horas", "Ubicación"]}
              filas={pagFiltrada.map(m => [
                <strong style={{ color: verde, fontSize: 13 }}>{m.numero_economico}</strong>,
                m.tipo_equipo, m.marca, m.modelo,
                <span style={{ fontSize: 12, color: textoS, fontFamily: "monospace" }}>{m.serie || "—"}</span>,
                estadoBadge(m.estado_operativo),
                <span style={{ fontWeight: 600 }}>{m.horas_actuales?.toLocaleString()} h</span>,
                m.ubicacion
              ])} />
          : <Tabla loading={loading} cols={["# ECO", "Tipo", "Marca", "Modelo", "Placas", "Estado", "Kilometraje"]}
              filas={pagFiltrada.map(v => [
                <strong style={{ color: verde }}>{v.numero_economico}</strong>,
                v.tipo_vehiculo, v.marca, v.modelo, v.placas || "—",
                estadoBadge(v.estado_operativo),
                <span style={{ fontWeight: 600 }}>{v.kilometraje_actual?.toLocaleString()} km</span>
              ])} />
        }
        <Pager page={page} total={filtrada.length} perPage={POR_PAG} onChange={setPage} />
      </Card>

      {modal && (
        <Modal titulo="Alta de Maquinaria al Inventario" sub="C.R.E.A.N. — Módulo B" onClose={() => setModal(false)}>
          <SecF titulo="Datos del Equipo">
            <F label="Número Económico" value={form.numero_economico} onChange={f("numero_economico")} required placeholder="Ej: T040" />
            <F label="Tipo de Equipo" type="select" value={form.tipo_equipo} onChange={f("tipo_equipo")} options={["Tractor", "Rastra", "Sembradora", "Implemento", "Remolque", "Perforadora", "Otro"]} />
            <F label="Marca" value={form.marca} onChange={f("marca")} />
            <F label="Modelo" value={form.modelo} onChange={f("modelo")} required />
            <F label="Número de Serie" value={form.serie} onChange={f("serie")} />
            <F label="Número de Motor" value={form.num_motor} onChange={f("num_motor")} />
            <F label="Horas en Horómetro" type="number" value={form.horas_actuales} onChange={f("horas_actuales")} />
            <F label="Ubicación Actual" value={form.ubicacion} onChange={f("ubicacion")} />
          </SecF>
          <F label="Observaciones" type="textarea" value={form.observaciones} onChange={f("observaciones")} rows={2} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={guardar}>Guardar Registro</Btn>
            <Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SOLICITUDES
// ═══════════════════════════════════════════════════════
function Solicitudes() {
  const [lista, setLista] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const POR_PAG = 8;
  const INIT = { folio: "", nombre_productor: "", telefono: "", ejido: "", municipio: "", superficie_ha: "", cultivo: "", equipos_solicitados: "", num_beneficiarios: "", documento_ceder: "", fecha_solicitud: new Date().toISOString().split("T")[0], registrado_por: "", observaciones: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    http.get("/solicitudes").then(d => { setLista(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    if (!form.folio || !form.nombre_productor || !form.municipio) return alert("Complete los campos obligatorios.");
    try { await http.post("/solicitudes", form); setModal(false); setForm(INIT); cargar(); }
    catch (e) { alert(e.message); }
  };

  const cambiarEstado = async (id, estado) => {
    if (!window.confirm(`¿Confirmar ${estado} la solicitud?`)) return;
    try { await http.patch(`/solicitudes/${id}/estado`, { estado }); cargar(); }
    catch (e) { alert(e.message); }
  };

  const filtrada = lista.filter(s => {
    const q = busca.toLowerCase();
    const matchQ = !q || `${s.nombre_productor} ${s.folio} ${s.municipio}`.toLowerCase().includes(q);
    const matchF = filtro === "todas" || s.estado === filtro;
    return matchQ && matchF;
  });
  const pag = filtrada.slice((page - 1) * POR_PAG, page * POR_PAG);
  const cnt = e => lista.filter(s => s.estado === e).length;

  return (
    <div>
      <PageHeader titulo="Solicitudes de Comodato" sub="Consulta y administración de solicitudes de préstamo"
        accion={<Btn onClick={() => setModal(true)}>+ Nueva Solicitud</Btn>} />

      {/* Tabs de filtro */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `2px solid ${grisB}` }}>
        {[["todas", "Todas", lista.length], ["pendiente", "Pendientes", cnt("pendiente")], ["aprobada", "Aprobadas", cnt("aprobada")], ["rechazada", "Rechazadas", cnt("rechazada")]].map(([id, lbl, c]) => (
          <button key={id} onClick={() => { setFiltro(id); setPage(1); }} style={{ padding: "10px 18px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer", borderBottom: filtro === id ? `2px solid ${verde}` : "2px solid transparent", color: filtro === id ? verde : textoS, marginBottom: -2, display: "flex", alignItems: "center", gap: 6 }}>
            {lbl} <span style={{ background: grisB, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{c}</span>
          </button>
        ))}
      </div>

      {/* Buscador */}
      <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} placeholder="🔍  Buscar por productor, folio o municipio..." style={{ width: "100%", padding: "9px 14px", fontSize: 13, border: `1.5px solid ${grisB}`, borderRadius: 8, outline: "none", marginBottom: 14 }} />

      <Card>
        <Tabla loading={loading} cols={["EXP.", "Productor / Comunidad", "Equipo Solicitado", "Superficie", "Fecha", "Estado", "Acciones"]}
          vacia="No hay solicitudes registradas."
          filas={pag.map(s => [
            <span style={{ fontSize: 11, color: textoS, fontFamily: "monospace" }}>{s.folio}</span>,
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{s.nombre_productor}</p>
              <p style={{ fontSize: 11, color: textoS }}>{s.municipio}{s.ejido ? ` / ${s.ejido}` : ""}</p>
            </div>,
            <span style={{ fontSize: 12 }}>{s.equipos_solicitados?.substring(0, 40) || "—"}</span>,
            <span style={{ fontSize: 12 }}>{s.superficie_ha ? `${s.superficie_ha} ha` : "—"}</span>,
            <span style={{ fontSize: 12, color: textoS }}>{s.fecha_solicitud}</span>,
            estadoBadge(s.estado),
            <div style={{ display: "flex", gap: 4 }}>
              {s.estado === "pendiente" && <>
                <Btn size="sm" onClick={() => cambiarEstado(s.pk_solicitud, "aprobada")}>✓</Btn>
                <Btn size="sm" variante="peligro" onClick={() => cambiarEstado(s.pk_solicitud, "rechazada")}>✗</Btn>
              </>}
            </div>
          ])} />
        <Pager page={page} total={filtrada.length} perPage={POR_PAG} onChange={setPage} />
      </Card>

      {modal && (
        <Modal titulo="Registro de Solicitud de Comodato" sub="C.R.E.A.N. — Secretaría de Desarrollo Rural · Nayarit" onClose={() => setModal(false)} ancho={720}>
          <SecF titulo="Identificación de la Solicitud">
            <F label="Folio CEDER" value={form.folio} onChange={f("folio")} required placeholder="CEDER/2026/001" />
            <F label="Fecha de Solicitud" type="date" value={form.fecha_solicitud} onChange={f("fecha_solicitud")} />
          </SecF>
          <SecF titulo="Datos del Productor">
            <F label="Nombre Completo" value={form.nombre_productor} onChange={f("nombre_productor")} required />
            <F label="Teléfono" value={form.telefono} onChange={f("telefono")} />
            <F label="Municipio" value={form.municipio} onChange={f("municipio")} required />
            <F label="Ejido / Comunidad" value={form.ejido} onChange={f("ejido")} />
            <F label="Cultivo o Actividad" value={form.cultivo} onChange={f("cultivo")} />
            <F label="Superficie (ha)" type="number" value={form.superficie_ha} onChange={f("superficie_ha")} />
            <F label="Núm. Beneficiarios" type="number" value={form.num_beneficiarios} onChange={f("num_beneficiarios")} />
            <F label="Registrado por" value={form.registrado_por} onChange={f("registrado_por")} />
          </SecF>
          <SecF titulo="Detalles de la Solicitud" cols={1}>
            <F label="Equipos Solicitados (descripción)" type="textarea" value={form.equipos_solicitados} onChange={f("equipos_solicitados")} rows={2} />
            <F label="Referencia Documento CEDER" value={form.documento_ceder} onChange={f("documento_ceder")} />
            <F label="Observaciones" type="textarea" value={form.observaciones} onChange={f("observaciones")} rows={2} />
          </SecF>
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardar}>Registrar Solicitud</Btn><Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMODATOS
// ═══════════════════════════════════════════════════════
function Comodatos() {
  const [lista, setLista] = useState([]);
  const [maq, setMaq] = useState([]);
  const [sols, setSols] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const POR_PAG = 8;
  const INIT = { fk_solicitud: "", fk_maquinaria: "", numero_economico_maq: "", descripcion_maquinaria: "", nombre_comodatario: "", telefono: "", ejido: "", municipio: "", cultivo: "", superficie_ha: "", num_beneficiarios: "", fecha_entrega: "", fecha_devolucion_esperada: "", dias_prestamo: "", oficio_comodato: "", horas_entrega: "", registrado_por: "", observaciones: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/comodatos"), http.get("/maquinaria"), http.get("/solicitudes")])
      .then(([c, m, s]) => { setLista(Array.isArray(c) ? c : []); setMaq(Array.isArray(m) ? m.filter(x => x.estado_operativo === "disponible") : []); setSols(Array.isArray(s) ? s.filter(x => x.estado === "aprobada") : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const selMaq = id => {
    const m = maq.find(x => x.pk_maquinaria == id);
    if (m) setForm(p => ({ ...p, fk_maquinaria: id, numero_economico_maq: m.numero_economico, descripcion_maquinaria: `${m.tipo_equipo} MARCA ${m.marca}, MODELO ${m.modelo}, CON NÚMERO ECONÓMICO ${m.numero_economico}${m.serie ? ", NÚMERO DE SERIE " + m.serie : ""}${m.horas_actuales ? ", CON " + m.horas_actuales + " HORAS EN EL HORÓMETRO" : ""}` }));
    else setForm(p => ({ ...p, fk_maquinaria: id }));
  };

  const guardar = async () => {
    if (!form.nombre_comodatario || !form.fecha_entrega) return alert("Complete los campos obligatorios.");
    try { await http.post("/comodatos", form); setModal(false); setForm(INIT); cargar(); }
    catch (e) { alert(e.message); }
  };

  const cnt = e => lista.filter(c => c.estado === e).length;
  const filtrada = lista.filter(c => {
    const q = busca.toLowerCase();
    const matchQ = !q || `${c.nombre_comodatario} ${c.numero_economico_maq} ${c.municipio}`.toLowerCase().includes(q);
    const matchF = filtro === "todos" || c.estado === filtro;
    return matchQ && matchF;
  });
  const pag = filtrada.slice((page - 1) * POR_PAG, page * POR_PAG);

  const diasRestantes = (fecha) => {
    if (!fecha) return null;
    return Math.ceil((new Date(fecha) - new Date()) / 86400000);
  };

  return (
    <div>
      <PageHeader titulo="Contratos de Comodato" sub="Consulta y administración de contratos de préstamo de maquinaria"
        accion={<Btn onClick={() => setModal(true)}>+ Nuevo Comodato</Btn>} />

      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `2px solid ${grisB}` }}>
        {[["todos", "Todos", lista.length], ["activo", "Activos", cnt("activo")], ["programado", "Programados", cnt("programado")], ["finalizado", "Finalizados", cnt("finalizado")], ["incumplido", "Incumplidos", cnt("incumplido")]].map(([id, lbl, c]) => (
          <button key={id} onClick={() => { setFiltro(id); setPage(1); }} style={{ padding: "10px 18px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer", borderBottom: filtro === id ? `2px solid ${verde}` : "2px solid transparent", color: filtro === id ? verde : textoS, marginBottom: -2, display: "flex", alignItems: "center", gap: 6 }}>
            {lbl} <span style={{ background: grisB, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{c}</span>
          </button>
        ))}
      </div>

      <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} placeholder="🔍  Buscar por productor, equipo o municipio..." style={{ width: "100%", padding: "9px 14px", fontSize: 13, border: `1.5px solid ${grisB}`, borderRadius: 8, outline: "none", marginBottom: 14 }} />

      <Card>
        <Tabla loading={loading} cols={["No. Contrato", "Productor / Comunidad", "Equipo", "Fecha Inicio", "Fecha Fin", "Días", "Estado"]}
          vacia="No hay comodatos registrados."
          filas={pag.map(c => {
            const dias = diasRestantes(c.fecha_devolucion_esperada);
            const vencido = dias !== null && dias < 0 && c.estado === "activo";
            return [
              <span style={{ fontSize: 11, color: textoS, fontFamily: "monospace" }}>{c.oficio_comodato || `COM-${c.pk_comodato}`}</span>,
              <div>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{c.nombre_comodatario}</p>
                <p style={{ fontSize: 11, color: textoS }}>{c.municipio}{c.ejido ? ` / ${c.ejido}` : ""}</p>
              </div>,
              <div>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{c.numero_economico_maq || "—"}</p>
                <p style={{ fontSize: 11, color: textoS }}>{c.cultivo || ""}</p>
              </div>,
              <span style={{ fontSize: 12 }}>{c.fecha_entrega}</span>,
              <span style={{ fontSize: 12 }}>{c.fecha_devolucion_esperada}</span>,
              dias !== null ? <span style={{ fontSize: 12, fontWeight: 700, color: vencido ? rojo : dias <= 3 ? amarillo : verde }}>{vencido ? `−${Math.abs(dias)}d` : `${dias}d`}</span> : "—",
              estadoBadge(vencido ? "incumplido" : c.estado)
            ];
          })} />
        <Pager page={page} total={filtrada.length} perPage={POR_PAG} onChange={setPage} />
      </Card>

      {modal && (
        <Modal titulo="Registro de Contrato de Comodato" sub="C.R.E.A.N. — Secretaría de Desarrollo Rural · Nayarit" onClose={() => setModal(false)} ancho={760}>
          <SecF titulo="Origen del Comodato">
            <F label="Solicitud de Origen (opcional)" type="select" value={form.fk_solicitud} onChange={f("fk_solicitud")} options={sols.map(s => ({ value: s.pk_solicitud, label: `${s.folio} — ${s.nombre_productor}` }))} />
            <F label="Maquinaria a Prestar" type="select" value={form.fk_maquinaria} onChange={selMaq} options={maq.map(m => ({ value: m.pk_maquinaria, label: `${m.numero_economico} — ${m.tipo_equipo} ${m.marca} ${m.modelo}` }))} />
          </SecF>
          <SecF titulo="Datos del Comodatario">
            <F label="Nombre Completo" value={form.nombre_comodatario} onChange={f("nombre_comodatario")} required />
            <F label="Teléfono" value={form.telefono} onChange={f("telefono")} />
            <F label="Municipio" value={form.municipio} onChange={f("municipio")} />
            <F label="Ejido / Comunidad" value={form.ejido} onChange={f("ejido")} />
            <F label="Cultivo o Actividad" value={form.cultivo} onChange={f("cultivo")} />
            <F label="Superficie (ha)" type="number" value={form.superficie_ha} onChange={f("superficie_ha")} />
            <F label="Núm. Beneficiarios" type="number" value={form.num_beneficiarios} onChange={f("num_beneficiarios")} />
          </SecF>
          <SecF titulo="Plazos y Control">
            <F label="Fecha de Entrega" type="date" value={form.fecha_entrega} onChange={f("fecha_entrega")} required />
            <F label="Fecha Límite Devolución" type="date" value={form.fecha_devolucion_esperada} onChange={f("fecha_devolucion_esperada")} />
            <F label="Días de Préstamo" type="number" value={form.dias_prestamo} onChange={f("dias_prestamo")} />
            <F label="Horómetro al Entregar (h)" type="number" value={form.horas_entrega} onChange={f("horas_entrega")} />
            <F label="Folio / Oficio" value={form.oficio_comodato} onChange={f("oficio_comodato")} />
            <F label="Registrado por" value={form.registrado_por} onChange={f("registrado_por")} />
          </SecF>
          <SecF titulo="Descripción de la Maquinaria" cols={1}>
            <F label="Descripción completa (para documentos oficiales)" type="textarea" value={form.descripcion_maquinaria} onChange={f("descripcion_maquinaria")} rows={2} />
            <F label="Observaciones" type="textarea" value={form.observaciones} onChange={f("observaciones")} rows={2} />
          </SecF>
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardar}>Registrar Comodato</Btn><Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TRASLADOS
// ═══════════════════════════════════════════════════════
function Traslados() {
  const [lista, setLista] = useState([]);
  const [comodatos, setComodatos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const INIT = { fk_comodato: "", tipo: "entrega", destino: "", fecha_salida: "", fecha_llegada: "", fk_vehiculo: "", numero_economico_veh: "", km_salida: "", km_llegada: "", observaciones: "", registrado_por: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/comodatos"), http.get("/vehiculos")])
      .then(([c, v]) => { setComodatos(Array.isArray(c) ? c : []); setVehiculos(Array.isArray(v) ? v : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    if (!form.fk_comodato || !form.destino) return alert("Complete los campos obligatorios.");
    try { await http.post("/traslados", form); setModal(false); setForm(INIT); alert("Traslado registrado correctamente."); }
    catch (e) { alert(e.message); }
  };

  const selVeh = id => {
    const v = vehiculos.find(x => x.pk_vehiculo == id);
    if (v) setForm(p => ({ ...p, fk_vehiculo: id, numero_economico_veh: v.numero_economico }));
    else setForm(p => ({ ...p, fk_vehiculo: id }));
  };

  return (
    <div>
      <PageHeader titulo="Operaciones de Traslado" sub="Registro de logística de entrega y recolección de maquinaria"
        accion={<Btn onClick={() => setModal(true)}>+ Nuevo Traslado</Btn>} />
      <Card>
        <div style={{ padding: "50px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🚛</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: texto, marginBottom: 6 }}>Registre los traslados de maquinaria</p>
          <p style={{ fontSize: 14, color: textoS, marginBottom: 20 }}>Capture los datos de entrega y recolección, vehículo, kilómetros y combustible.</p>
          <Btn onClick={() => setModal(true)}>+ Registrar Traslado</Btn>
        </div>
      </Card>
      {modal && (
        <Modal titulo="Registrar Operación de Traslado" sub="C.R.E.A.N. — Logística" onClose={() => setModal(false)}>
          <SecF titulo="Datos del Traslado">
            <F label="Comodato" type="select" value={form.fk_comodato} onChange={f("fk_comodato")} required options={comodatos.map(c => ({ value: c.pk_comodato, label: `#${c.pk_comodato} — ${c.nombre_comodatario}` }))} />
            <F label="Tipo" type="select" value={form.tipo} onChange={f("tipo")} options={[{ value: "entrega", label: "Entrega" }, { value: "recoleccion", label: "Recolección" }]} />
            <F label="Destino (Ejido / Dirección)" value={form.destino} onChange={f("destino")} required />
            <F label="Vehículo" type="select" value={form.fk_vehiculo} onChange={selVeh} options={vehiculos.map(v => ({ value: v.pk_vehiculo, label: `${v.numero_economico} — ${v.tipo_vehiculo} ${v.marca}` }))} />
            <F label="Fecha y Hora de Salida" type="datetime-local" value={form.fecha_salida} onChange={f("fecha_salida")} />
            <F label="Fecha y Hora de Llegada" type="datetime-local" value={form.fecha_llegada} onChange={f("fecha_llegada")} />
            <F label="KM Salida" type="number" value={form.km_salida} onChange={f("km_salida")} />
            <F label="KM Llegada" type="number" value={form.km_llegada} onChange={f("km_llegada")} />
            <F label="Registrado por" value={form.registrado_por} onChange={f("registrado_por")} />
          </SecF>
          <F label="Observaciones / Incidencias" type="textarea" value={form.observaciones} onChange={f("observaciones")} rows={2} />
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardar}>Guardar Traslado</Btn><Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ENTREGAS
// ═══════════════════════════════════════════════════════
function Entregas() {
  const [lista, setLista] = useState([]);
  const [comodatos, setComodatos] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const INIT = { fk_comodato: "", fk_maquinaria: "", numero_economico: "", fecha_entrega: "", nombre_receptor: "", cargo_receptor: "", ubicacion_entrega: "", horas_entrega: "", estado_motor: "bueno", estado_llantas: "bueno", estado_asiento: "bueno", nivel_combustible: "lleno", rayones: false, descripcion_rayones: "", observaciones_checklist: "", registrado_por: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/entregas"), http.get("/comodatos"), http.get("/maquinaria")])
      .then(([e, c, m]) => { setLista(Array.isArray(e) ? e : []); setComodatos(Array.isArray(c) ? c.filter(x => x.estado !== "finalizado") : []); setMaquinas(Array.isArray(m) ? m : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    if (!form.fk_comodato || !form.nombre_receptor || !form.fecha_entrega) return alert("Complete los campos obligatorios.");
    try { await http.post("/entregas", form); setModal(false); setForm(INIT); cargar(); }
    catch (e) { alert(e.message); }
  };

  const selMaq = id => {
    const m = maquinas.find(x => x.pk_maquinaria == id);
    if (m) setForm(p => ({ ...p, fk_maquinaria: id, numero_economico: m.numero_economico }));
    else setForm(p => ({ ...p, fk_maquinaria: id }));
  };

  return (
    <div>
      <PageHeader titulo="Entregas de Maquinaria" sub="Registro formal de entrega con checklist de estado"
        accion={<Btn onClick={() => setModal(true)}>+ Registrar Entrega</Btn>} />
      <Card>
        <Tabla loading={loading} cols={["Comodato", "Receptor", "Equipo", "Fecha Entrega", "Horas", "Ubicación", "Motor", "Llantas"]}
          vacia="No hay entregas registradas."
          filas={lista.map(e => {
            const co = comodatos.find(c => c.pk_comodato == e.fk_comodato);
            return [
              <span style={{ fontSize: 12, color: textoS }}>{co?.nombre_comodatario || `#${e.fk_comodato}`}</span>,
              <div><p style={{ fontWeight: 600, fontSize: 13 }}>{e.nombre_receptor}</p><p style={{ fontSize: 11, color: textoS }}>{e.cargo_receptor}</p></div>,
              <strong style={{ color: verde }}>{e.numero_economico || "—"}</strong>,
              <span style={{ fontSize: 12 }}>{e.fecha_entrega?.split("T")[0]}</span>,
              <span style={{ fontSize: 13, fontWeight: 600 }}>{e.horas_entrega} h</span>,
              <span style={{ fontSize: 12 }}>{e.ubicacion_entrega}</span>,
              estadoBadge(e.estado_motor),
              estadoBadge(e.estado_llantas)
            ];
          })} />
      </Card>
      {modal && (
        <Modal titulo="Registrar Entrega de Maquinaria" sub="Checklist de estado al entregar" onClose={() => setModal(false)} ancho={740}>
          <SecF titulo="Datos de la Entrega">
            <F label="Comodato" type="select" value={form.fk_comodato} onChange={f("fk_comodato")} required options={comodatos.map(c => ({ value: c.pk_comodato, label: `#${c.pk_comodato} — ${c.nombre_comodatario}` }))} />
            <F label="Maquinaria Entregada" type="select" value={form.fk_maquinaria} onChange={selMaq} options={maquinas.map(m => ({ value: m.pk_maquinaria, label: `${m.numero_economico} — ${m.tipo_equipo} ${m.modelo}` }))} />
            <F label="Fecha y Hora de Entrega" type="datetime-local" value={form.fecha_entrega} onChange={f("fecha_entrega")} required />
            <F label="Nombre del Receptor" value={form.nombre_receptor} onChange={f("nombre_receptor")} required />
            <F label="Cargo del Receptor" value={form.cargo_receptor} onChange={f("cargo_receptor")} />
            <F label="Ubicación / Ejido de Entrega" value={form.ubicacion_entrega} onChange={f("ubicacion_entrega")} />
            <F label="Horas del Horómetro" type="number" value={form.horas_entrega} onChange={f("horas_entrega")} />
            <F label="Registrado por" value={form.registrado_por} onChange={f("registrado_por")} />
          </SecF>
          <SecF titulo="Checklist de Estado del Equipo">
            <F label="Estado del Motor" type="select" value={form.estado_motor} onChange={f("estado_motor")} options={["bueno", "regular", "malo"]} />
            <F label="Estado de Llantas" type="select" value={form.estado_llantas} onChange={f("estado_llantas")} options={["bueno", "regular", "malo"]} />
            <F label="Estado del Asiento" type="select" value={form.estado_asiento} onChange={f("estado_asiento")} options={["bueno", "regular", "malo"]} />
            <F label="Nivel de Combustible" type="select" value={form.nivel_combustible} onChange={f("nivel_combustible")} options={["lleno", "3/4", "1/2", "1/4", "vacío"]} />
            <F label="¿Tiene Rayones?" type="select" value={form.rayones} onChange={v => setForm(p => ({ ...p, rayones: v === "true" }))} options={[{ value: "false", label: "No" }, { value: "true", label: "Sí — detallar" }]} />
          </SecF>
          <F label="Observaciones del Checklist / Descripción de Rayones" type="textarea" value={form.observaciones_checklist} onChange={f("observaciones_checklist")} rows={2} />
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardar}>Guardar Entrega</Btn><Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DEVOLUCIONES
// ═══════════════════════════════════════════════════════
function Devoluciones() {
  const [lista, setLista] = useState([]);
  const [comodatos, setComodatos] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const INIT = { fk_comodato: "", fk_maquinaria: "", numero_economico: "", fecha_devolucion: "", horas_regreso: "", tipo_devolucion: "voluntaria", tiene_danos: false, requiere_mantenimiento: false, estado_cierre: "conforme", estado_motor: "bueno", estado_llantas: "bueno", nivel_combustible: "1/2", rayones_nuevos: false, descripcion_danos: "", observaciones: "", registrado_por: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/devoluciones"), http.get("/comodatos"), http.get("/maquinaria")])
      .then(([d, c, m]) => { setLista(Array.isArray(d) ? d : []); setComodatos(Array.isArray(c) ? c.filter(x => x.estado === "activo") : []); setMaquinas(Array.isArray(m) ? m.filter(x => x.estado_operativo === "prestada") : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const selMaq = id => {
    const m = maquinas.find(x => x.pk_maquinaria == id);
    if (m) setForm(p => ({ ...p, fk_maquinaria: id, numero_economico: m.numero_economico }));
    else setForm(p => ({ ...p, fk_maquinaria: id }));
  };

  const guardar = async () => {
    if (!form.fk_comodato || !form.fecha_devolucion) return alert("Complete los campos obligatorios.");
    try { await http.post("/devoluciones", form); setModal(false); setForm(INIT); cargar(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <PageHeader titulo="Devoluciones de Maquinaria" sub="Registro de devolución con checklist comparativo"
        accion={<Btn onClick={() => setModal(true)}>↩ Registrar Devolución</Btn>} />
      <Card>
        <Tabla loading={loading} cols={["Comodato", "Equipo", "Fecha Devolución", "Horas Regreso", "Tipo", "Daños", "Cierre"]}
          vacia="No hay devoluciones registradas."
          filas={lista.map(d => [
            <span style={{ fontSize: 12, color: textoS }}>{`#${d.fk_comodato}`}</span>,
            <strong style={{ color: verde }}>{d.numero_economico || "—"}</strong>,
            <span style={{ fontSize: 12 }}>{d.fecha_devolucion?.split("T")[0]}</span>,
            <span style={{ fontWeight: 600 }}>{d.horas_regreso} h</span>,
            estadoBadge(d.tipo_devolucion),
            d.tiene_danos ? <Badge txt="CON DAÑOS" color={rojo} bg={rojoC} /> : <Badge txt="SIN DAÑOS" color={verde} bg={verdeClaro} />,
            estadoBadge(d.estado_cierre)
          ])} />
      </Card>
      {modal && (
        <Modal titulo="Registrar Devolución de Maquinaria" sub="Checklist comparativo con la entrega" onClose={() => setModal(false)} ancho={740}>
          <SecF titulo="Datos de la Devolución">
            <F label="Comodato" type="select" value={form.fk_comodato} onChange={f("fk_comodato")} required options={comodatos.map(c => ({ value: c.pk_comodato, label: `#${c.pk_comodato} — ${c.nombre_comodatario}` }))} />
            <F label="Maquinaria" type="select" value={form.fk_maquinaria} onChange={selMaq} options={maquinas.map(m => ({ value: m.pk_maquinaria, label: `${m.numero_economico} — ${m.tipo_equipo} ${m.modelo}` }))} />
            <F label="Fecha y Hora de Devolución" type="datetime-local" value={form.fecha_devolucion} onChange={f("fecha_devolucion")} required />
            <F label="Horas del Horómetro al Regresar" type="number" value={form.horas_regreso} onChange={f("horas_regreso")} />
            <F label="Tipo de Devolución" type="select" value={form.tipo_devolucion} onChange={f("tipo_devolucion")} options={[{ value: "voluntaria", label: "Voluntaria" }, { value: "recuperacion", label: "Recuperación Forzosa" }]} />
            <F label="Estado de Cierre" type="select" value={form.estado_cierre} onChange={f("estado_cierre")} options={[{ value: "conforme", label: "Conforme — sin daños" }, { value: "con_danos", label: "Con daños" }, { value: "garantia", label: "Garantía del fabricante" }, { value: "taller_externo", label: "Taller externo" }]} />
            <F label="¿Presenta Daños Nuevos?" type="select" value={form.tiene_danos} onChange={v => setForm(p => ({ ...p, tiene_danos: v === "true" }))} options={[{ value: "false", label: "No — equipo en buen estado" }, { value: "true", label: "Sí — tiene daños nuevos" }]} />
            <F label="Registrado por" value={form.registrado_por} onChange={f("registrado_por")} />
          </SecF>
          <SecF titulo="Estado al Regresar">
            <F label="Estado del Motor" type="select" value={form.estado_motor} onChange={f("estado_motor")} options={["bueno", "regular", "malo"]} />
            <F label="Estado de Llantas" type="select" value={form.estado_llantas} onChange={f("estado_llantas")} options={["bueno", "regular", "malo"]} />
            <F label="Nivel de Combustible" type="select" value={form.nivel_combustible} onChange={f("nivel_combustible")} options={["lleno", "3/4", "1/2", "1/4", "vacío"]} />
          </SecF>
          {form.tiene_danos === "true" || form.tiene_danos === true ? (
            <div style={{ background: rojoC, border: `1px solid ${rojo}44`, borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: rojo }}>
              ⚠ Se generará automáticamente una falla para atención de mantenimiento.
            </div>
          ) : null}
          <F label="Descripción de Daños / Observaciones" type="textarea" value={form.descripcion_danos} onChange={f("descripcion_danos")} rows={3} />
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardar}>Guardar Devolución</Btn><Btn variante="ghost" onClick={() => setModal(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FALLAS Y MANTENIMIENTO
// ═══════════════════════════════════════════════════════
function FallasMantenimiento() {
  const [fallas, setFallas] = useState([]);
  const [mantos, setMantos] = useState([]);
  const [maq, setMaq] = useState([]);
  const [modalF, setModalF] = useState(false);
  const [modalM, setModalM] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("fallas");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const POR_PAG = 8;

  const INITF = { fk_maquinaria: "", numero_economico: "", tipo: "mecanica", urgencia: "normal", descripcion: "", origen: "comodatos", reportado_por: "", observaciones: "", fecha_reporte: new Date().toISOString().split("T")[0] };
  const INITM = { fk_maquinaria: "", fk_falla: "", numero_economico: "", tipo_manto: "correctivo", descripcion: "", taller: "", tecnico: "", costo_estimado: "", fecha_inicio: "", fecha_fin_estimada: "", repuestos_usados: "", observaciones: "", registrado_por: "" };
  const [formF, setFormF] = useState(INITF);
  const [formM, setFormM] = useState(INITM);
  const ff = k => v => setFormF(p => ({ ...p, [k]: v }));
  const fm = k => v => setFormM(p => ({ ...p, [k]: v }));

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.all([http.get("/fallas"), http.get("/mantenimientos"), http.get("/maquinaria")])
      .then(([f, m, mq]) => { setFallas(Array.isArray(f) ? f : []); setMantos(Array.isArray(m) ? m : []); setMaq(Array.isArray(mq) ? mq : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const selMaqF = id => { const m = maq.find(x => x.pk_maquinaria == id); if (m) setFormF(p => ({ ...p, fk_maquinaria: id, numero_economico: m.numero_economico })); };
  const selMaqM = id => { const m = maq.find(x => x.pk_maquinaria == id); if (m) setFormM(p => ({ ...p, fk_maquinaria: id, numero_economico: m.numero_economico })); };

  const guardarFalla = async () => {
    if (!formF.descripcion) return alert("Escriba la descripción de la falla.");
    try { await http.post("/fallas", formF); setModalF(false); setFormF(INITF); cargar(); }
    catch (e) { alert(e.message); }
  };

  const guardarManto = async () => {
    if (!formM.descripcion) return alert("Escriba la descripción del trabajo.");
    try { await http.post("/mantenimientos", formM); setModalM(false); setFormM(INITM); cargar(); }
    catch (e) { alert(e.message); }
  };

  const terminar = async id => {
    if (!window.confirm("¿Confirma que el mantenimiento fue terminado? El equipo volverá a DISPONIBLE.")) return;
    try { await http.patch(`/mantenimientos/${id}/terminar`, {}); cargar(); }
    catch (e) { alert(e.message); }
  };

  const cambiarEstadoFalla = async (id, estado) => {
    try { await http.patch(`/fallas/${id}/estado`, { estado }); cargar(); }
    catch (e) { alert(e.message); }
  };

  const lista = filtro === "fallas" ? fallas : mantos;
  const filtrada = lista.filter(x => {
    const q = busca.toLowerCase();
    return !q || JSON.stringify(x).toLowerCase().includes(q);
  });
  const pag = filtrada.slice((page - 1) * POR_PAG, page * POR_PAG);

  const statF = (e) => fallas.filter(f => f.estado === e).length;

  return (
    <div>
      <PageHeader titulo="Fallas y Mantenimiento" sub="Registro y seguimiento de fallas, mantenimientos y reparaciones" />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard icon="🔴" label="Fallas Abiertas" valor={statF("pendiente")} color={rojo} bg={rojoC} />
        <StatCard icon="🟡" label="En Proceso" valor={statF("en_proceso")} color={amarillo} bg={amarilloC} />
        <StatCard icon="✅" label="Resueltas" valor={statF("resuelto")} color={verde} bg={verdeClaro} />
        <StatCard icon="🔧" label="Mtos. Programados" valor={mantos.filter(m => m.estado === "programado").length} color={azul} bg={azulC} />
      </div>

      {/* Tabs + botones */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${grisB}`, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {[["fallas", "⚠ Fallas", fallas.length], ["mantos", "🔧 Mantenimientos", mantos.length]].map(([id, lbl, c]) => (
            <button key={id} onClick={() => { setFiltro(id); setPage(1); setBusca(""); }} style={{ padding: "10px 18px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer", borderBottom: filtro === id ? `2px solid ${verde}` : "2px solid transparent", color: filtro === id ? verde : textoS, marginBottom: -2, display: "flex", alignItems: "center", gap: 6 }}>
              {lbl} <span style={{ background: grisB, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{c}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
          <Btn variante="peligro" onClick={() => setModalF(true)}>⚠ Reportar Falla</Btn>
          <Btn onClick={() => setModalM(true)}>🔧 Orden de Manto.</Btn>
        </div>
      </div>

      <input value={busca} onChange={e => { setBusca(e.target.value); setPage(1); }} placeholder="🔍  Buscar por equipo, descripción o tipo..." style={{ width: "100%", padding: "9px 14px", fontSize: 13, border: `1.5px solid ${grisB}`, borderRadius: 8, outline: "none", marginBottom: 14 }} />

      <Card>
        {filtro === "fallas"
          ? <Tabla loading={loading} cols={["Folio", "Equipo", "Tipo", "Descripción", "Urgencia", "Estado", "Fecha", "Acciones"]}
              vacia="Sin fallas reportadas. ✓"
              filas={pag.map(fa => [
                <span style={{ fontSize: 11, color: textoS }}>FAL-{fa.pk_falla}</span>,
                <strong>{fa.numero_economico || `#${fa.fk_maquinaria}`}</strong>,
                fa.tipo,
                <span style={{ fontSize: 12 }}>{fa.descripcion?.substring(0, 45)}{fa.descripcion?.length > 45 ? "..." : ""}</span>,
                estadoBadge(fa.urgencia),
                estadoBadge(fa.estado),
                <span style={{ fontSize: 12, color: textoS }}>{fa.fecha_reporte}</span>,
                <div style={{ display: "flex", gap: 4 }}>
                  {fa.estado === "pendiente" && <Btn size="sm" variante="ghost" onClick={() => cambiarEstadoFalla(fa.pk_falla, "en_proceso")}>→ Proceso</Btn>}
                  {fa.estado === "en_proceso" && <Btn size="sm" onClick={() => cambiarEstadoFalla(fa.pk_falla, "resuelto")}>✓</Btn>}
                </div>
              ])} />
          : <Tabla loading={loading} cols={["Folio", "Equipo", "Tipo", "Descripción", "Taller", "Costo", "Inicio", "Estado", "Acciones"]}
              vacia="Sin órdenes de mantenimiento."
              filas={pag.map(m => [
                <span style={{ fontSize: 11, color: textoS }}>MTO-{m.pk_mantenimiento}</span>,
                <strong>{m.numero_economico || `#${m.fk_maquinaria}`}</strong>,
                m.tipo_manto,
                <span style={{ fontSize: 12 }}>{m.descripcion?.substring(0, 40)}{m.descripcion?.length > 40 ? "..." : ""}</span>,
                <span style={{ fontSize: 12 }}>{m.taller || "—"}</span>,
                m.costo_estimado ? <span style={{ fontSize: 12, fontWeight: 600 }}>${Number(m.costo_estimado).toLocaleString()}</span> : "—",
                <span style={{ fontSize: 12, color: textoS }}>{m.fecha_inicio || "—"}</span>,
                estadoBadge(m.estado),
                m.estado !== "terminado" && m.estado !== "cancelado"
                  ? <Btn size="sm" onClick={() => terminar(m.pk_mantenimiento)}>✓ Terminado</Btn>
                  : null
              ])} />
        }
        <Pager page={page} total={filtrada.length} perPage={POR_PAG} onChange={setPage} />
      </Card>

      {/* Modal Falla */}
      {modalF && (
        <Modal titulo="Reporte de Falla o Daño en Equipo" sub="C.R.E.A.N. — Registro obligatorio" onClose={() => setModalF(false)}>
          <SecF titulo="Equipo Afectado">
            <F label="Maquinaria" type="select" value={formF.fk_maquinaria} onChange={selMaqF} options={maq.map(m => ({ value: m.pk_maquinaria, label: `${m.numero_economico} — ${m.tipo_equipo} ${m.modelo}` }))} />
            <F label="Fecha del Reporte" type="date" value={formF.fecha_reporte} onChange={ff("fecha_reporte")} />
            <F label="Tipo de Falla" type="select" value={formF.tipo} onChange={ff("tipo")} options={[{ value: "mecanica", label: "Mecánica" }, { value: "electrica", label: "Eléctrica" }, { value: "hidraulica", label: "Hidráulica" }, { value: "dano_fisico", label: "Daño Físico" }, { value: "motor", label: "Motor" }, { value: "llantas", label: "Llantas" }, { value: "dano_devolucion", label: "Daño en Devolución" }, { value: "otro", label: "Otro" }]} />
            <F label="Nivel de Urgencia" type="select" value={formF.urgencia} onChange={ff("urgencia")} options={[{ value: "alta", label: "ALTA — Equipo fuera de servicio" }, { value: "normal", label: "Normal" }, { value: "baja", label: "Baja — puede esperar" }]} />
            <F label="Origen del Reporte" type="select" value={formF.origen} onChange={ff("origen")} options={[{ value: "comodatos", label: "Comodato" }, { value: "traslado", label: "Traslado" }, { value: "operacion", label: "Operación en campo" }, { value: "devolucion", label: "Devolución de equipo" }]} />
            <F label="Reportado por" value={formF.reportado_por} onChange={ff("reportado_por")} />
          </SecF>
          <F label="Descripción Detallada de la Falla" type="textarea" value={formF.descripcion} onChange={ff("descripcion")} required rows={3} />
          <F label="Observaciones Adicionales" type="textarea" value={formF.observaciones} onChange={ff("observaciones")} rows={2} />
          <div style={{ display: "flex", gap: 8 }}><Btn variante="peligro" onClick={guardarFalla}>Guardar Reporte</Btn><Btn variante="ghost" onClick={() => setModalF(false)}>Cancelar</Btn></div>
        </Modal>
      )}

      {/* Modal Mantenimiento */}
      {modalM && (
        <Modal titulo="Orden de Mantenimiento" sub="C.R.E.A.N. — Dirección de Módulos de Maquinaria" onClose={() => setModalM(false)}>
          <SecF titulo="Equipo y Origen">
            <F label="Maquinaria" type="select" value={formM.fk_maquinaria} onChange={selMaqM} options={maq.map(m => ({ value: m.pk_maquinaria, label: `${m.numero_economico} — ${m.tipo_equipo} ${m.modelo}` }))} />
            <F label="Falla Relacionada (opcional)" type="select" value={formM.fk_falla} onChange={fm("fk_falla")} options={fallas.filter(f => f.estado !== "resuelto").map(f => ({ value: f.pk_falla, label: `FAL-${f.pk_falla} — ${f.tipo} ${f.numero_economico || ""}` }))} />
            <F label="Tipo de Mantenimiento" type="select" value={formM.tipo_manto} onChange={fm("tipo_manto")} options={[{ value: "correctivo", label: "Correctivo" }, { value: "preventivo", label: "Preventivo" }, { value: "garantia", label: "Garantía" }, { value: "externo", label: "Taller Externo" }]} />
            <F label="Registrado por" value={formM.registrado_por} onChange={fm("registrado_por")} />
          </SecF>
          <SecF titulo="Datos del Servicio">
            <F label="Taller / Proveedor" value={formM.taller} onChange={fm("taller")} />
            <F label="Técnico Responsable" value={formM.tecnico} onChange={fm("tecnico")} />
            <F label="Fecha de Inicio" type="date" value={formM.fecha_inicio} onChange={fm("fecha_inicio")} />
            <F label="Fecha Estimada de Entrega" type="date" value={formM.fecha_fin_estimada} onChange={fm("fecha_fin_estimada")} />
            <F label="Costo Estimado ($)" type="number" value={formM.costo_estimado} onChange={fm("costo_estimado")} />
          </SecF>
          <F label="Trabajo a Realizar" type="textarea" value={formM.descripcion} onChange={fm("descripcion")} required rows={3} />
          <F label="Refacciones / Repuestos Necesarios" type="textarea" value={formM.repuestos_usados} onChange={fm("repuestos_usados")} rows={2} />
          <F label="Observaciones" type="textarea" value={formM.observaciones} onChange={fm("observaciones")} rows={2} />
          <div style={{ display: "flex", gap: 8 }}><Btn onClick={guardarManto}>Emitir Orden</Btn><Btn variante="ghost" onClick={() => setModalM(false)}>Cancelar</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DOCUMENTOS OFICIALES
// ═══════════════════════════════════════════════════════
function Documentos() {
  const [tipo, setTipo] = useState("autorizacion");
  const [comodatos, setComodatos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const TIPOS = [{ v: "autorizacion", l: "Autorización de Salida" }, { v: "guia", l: "Guía de Traslado" }, { v: "recepcion", l: "Recibo de Recepción" }, { v: "comodato", l: "Oficio de Comodato" }];
  const INIT = { folio: "", fecha: new Date().toISOString().split("T")[0], fk_comodato: "", descripcion_maquinaria: "1 (UNO) TRACTOR MARCA NEW HOLLAND, MODELO 7610S 4WD, CON NÚMERO ECONÓMICO T040, NÚMERO DE SERIE S508874M Y NÚMERO DE MOTOR 8123519, CON 1,050 HORAS REGISTRADAS EN EL HORÓMETRO, COLOR VERDE.", origen: "INSTALACIONES DEL C.R.E.A.N. EN SANTIAGO IXCUINTLA, NAYARIT. KM. 2 CARRETERA SANTIAGO ENTRONQUE CARRETERA INTERNACIONAL 15.", destino: "", municipio_destino: "", observaciones: "", nombre_productor: "", municipio_productor: "", localidad_productor: "", solicita_nombre: "ING. JUAN ANTONIO CARLOS SILVA", solicita_cargo: "DIRECTOR DE MÓDULOS DE MAQUINARIA", solicita_tel: "311 847 5940", autoriza_nombre: "L.A.P. CLEMENTE ULLOA ARTEAGA", autoriza_cargo: "DIRECTOR DE DISTRITOS Y ENCARGADO DEL C.R.E.A.N.", autoriza_tel: "311 163 2913", recibe_nombre: "", recibe_cargo: "", operador_nombre: "", operador_tel: "", motivo: "", horas_entrega: "", horas_devolucion: "", dias_prestamo: "", num_beneficiarios: "", cultivo: "", superficie_ha: "" };
  const [form, setForm] = useState(INIT);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { http.get("/comodatos").then(d => setComodatos(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  const fechaL = d => { const dt = d ? new Date(d + "T12:00:00") : new Date(); const M = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]; return `${dt.getDate()} DE ${M[dt.getMonth()]} DE ${dt.getFullYear()}`; };

  const guardarBD = async () => {
    if (!form.folio) return alert("Ingrese el número de folio.");
    setGuardando(true);
    const tm = { autorizacion: "autorizacion_salida", guia: "guia_traslado", recepcion: "recibo_recepcion", comodato: "oficio_comodato" };
    try { await http.post("/documentos", { fk_comodato: form.fk_comodato || null, tipo_documento: tm[tipo], numero_folio: `CREAN/MAQ/${form.folio}`, fecha_documento: form.fecha, contenido_json: form, estado: "emitido", registrado_por: form.solicita_nombre }); alert("Documento guardado en la base de datos."); }
    catch (e) { alert("Error: " + e.message); }
    setGuardando(false);
  };

  const p = form;
  const docCSS = `<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:16px}.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #166534;padding-bottom:8px;margin-bottom:10px}.tit{text-align:center;font-size:13px;font-weight:700;text-transform:uppercase;border:2px solid #166534;padding:8px;margin:10px 0;background:#dcfce7;letter-spacing:0.04em}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #999;padding:5px 7px;font-size:10px;vertical-align:top}th{background:#166534;color:#fff;font-weight:700;text-transform:uppercase;font-size:9px;letter-spacing:0.03em}.fl{border:none;border-bottom:1px solid #666;min-height:18px;padding:2px 0;margin:4px 0;font-size:10px}.fb{display:inline-block;width:32%;text-align:center;vertical-align:top;padding:0 4px}.fn{font-weight:700;font-size:10px;margin-top:30px;border-top:1px solid #333;padding-top:4px;margin-bottom:1px}.fc{font-size:9px;color:#4a4740}.pie{font-size:9px;text-align:center;color:#5a5a5a;border-top:1px solid #ccc;padding-top:8px;margin-top:12px}</style>`;
  const hdr = `<div class="hdr"><div><div style="font-size:13px;font-weight:700;color:#166534">Nayarit</div><div style="font-size:9px;color:#4a4740;text-transform:uppercase;letter-spacing:0.05em">Secretaría de Desarrollo Rural</div></div><div style="text-align:right;font-size:10px;color:#4a4740">C.R.E.A.N. – Maquinaria</div></div>`;
  const pie = `<div class="pie">Dirección de Módulos de Maquinaria · Instalaciones del C.R.E.A.N., Km. 2 Carretera Santiago entronque Carretera Internacional, C.P. 63300</div>`;

  const docHTML = () => {
    if (tipo === "autorizacion") return docCSS + `<div>${hdr}<div style="text-align:right;font-size:10px;color:#4a4740;margin-bottom:4px">NÚMERO: <strong>CREAN/MAQ/${p.folio}</strong><br>FECHA: ${fechaL(p.fecha)}</div><div class="tit">Autorización para Salida de Maquinaria, Equipo, Implementos y/o Accesorios de las Instalaciones del C.R.E.A.N.</div><table><tr><th>Descripción del bien que se autoriza a salir</th></tr><tr><td>${p.descripcion_maquinaria}</td></tr></table><table><tr><th>Referencia y/o Observaciones</th></tr><tr><td>${p.motivo || p.observaciones || "&nbsp;"}</td></tr></table><div style="display:flex;justify-content:space-around;margin-top:10px"><div class="fb"><div class="fn">${p.solicita_nombre}</div><div class="fc">${p.solicita_cargo}</div><div class="fc">TEL: ${p.solicita_tel}</div></div><div class="fb"><div class="fn">${p.autoriza_nombre}</div><div class="fc">${p.autoriza_cargo}</div><div class="fc">TEL: ${p.autoriza_tel}</div></div><div class="fb"><div class="fn">${p.recibe_nombre || "______________________"}</div><div class="fc">${p.recibe_cargo || p.municipio_productor || "PRODUCTOR"}</div></div></div>${pie}</div>`;
    if (tipo === "guia") return docCSS + `<div>${hdr}<div style="text-align:right;font-size:10px">FOLIO: <strong>CREAN/MAQ/${p.folio}</strong> &nbsp; FECHA: ${fechaL(p.fecha)}</div><div class="tit">Guía de Traslado de Maquinaria y Equipo</div><p style="font-size:10px;margin:4px 0"><strong>ORIGEN:</strong> ${p.origen}</p><table><tr><th style="width:60%">Descripción de la Maquinaria y Equipo</th><th>Destino</th></tr><tr><td>${p.descripcion_maquinaria}</td><td><strong>${p.destino}</strong><br>${p.municipio_destino}</td></tr></table><table><tr><th>Datos de la Unidad de Transporte</th></tr><tr><td>${p.observaciones || "SE TRASLADA POR SUS PROPIOS MEDIOS"}</td></tr></table><table><tr><th colspan="2">Datos del Operador</th></tr><tr><td><strong>${p.operador_nombre || "_____________________"}</strong></td><td>TEL: ${p.operador_tel || "_____________"}</td></tr></table><div style="display:flex;justify-content:space-around;margin-top:10px"><div class="fb"><div class="fn">${p.autoriza_nombre}</div><div class="fc">AUTORIZÓ</div></div><div class="fb"><div class="fn">${p.operador_nombre || "______________________"}</div><div class="fc">OPERADOR DE LA UNIDAD</div></div></div><div style="margin-top:14px;border:1px solid #999;padding:8px"><div style="font-weight:700;font-size:10px;margin-bottom:4px">RECEPCIÓN EN EL LUGAR DE DESTINO:</div><div class="fl">FECHA: _________ &nbsp; HORA: _________</div><div class="fl">NOMBRE: ___________________________ &nbsp; CARGO: _______________</div><div class="fl">FIRMA: ___________________________</div></div>${pie}</div>`;
    if (tipo === "recepcion") return docCSS + `<div>${hdr}<div style="text-align:right;font-size:10px">NÚMERO: <strong>CREAN/MAQ/${p.folio}</strong><br>FECHA: ${fechaL(p.fecha)}</div><div class="tit">Recibo de Recepción de Maquinaria y Equipo Prestado</div><table><tr><th>Descripción del Bien que se Recibe</th></tr><tr><td>${p.descripcion_maquinaria}</td></tr></table><p style="margin:10px 0;font-size:10px;line-height:1.6">RECIBIMOS DEL <strong>C. ${p.nombre_productor || "___________________________"}</strong>, ${p.recibe_cargo || "PRODUCTOR"} DE LA LOCALIDAD DE <strong>${p.localidad_productor || p.municipio_productor || "________________"}</strong>, MUNICIPIO DE <strong>${p.municipio_productor || "________________"}</strong>, EL EQUIPO DETALLADO EN EL RECUADRO ANTERIOR, CON NÚMERO DE FOLIO <strong>CREAN/MAQ/${p.folio || "______"}</strong>, CON FECHA <strong>${fechaL(p.fecha)}</strong>. ${p.motivo}</p><div style="display:flex;justify-content:space-around;margin-top:10px"><div class="fb"><div class="fn">${p.nombre_productor || "______________________"}</div><div class="fc">${p.recibe_cargo || "PRODUCTOR"}</div><div class="fc">MUNICIPIO DE ${p.municipio_productor}</div></div><div class="fb"><div class="fn">${p.solicita_nombre}</div><div class="fc">${p.solicita_cargo}</div></div></div>${pie}</div>`;
    if (tipo === "comodato") return docCSS + `<div>${hdr}<div style="text-align:right;font-size:10px">NÚMERO: <strong>CREAN/MAQ/${p.folio}</strong><br>FECHA: ${fechaL(p.fecha)}</div><div class="tit">Oficio de Comodato — Préstamo de Maquinaria Agrícola</div><table><tr><th colspan="4">Datos del Comodatario</th></tr><tr><td><strong>Nombre:</strong> ${p.nombre_productor}</td><td><strong>Municipio:</strong> ${p.municipio_productor}</td><td><strong>Ejido:</strong> ${p.localidad_productor}</td><td><strong>Cultivo:</strong> ${p.cultivo}</td></tr><tr><td><strong>Superficie:</strong> ${p.superficie_ha} ha</td><td><strong>Beneficiarios:</strong> ${p.num_beneficiarios}</td><td colspan="2"></td></tr></table><table><tr><th>Maquinaria y Equipo en Comodato</th></tr><tr><td>${p.descripcion_maquinaria}</td></tr></table><table><tr><th>Fecha de Entrega</th><th>Días de Préstamo</th><th>Horómetro Entrega</th><th>Horómetro Devolución</th></tr><tr><td>${fechaL(p.fecha)}</td><td>${p.dias_prestamo} días</td><td>${p.horas_entrega} h</td><td>${p.horas_devolucion} h</td></tr></table><p style="font-size:9px;margin:8px 0;font-style:italic">${p.observaciones || "El comodatario se compromete a utilizar el equipo únicamente para las actividades señaladas, a devolverlo en las mismas condiciones en que fue recibido y en el plazo establecido."}</p><div style="display:flex;justify-content:space-around;margin-top:10px"><div class="fb"><div class="fn">${p.autoriza_nombre}</div><div class="fc">${p.autoriza_cargo}</div></div><div class="fb"><div class="fn">${p.nombre_productor || "______________________"}</div><div class="fc">COMODATARIO — MUNICIPIO DE ${p.municipio_productor}</div></div></div>${pie}</div>`;
    return "<p>Seleccione tipo.</p>";
  };


  
  return (
    
    <div>
      <PageHeader titulo="Documentos Oficiales" sub="Genere, edite e imprima documentos oficiales del C.R.E.A.N." />

      {/* Selector tipo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TIPOS.map(t => (
          <button key={t.v} onClick={() => setTipo(t.v)} style={{ padding: "9px 18px", fontSize: 13, fontWeight: 600, borderRadius: 8, border: `1.5px solid ${tipo === t.v ? verde : grisB}`, background: tipo === t.v ? verdeClaro : blanco, color: tipo === t.v ? verde : texto, cursor: "pointer" }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Formulario */}
        <Card>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${grisB}`, background: grisF }}>
            <p style={{ fontSize: 13, fontWeight: 700 }}>Datos del Documento</p>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <F label="Número de Folio" value={form.folio} onChange={f("folio")} required placeholder="033/2026" />
              <F label="Fecha del Documento" type="date" value={form.fecha} onChange={f("fecha")} />
              <F label="Comodato Relacionado (opcional)" type="select" value={form.fk_comodato} onChange={f("fk_comodato")} options={comodatos.map(c => ({ value: c.pk_comodato, label: `#${c.pk_comodato} — ${c.nombre_comodatario}` }))} />
            </div>
            <F label="Descripción de la Maquinaria y Equipo" type="textarea" value={form.descripcion_maquinaria} onChange={f("descripcion_maquinaria")} rows={3} />
            {(tipo === "autorizacion" || tipo === "comodato" || tipo === "recepcion") && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: verde, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${grisB}` }}>Datos del Productor / Comodatario</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                  <F label="Nombre" value={form.nombre_productor} onChange={f("nombre_productor")} />
                  <F label="Municipio" value={form.municipio_productor} onChange={f("municipio_productor")} />
                  <F label="Ejido / Localidad" value={form.localidad_productor} onChange={f("localidad_productor")} />
                  <F label="Cargo / Descripción" value={form.recibe_cargo} onChange={f("recibe_cargo")} placeholder="PRODUCTOR DE TABACO" />
                </div>
                <F label="Motivo / Referencia" type="textarea" value={form.motivo} onChange={f("motivo")} rows={2} />
              </>
            )}
            {tipo === "comodato" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <F label="Cultivo" value={form.cultivo} onChange={f("cultivo")} />
                <F label="Superficie (ha)" type="number" value={form.superficie_ha} onChange={f("superficie_ha")} />
                <F label="Beneficiarios" type="number" value={form.num_beneficiarios} onChange={f("num_beneficiarios")} />
                <F label="Días de Préstamo" type="number" value={form.dias_prestamo} onChange={f("dias_prestamo")} />
                <F label="Horómetro Entrega (h)" type="number" value={form.horas_entrega} onChange={f("horas_entrega")} />
                <F label="Horómetro Devolución (h)" type="number" value={form.horas_devolucion} onChange={f("horas_devolucion")} />
              </div>
            )}
            {tipo === "guia" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <F label="Destino (Ejido / Rancho)" value={form.destino} onChange={f("destino")} />
                <F label="Municipio de Destino" value={form.municipio_destino} onChange={f("municipio_destino")} />
                <F label="Nombre del Operador" value={form.operador_nombre} onChange={f("operador_nombre")} />
                <F label="Teléfono del Operador" value={form.operador_tel} onChange={f("operador_tel")} />
                <F label="Tipo de Transporte / Notas" value={form.observaciones} onChange={f("observaciones")} placeholder="Se traslada por sus propios medios..." />
              </div>
            )}
            <p style={{ fontSize: 11, fontWeight: 700, color: verde, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${grisB}` }}>Datos para Firmas</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <F label="Nombre — Solicita / Entrega" value={form.solicita_nombre} onChange={f("solicita_nombre")} />
              <F label="Cargo" value={form.solicita_cargo} onChange={f("solicita_cargo")} />
              <F label="Nombre — Autoriza" value={form.autoriza_nombre} onChange={f("autoriza_nombre")} />
              <F label="Cargo" value={form.autoriza_cargo} onChange={f("autoriza_cargo")} />
              <F label="Nombre — Recibe" value={form.recibe_nombre} onChange={f("recibe_nombre")} />
            </div>
            
          </div>
        </Card>

        {/* Vista previa */}
        <Card>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${grisB}`, background: "#111827", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: blanco }}>Vista Previa del Documento Oficial</p>
          </div>
          <div style={{ padding: 12, background: "#e5e7eb", minHeight: 500 }}>
            <div style={{ background: blanco, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", minHeight: 460, overflowY: "auto", maxHeight: 640 }}
              dangerouslySetInnerHTML={{ __html: docHTML() }} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function App() {
  const [seccion, setSeccion] = useState("dashboard");
  const label = MENU.find(m => m.id === seccion)?.label || "";

  const vistas = {
    dashboard: <Dashboard irA={setSeccion} />,
    inventario: <Inventario />,
    solicitudes: <Solicitudes />,
    comodatos: <Comodatos />,
    traslados: <Traslados />,
    entregas: <Entregas />,
    devoluciones: <Devoluciones />,
    fallas: <FallasMantenimiento />,
    documentos: <Documentos />,
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar seccion={seccion} onChange={setSeccion} />
        <div style={{ flex: 1, marginLeft: 230, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Topbar titulo={label} />
          <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
            {vistas[seccion]}
          </main>
        </div>
      </div>
    </>
  );
}
