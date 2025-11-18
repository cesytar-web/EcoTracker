import React, { useState } from "react";
import { API } from "../api";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await API.post("/auth/registro", {
        nombre,
        email,
        password,
      });

      setMensaje("Registro exitoso! Ahora puedes iniciar sesión.");
      setNombre("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMensaje(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      style={{ maxWidth: "400px", margin: "0 auto" }}
    >
      {mensaje && (
        <p style={{ color: "red", marginBottom: "8px" }}>{mensaje}</p>
      )}

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "8px",
          padding: "6px",
        }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "8px",
          padding: "6px",
        }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "6px",
        }}
      />

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Registrarse
      </button>
    </form>
  );
};

export default Register;
