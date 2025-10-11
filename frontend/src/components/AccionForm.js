import React, { useState } from "react";
import { API } from "../api";

const AccionForm = ({ usuarioId, fetchAcciones }) => {
  const [descripcion, setDescripcion] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const handleAgregarAccion = async (e) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      setMensajeError("La descripción no puede estar vacía");
      return;
    }

    try {
      // Guardar acción
      const res = await API.post("/acciones", { usuarioId, descripcion });
      if (res.status === 201) {
        setDescripcion("");
        fetchAcciones();

        // Incrementar puntuación del usuario automáticamente
        await API.put(`/usuarios/${usuarioId}/puntuacion`, { puntos: 1 });
      }
    } catch (err) {
      console.error("Error al guardar la acción:", err);
      setMensajeError("Error al guardar la acción");
    }
  };

  return (
    <form onSubmit={handleAgregarAccion} style={{ marginBottom: "15px" }}>
      {" "}
      {mensajeError && <p style={{ color: "red" }}> {mensajeError} </p>}{" "}
      <input
        type="text"
        placeholder="Descripción de la acción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={{
          padding: "6px",
          width: "70%",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />{" "}
      <button
        type="submit"
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#4caf50",
          color: "white",
          cursor: "pointer",
        }}
      >
        Agregar Acción{" "}
      </button>{" "}
    </form>
  );
};

export default AccionForm;
