import React, { useState } from "react";

const calcularNivel = (puntuacion) => {
  if (puntuacion >= 100) return "Experto 🌿";
  if (puntuacion >= 50) return "Intermedio 🌱";
  if (puntuacion >= 20) return "Principiante 🍃";
  return "Novato 🐛";
};

const UsuarioList = ({ usuarios, setUsuarios, seleccionarUsuario }) => {
  const [pagina, setPagina] = useState(1);
  const usuariosPorPagina = 3;
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
  const indexUltimoUsuario = pagina * usuariosPorPagina;
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosActuales = usuarios.slice(
    indexPrimerUsuario,
    indexUltimoUsuario
  );

  const deleteUsuario = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/usuarios/${id}`, {
        method: "DELETE",
      });
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
  };

  return (
    <div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {" "}
        {usuariosActuales.map((usuario) => (
          <li
            key={usuario._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              background: "#f5f5f5",
              padding: "8px",
              borderRadius: "6px",
            }}
          >
            <div style={{ flex: 1 }}>
              <strong> {String(usuario.nombre)} </strong> -{" "}
              {String(usuario.email)} <br />
              Puntuación: {Number(usuario.puntuacion) || 0} | Nivel:{" "}
              {calcularNivel(Number(usuario.puntuacion) || 0)}{" "}
            </div>{" "}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className="ver-acciones"
                onClick={() => seleccionarUsuario(usuario)}
              >
                Ver Acciones{" "}
              </button>{" "}
              <button
                className="eliminar"
                onClick={() => deleteUsuario(usuario._id)}
              >
                Eliminar{" "}
              </button>{" "}
            </div>{" "}
          </li>
        ))}{" "}
      </ul>{" "}
      {totalPaginas > 1 && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center",
          }}
        >
            <button
              className="btn-prev"
              onClick={() => setPagina((p) => Math.max(p - 1, 1))}
              disabled={pagina === 1}
            >
              Anterior
            </button>
          <span>
            Página {pagina}
            de {totalPaginas}{" "}
          </span>{" "}
            <button
              className="btn-next"
              onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
              disabled={pagina === totalPaginas}
            >
              Siguiente
            </button>
        </div>
      )}{" "}
    </div>
  );
};

export default UsuarioList;
