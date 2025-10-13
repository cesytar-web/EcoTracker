import React, { useState, useEffect } from "react";
import UsuarioList from "./components/UsuarioList";
import AccionList from "./components/AccionList";
import EstadisticasUsuarios from "./EstadisticasUsuarios";
import HistoricoUsuarios from "./components/HistoricoUsuarios";
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

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/usuarios");
      const data = await res.json();
      setUsuarios(data || []);
      console.log("Usuarios cargados:", data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Registrar usuario con contraseña
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
    <ErrorBoundary>
      <div
        style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}
      >
        <h1> EcoTracker </h1>
        {vista === "lista" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2> Registrar Usuario </h2>{" "}
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
              <input
                type="password"
                placeholder="Contraseña"
                value={nuevoUsuario.password}
                onChange={(e) =>
                  setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                }
              />{" "}
              <button className="registrarse" onClick={registrarUsuario}>
                Registrar{" "}
              </button>{" "}
            </div>
            <button
              className="agregar"
              onClick={() => setVista("estadisticas")}
            >
              Ver estadísticas{" "}
            </button>
            <h2> Lista de Usuarios </h2>{" "}
            <UsuarioList
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              seleccionarUsuario={seleccionarUsuario}
            />{" "}
          </>
        )}
        {vista === "estadisticas" && (
          <div style={{ width: "100%", height: 450 }}>
            <EstadisticasUsuarios usuarios={usuarios} />{" "}
            <button className="volver" onClick={volver}>
              Volver a la lista de usuarios{" "}
            </button>{" "}
          </div>
        )}
        {vista === "acciones" && usuarioSeleccionado && (
          <>
            <h2> Acciones de {usuarioSeleccionado.nombre} </h2>{" "}
            <p>
              <strong>
                {" "}
                Puntuación: {Number(usuarioSeleccionado.puntuacion) || 0}{" "}
              </strong>{" "}
            </p>{" "}
            <p>
              <strong>
                Nivel:{" "}
                {calcularNivel(Number(usuarioSeleccionado.puntuacion) || 0)}{" "}
              </strong>{" "}
            </p>{" "}
            <button onClick={compartirLogros}> 📤Compartir mis logros </button>{" "}
            <AccionList
              usuarioId={usuarioSeleccionado._id}
              onNuevaAccion={manejarNuevaAccion}
            />{" "}
            <HistoricoUsuarios acciones={accionesDelUsuario} />{" "}
            <button className="volver" onClick={volver}>
              Volver a la lista de usuarios{" "}
            </button>{" "}
          </>
        )}{" "}
      </div>{" "}
    </ErrorBoundary>
  );
};

export default App;
