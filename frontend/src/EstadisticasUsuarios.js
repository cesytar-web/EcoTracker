import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const EstadisticasUsuarios = ({ usuarios }) => {
  const [showChart, setShowChart] = useState(false);

  // Renderizamos el gráfico después del primer render
  useEffect(() => {
    setShowChart(true);
  }, []);

  if (!usuarios || usuarios.length === 0)
    return <p> No hay usuarios para mostrar. </p>;

  // --- Datos de resumen ---
  const totalUsuarios = usuarios.length;
  const puntosTotales = usuarios.reduce(
    (acc, u) => acc + (u.puntuacion || 0),
    0
  );
  const puntosPromedio = (puntosTotales / totalUsuarios).toFixed(2);

  // --- Top 5 usuarios por puntuación ---
  const topUsuarios = [...usuarios]
    .sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0))
    .slice(0, 5)
    .map((u) => ({
      nombre: u.nombre || "Desconocido",
      puntuacion: u.puntuacion || 0,
    }));

  return (
    <div style={{ width: "100%" }}>
      {" "}
      {/* --- Cuadros de resumen --- */}{" "}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "15px",
            background: "#f0f4f8",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3> Total de usuarios </h3>{" "}
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {" "}
            {totalUsuarios}{" "}
          </p>{" "}
        </div>{" "}
        <div
          style={{
            flex: 1,
            padding: "15px",
            background: "#f0f4f8",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3> Puntos totales </h3>{" "}
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {" "}
            {puntosTotales}{" "}
          </p>{" "}
        </div>{" "}
        <div
          style={{
            flex: 1,
            padding: "15px",
            background: "#f0f4f8",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3> Puntos promedio </h3>{" "}
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {" "}
            {puntosPromedio}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/ * -- - Gráfico de barras Top 5 usuarios-- - * /}{" "}
      {showChart && (
        <div style={{ width: "100%", height: 300, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topUsuarios}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="puntuacion" fill="#82ca9d" />
            </BarChart>{" "}
          </ResponsiveContainer>{" "}
        </div>
      )}{" "}
    </div>
  );
};

export default EstadisticasUsuarios;
