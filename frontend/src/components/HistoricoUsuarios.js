import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const HistoricoUsuarios = ({ acciones }) => {
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);

  const accionesCount = acciones ? acciones.length : 0;

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

    // retries: sometimes initial measurement returns 0 (hidden parent, layout not ready)
    const timers = [];
    const scheduleRetries = () => {
      [250, 750, 1500].forEach((ms) => timers.push(setTimeout(update, ms)));
    };
    // if measured width is zero schedule retries
    if (!el.getBoundingClientRect().width) scheduleRetries();

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
      timers.forEach(clearTimeout);
    };
  }, [accionesCount]);

  if (!acciones || acciones.length === 0) {
    return <p> No hay acciones para mostrar. </p>;
  }

  const datos = acciones
    .filter((a) => a && a.fecha && typeof a.puntos === "number")
    .map((a) => ({
      nombre: a.usuario && a.usuario.nombre ? a.usuario.nombre : "Desconocido",
      fecha: new Date(a.fecha).toLocaleString(),
      puntuacion: a.puntos,
    }));
  if (!datos || datos.length === 0) {
    return <p> No hay datos válidos para mostrar el gráfico. </p>;
  }
 

  return (
    <div ref={containerRef} style={{ width: "100%", height: 400, minWidth: 300, marginTop: 20 }}>
      {width <= 0 ? (
        <p>Cargando gráfico...</p>
      ) : (
        <div style={{ width: "100%", height: "100%" }}>
          <LineChart
            width={width}
            height={400}
            data={datos}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="puntuacion" stroke="#8884d8" />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default HistoricoUsuarios;
