import React, { useState, useEffect } from "react";

const AccionList = ({ usuarioId, onNuevaAccion }) => {
  const [acciones, setAcciones] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchAcciones = async () => {
      if (!usuarioId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/acciones?usuarioId=${usuarioId}`
        );
        const data = await res.json();
        ) : (
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}> Fecha </th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}> Descripción </th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}> Puntos </th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}> Acción </th>
                </tr>
              </thead>
              <tbody>
                {acciones.map((a) => (
                  <tr key={a._id}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {new Date(a.fecha).toLocaleString()}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {a.descripcion}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {a.puntos || 0}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <button className="eliminar" onClick={() => handleEliminar(a._id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {" "}
      {mensaje && <p> {mensaje} </p>}
      <form onSubmit={handleAgregarAccion} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nueva acción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />{" "}
        <button type="submit" className="agregar">
          Agregar acción{" "}
        </button>{" "}
      </form>
      {acciones.length === 0 ? (
        <p> No hay acciones registradas para este usuario. </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                {" "}
                Fecha{" "}
              </th>{" "}
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                {" "}
                Descripción{" "}
              </th>{" "}
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                {" "}
                Puntos{" "}
              </th>{" "}
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                {" "}
                Acción{" "}
              </th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {acciones.map((a) => (
              <tr key={a._id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {" "}
                  {new Date(a.fecha).toLocaleString()}{" "}
                </td>{" "}
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {" "}
                  {a.descripcion}{" "}
                </td>{" "}
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {" "}
                  {a.puntos || 0}{" "}
                </td>{" "}
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <button
                    className="eliminar"
                    onClick={() => handleEliminar(a._id)}
                  >
                    Eliminar{" "}
                  </button>{" "}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>
      )}{" "}
    </div>
  );
};

export default AccionList;
