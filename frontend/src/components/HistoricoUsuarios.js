import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

const HistoricoUsuarios = ({ acciones }) => {
    // Solo renderizar si hay datos válidos
    if (!Array.isArray(acciones) || acciones.length === 0) {
        return <p > No hay acciones para mostrar. < /p>;
    }

    // Mapear datos de forma segura
    const data = acciones.map((accion) => {
        return {
            nombre: accion.usuario && accion.usuario.nombre ?
                accion.usuario.nombre :
                "Desconocido",
            fecha: accion.fecha ? new Date(accion.fecha).toLocaleString() : "",
            puntuacion: accion.puntos || 0,
        };
    });

    return ( <
        div style = {
            { width: "100%", height: 400, marginTop: 20, minWidth: 300 } } >
        <
        ResponsiveContainer width = "100%"
        height = "100%" >
        <
        LineChart data = { data }
        margin = {
            { top: 20, right: 30, left: 0, bottom: 5 } } >
        <
        CartesianGrid strokeDasharray = "3 3" / >
        <
        XAxis dataKey = "fecha" / >
        <
        YAxis / >
        <
        Tooltip / >
        <
        Line type = "monotone"
        dataKey = "puntuacion"
        stroke = "#8884d8" / >
        <
        /LineChart>{" "} <
        /ResponsiveContainer>{" "} <
        /div>
    );
};

export default HistoricoUsuarios;