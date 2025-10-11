import React, { useState, useEffect } from "react";
import UsuarioList from "./components/UsuarioList";
import AccionList from "./components/AccionList";
import EstadisticasUsuarios from "./EstadisticasUsuarios";
import HistoricoUsuarios from "./components/HistoricoUsuarios";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// 🔹 Función para calcular nivel según puntuación
const calcularNivel = (puntuacion) => {
  if (puntuacion >= 100) return "Experto 🌿";
  if (puntuacion >= 50) return "Intermedio 🌱";
  if (puntuacion >= 20) return "Principiante 🍃";
  return "Novato 🐛";
};

// 🔹 Notificaciones
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
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", email: "" });

  // 🔹 Cargar usuarios
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

  // 🔹 Agregar usuario
  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
      return alert("Completa todos los campos");
    }
    try {
      const res = await fetch("http://localhost:5000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarios([...usuarios, data]);
        setNuevoUsuario({ nombre: "", email: "" });
        notificar("EcoTracker", `Usuario ${data.nombre} agregado con éxito 🌱`);
      } else {
        alert(data.message || "Error al agregar usuario");
      }
    } catch (err) {
      console.error("Error al agregar usuario:", err);
    }
  };

  // 🔹 Seleccionar usuario
  const seleccionarUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setVista("acciones");
    await cargarAcciones(usuario._id);
  };

  // 🔹 Cargar acciones
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

  // 🔹 Volver a lista
  const volver = () => {
    setUsuarioSeleccionado(null);
    setVista("lista");
    setAccionesDelUsuario([]);
  };

  // 🔹 Compartir logros
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

  // 🔹 Manejar nueva acción agregada
  const manejarNuevaAccion = async () => {
    if (!usuarioSeleccionado) return;
    await cargarAcciones(usuarioSeleccionado._id);
    notificar(
      "EcoTracker",
      `¡Nueva acción registrada para ${usuarioSeleccionado.nombre}! 🌿`
    );
    fetchUsuarios();
  };

  return (
    <div
      style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}
    >
      <h1> EcoTracker </h1>
      {/* ===== LISTA DE USUARIOS ===== */}{" "}
      {vista === "lista" && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h2> Agregar Usuario </h2>{" "}
            <input
              type="text"
              placeholder="Nombre"
              value={nuevoUsuario.nombre}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
              }
            />{" "}
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) =>
                setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
              }
            />{" "}
            <button className="registrarse" onClick={agregarUsuario}>
              Registrar{" "}
            </button>{" "}
          </div>{" "}
          <button className="agregar" onClick={() => setVista("estadisticas")}>
            Ver estadísticas{" "}
          </button>{" "}
          <h2> Lista de Usuarios </h2>{" "}
          <UsuarioList
            usuarios={usuarios}
            setUsuarios={setUsuarios}
            seleccionarUsuario={seleccionarUsuario}
          />{" "}
        </>
      )}
      {/* ===== ESTADÍSTICAS ===== */}{" "}
      {vista === "estadisticas" && (
        <div style={{ width: "100%", height: 450 }}>
          <ErrorBoundary>
            {" "}
            {usuarios && usuarios.length > 0 ? (
              <EstadisticasUsuarios usuarios={usuarios} />
            ) : (
              <p> No hay usuarios disponibles para mostrar estadísticas. </p>
            )}{" "}
          </ErrorBoundary>{" "}
          <button className="volver" onClick={volver}>
            Volver a la lista de usuarios{" "}
          </button>{" "}
        </div>
      )}
      {/* ===== ACCIONES ===== */}{" "}
      {vista === "acciones" && usuarioSeleccionado && (
        <>
          <h2> Acciones de {usuarioSeleccionado.nombre} </h2>{" "}
          <p>
            <strong> Puntuación: {usuarioSeleccionado.puntuacion || 0} </strong>{" "}
          </p>{" "}
          <p>
            <strong>
              {" "}
              Nivel: {calcularNivel(usuarioSeleccionado.puntuacion || 0)}{" "}
            </strong>{" "}
          </p>{" "}
          <button onClick={compartirLogros}> 📤Compartir mis logros </button>{" "}
          <AccionList
            usuarioId={usuarioSeleccionado._id}
            onNuevaAccion={manejarNuevaAccion}
          />{" "}
          <ErrorBoundary>
            <HistoricoUsuarios acciones={accionesDelUsuario} />{" "}
          </ErrorBoundary>{" "}
          <button className="volver" onClick={volver}>
            Volver a la lista de usuarios{" "}
          </button>{" "}
        </>
      )}{" "}
    </div>
  );
};

export default App;
