import React from "react";
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
  // Evitar renderizar si no hay usuarios
  if (!usuarios || usuarios.length === 0)
    return <p> No hay usuarios para mostrar. </p>;

  // Convertimos todo a tipos seguros
  const data = usuarios.map((usuario) => ({
    nombre: String(usuario.nombre),
    puntuacion: Number(usuario.puntuacion) || 0,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
  );
};

export default EstadisticasUsuarios;
