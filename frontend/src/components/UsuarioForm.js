import React, { useState, useEffect } from "react";

const UsuarioForm = ({ agregarUsuario, editingUsuario, setEditingUsuario }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (editingUsuario) {
      setNombre(editingUsuario.nombre || "");
      setEmail(editingUsuario.email || "");
    }
  }, [editingUsuario]);

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setMensajeError("El nombre no puede estar vacío");
      return;
    }
    if (!email.trim()) {
      setMensajeError("El email no puede estar vacío");
      return;
    }
    if (!validarEmail(email)) {
      setMensajeError("El email no tiene un formato válido");
      return;
    }

    setMensajeError("");

    // Si estamos editando, actualizamos
    if (editingUsuario) {
      await agregarUsuario({ ...editingUsuario, nombre, email });
      setEditingUsuario(null);
    } else {
      await agregarUsuario({ nombre, email });
    }

    setNombre("");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      {" "}
      {mensajeError && (
        <p style={{ color: "red", marginBottom: "8px" }}> {mensajeError} </p>
      )}{" "}
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ marginRight: "8px", padding: "4px" }}
      />{" "}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginRight: "8px", padding: "4px" }}
      />{" "}
      <button type="submit" style={{ padding: "4px 8px" }}>
        {" "}
        {editingUsuario ? "Actualizar" : "Agregar"}{" "}
      </button>{" "}
    </form>
  );
};

export default UsuarioForm;
