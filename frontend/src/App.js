import React, { useState, useEffect } from "react";
import UsuarioList from "./components/UsuarioList";
import AccionForm from "./components/AccionForm";
import HistoricoUsuarios from "./components/HistoricoUsuarios";
import EstadisticasUsuarios from "./EstadisticasUsuarios";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const calcularNivel = (puntuacion) => {
  if (puntuacion >= 100) return "Experto 🌿";
  if (puntuacion >= 50) return "Intermedio 🌱";
  if (puntuacion >= 20) return "Principiante 🍃";
  return "Novato 🐛";
};

const notificar = (titulo, mensaje) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(titulo, { body: mensaje });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(titulo, { body: mensaje });
    });
  }
};

const App = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [vista, setVista] = useState("lista");
  const [accionesDelUsuario, setAccionesDelUsuario] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/usuarios");
      const data = await res.json();
      setUsuarios(data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const registrarUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
      return alert("Completa todos los campos (nombre, email y contraseña)");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });

      const data = await res.json();

      if (res.ok) {
        setUsuarios([...usuarios, data.usuario]);
        setNuevoUsuario({ nombre: "", email: "", password: "" });
        notificar("EcoTracker", `Usuario ${data.usuario.nombre} registrado 🌱`);
      } else {
        alert(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      alert("Error al registrar usuario");
    }
  };

  const seleccionarUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setVista("acciones");
    await cargarAcciones(usuario._id);
  };

  const cargarAcciones = async (usuarioId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/acciones?usuarioId=${usuarioId}`
      );
      const data = await res.json();
      setAccionesDelUsuario(data || []);
    } catch (err) {
      console.error("Error al cargar acciones:", err);
      setAccionesDelUsuario([]);
    }
  };

  const actualizarPerfil = async () => {
    try {
      if (!usuarioSeleccionado || !usuarioSeleccionado._id) return;
      const res = await fetch("http://localhost:5000/api/usuarios");
      const data = await res.json();
      setUsuarios(data || []);
      const actualizado = (data || []).find(
        (u) => u._id === usuarioSeleccionado._id || u.id === usuarioSeleccionado._id
      );
      if (actualizado) setUsuarioSeleccionado(actualizado);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
    }
  };

  const volver = () => {
    setUsuarioSeleccionado(null);
    setVista("lista");
    setAccionesDelUsuario([]);
  };

  const compartirLogros = () => {
    if (!usuarioSeleccionado) return;
    const mensaje = `¡Mi puntuación en EcoTracker es ${
      usuarioSeleccionado.puntuacion || 0
    } y soy nivel ${calcularNivel(usuarioSeleccionado.puntuacion || 0)}! 🌱`;
    if (navigator.share) {
      navigator
        .share({ title: "Mis logros en EcoTracker", text: mensaje })
        .catch((err) => console.error("Error al compartir:", err));
    } else {
      alert("Tu navegador no soporta la función de compartir 😢");
    }
  };

  return (
    <ErrorBoundary>
      <div
        style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}
      >
        <h1>EcoTracker</h1>
        {vista === "lista" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2>Registrar Usuario</h2>
              <input
                type="text"
                placeholder="Nombre"
                value={nuevoUsuario.nombre}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={nuevoUsuario.email}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
              />
              <button className="registrarse" onClick={registrarUsuario}>
                Registrar
              </button>
            </div>
            <button className="agregar" onClick={() => setVista("estadisticas")}>
              Ver estadísticas
            </button>
            <h2>Lista de Usuarios</h2>
            <UsuarioList
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              seleccionarUsuario={seleccionarUsuario}
            />
          </>
        )}
        {vista === "estadisticas" && (
          <div style={{ width: "100%", height: 450 }}>
            <EstadisticasUsuarios usuarios={usuarios} />
            <button className="volver" onClick={volver}>
              Volver a la lista de usuarios
            </button>
          </div>
        )}
        {vista === "acciones" && usuarioSeleccionado && (
          <>
            <h2>Acciones de {usuarioSeleccionado.nombre}</h2>
            <p>
              <strong>Puntuación: {Number(usuarioSeleccionado.puntuacion) || 0}</strong>
            </p>
            <p>
              <strong>
                Nivel: {calcularNivel(Number(usuarioSeleccionado.puntuacion) || 0)}
              </strong>
            </p>
            <NivelBarra puntuacion={Number(usuarioSeleccionado.puntuacion) || 0} />
            <button onClick={compartirLogros}>📤 Compartir mis logros</button>
            <AccionForm
              usuarioSeleccionado={usuarioSeleccionado}
              fetchAcciones={() => cargarAcciones(usuarioSeleccionado._id)}
              onAccionAdded={async () => {
                await actualizarPerfil();
                await cargarAcciones(usuarioSeleccionado._id);
              }}
            />
            <HistoricoUsuarios acciones={accionesDelUsuario} />
            <button className="volver" onClick={volver}>
              Volver a la lista de usuarios
            </button>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Barra de progreso de nivel
function NivelBarra({ puntuacion }) {
  const niveles = [
    { nombre: "Novato 🐛", min: 0, max: 19 },
    { nombre: "Principiante 🍃", min: 20, max: 49 },
    { nombre: "Intermedio 🌱", min: 50, max: 99 },
    { nombre: "Experto 🌿", min: 100, max: 199 },
    { nombre: "Plata", min: 200, max: 499 },
    { nombre: "Oro", min: 500, max: 999 },
    { nombre: "EcoLíder", min: 1000, max: 2000 },
  ];
  let actual = niveles[0];
  let siguiente = niveles[1];
  for (let i = 0; i < niveles.length; i++) {
    if (puntuacion >= niveles[i].min && puntuacion <= niveles[i].max) {
      actual = niveles[i];
      siguiente = niveles[i + 1] || niveles[i];
      break;
    }
  }
  const progreso = Math.min(
    100,
    ((puntuacion - actual.min) / (actual.max - actual.min)) * 100
  );
  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span>{actual.nombre}</span>
        <span>{siguiente ? `Próximo: ${siguiente.nombre}` : "Nivel máximo"}</span>
      </div>
      <div style={{ background: "#e0e0e0", borderRadius: 8, height: 18, marginTop: 4 }}>
        <div
          style={{
            width: `${progreso}%`,
            background: "linear-gradient(90deg, #4caf50 60%, #81c784 100%)",
            height: "100%",
            borderRadius: 8,
            transition: "width 0.5s",
          }}
        ></div>
      </div>
      <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
        {progreso.toFixed(1)}% hacia el siguiente nivel
      </div>
    </div>
  );
}

export default App;
