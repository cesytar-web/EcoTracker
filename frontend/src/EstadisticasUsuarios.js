import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const EstadisticasUsuarios = ({ usuarios }) => {
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);

  const usuariosCount = usuarios ? usuarios.length : 0;

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = Math.floor(el.getBoundingClientRect().width) || el.clientWidth || 600;
      setWidth(w);
    };
    update();
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }

    const timers = [];
    const scheduleRetries = () => {
      [250, 750, 1500].forEach((ms) => timers.push(setTimeout(update, ms)));
    };
    if (!el.getBoundingClientRect().width) scheduleRetries();

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
      timers.forEach(clearTimeout);
    };
  }, [usuariosCount]);

  if (!usuarios || usuarios.length === 0) {
    return <p> No hay usuarios para mostrar. </p>;
  }

  const totalUsuarios = usuarios.length;

  let puntosTotales = 0;
  for (let i = 0; i < usuarios.length; i++) {
    puntosTotales += usuarios[i].puntuacion || 0;
  }

  const puntosPromedio = (puntosTotales / totalUsuarios).toFixed(2);

  // Top 5 usuarios
  const topUsuarios = usuarios.slice();
  topUsuarios.sort(function (a, b) {
    return (b.puntuacion || 0) - (a.puntuacion || 0);
  });
  const top5 = topUsuarios.slice(0, 5);

  const datosGrafico = top5
    .filter((u) => u && typeof u.puntuacion === "number")
    .map((u) => ({
      nombre: u.nombre || "Desconocido",
      puntuacion: u.puntuacion,
    }));

  return (
    <div style={{ width: "100%" }}>
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
          <h3> Total de usuarios </h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{totalUsuarios}</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "15px",
            background: "#f0f4f8",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3> Puntos totales </h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{puntosTotales}</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: "15px",
            background: "#f0f4f8",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3> Puntos promedio </h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{puntosPromedio}</p>
        </div>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: 300 }}>
        {width <= 0 ? (
          <p>Cargando gráfico...</p>
        ) : datosGrafico.length === 0 ? (
          <p>No hay datos válidos para mostrar el gráfico.</p>
        ) : (
          <div style={{ width: "100%", height: "100%" }}>
            <BarChart data={datosGrafico} width={width} height={300} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="puntuacion" fill="#82ca9d" />
            </BarChart>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasUsuarios;
