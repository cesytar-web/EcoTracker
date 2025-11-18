import React, { useState } from "react";
import { API } from "../api"; // Asegúrate de que API apunta correctamente a tu backend

const AccionForm = ({ usuarioSeleccionado, fetchAcciones, onAccionAdded }) => {
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Reciclaje"); // valor por defecto
  const [mensajeError, setMensajeError] = useState("");

  const handleAgregarAccion = async (e) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      setMensajeError("La descripción no puede estar vacía");
      return;
    }

    if (!tipo) {
      setMensajeError("Debes seleccionar un tipo de acción");
      return;
    }

    if (!usuarioSeleccionado || !usuarioSeleccionado._id) {
      setMensajeError("No se ha seleccionado un usuario válido");
      return;
    }

    try {
      const res = await API.post("/acciones", {
        usuarioId: usuarioSeleccionado._id,
        descripcion,
        tipo,
      });

      if (res.status === 201 || res.status === 200) {
        setDescripcion("");
        setTipo("Reciclaje");
        setMensajeError("");
        fetchAcciones(); // recarga la lista de acciones
        if (onAccionAdded) onAccionAdded();
      } else {
        setMensajeError("Error al guardar la acción");
      }
    } catch (err) {
      console.error("Error al guardar la acción:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setMensajeError(err.response.data.message);
      } else {
        setMensajeError("Error al guardar la acción");
      }
    }
  };

  return (
    <form onSubmit={handleAgregarAccion} style={{ marginBottom: "15px" }}>
      {" "}
      {mensajeError && <p style={{ color: "red" }}> {mensajeError} </p>}
      <input
        type="text"
        placeholder="Descripción de la acción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={{
          padding: "6px",
          width: "60%",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        style={{
          padding: "6px",
          marginRight: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        <option value="Reciclaje"> Reciclaje </option>{" "}
        <option value="Ahorro de Energía"> Ahorro de Energía </option>{" "}
        <option value="Uso de Bicicleta"> Uso de Bicicleta </option>{" "}
        <option value="Plantar Árbol"> Plantar Árbol </option>{" "}
        <option value="Limpieza de Playa"> Limpieza de Playa </option>{" "}
        <option value="Educación Ambiental"> Educación Ambiental </option>{" "}
        <option value="Otro"> Otro </option>{" "}
      </select>
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
