const express = require("express");
const router = express.Router();
const Accion = require("../models/Accion");
const Usuario = require("../models/Usuario");

// 🔹 GET: Obtener acciones (todas o por usuario)
router.get("/", async(req, res) => {
    try {
        const { usuarioId } = req.query;

        let acciones;
        if (usuarioId) {
            acciones = await Accion.find({ usuario: usuarioId }).populate(
                "usuario",
                "nombre email puntuacion nivel"
            );
        } else {
            acciones = await Accion.find().populate(
                "usuario",
                "nombre email puntuacion nivel"
            );
        }

        res.json(acciones);
    } catch (err) {
        console.error("Error al obtener acciones:", err);
        res.status(500).json({ message: "Error al obtener acciones" });
    }
});

// 🔹 POST: Crear nueva acción
router.post("/", async(req, res) => {
    try {
        const { descripcion, usuarioId, tipo } = req.body;

        if (!descripcion || !usuarioId || !tipo) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const nuevaAccion = new Accion({ descripcion, tipo, usuario: usuarioId });
        await nuevaAccion.save();

        // 🔹 Agregar puntos al usuario
        await usuario.agregarPuntos(nuevaAccion.puntos);

        // 🔹 Asociar acción al usuario
        usuario.accionesRealizadas.push(nuevaAccion._id);

        // 🔹 Registrar logros según puntuación
        if (
            usuario.puntuacion >= 500 &&
            !usuario.logros.some((l) => l.titulo === "Nivel Oro")
        ) {
            usuario.logros.push({
                titulo: "Nivel Oro",
                descripcion: "Has alcanzado el nivel Oro 🌟 gracias a tus acciones ecológicas.",
            });
        }

        await usuario.save();

        res.status(201).json({
            mensaje: "Acción registrada",
            accion: nuevaAccion,
            usuarioActualizado: usuario,
        });
    } catch (err) {
        console.error("Error al crear acción:", err);
        res.status(500).json({ message: "Error al crear acción" });
    }
});

// 🔹 DELETE: Eliminar acción
router.delete("/:id", async(req, res) => {
    try {
        const accionEliminada = await Accion.findByIdAndDelete(req.params.id);
        if (!accionEliminada)
            return res.status(404).json({ message: "Acción no encontrada" });

        const usuario = await Usuario.findById(accionEliminada.usuario);
        if (usuario) {
            // Quitar referencia de acción
            usuario.accionesRealizadas = usuario.accionesRealizadas.filter(
                (id) => id.toString() !== accionEliminada._id.toString()
            );

            // Restar puntos de la acción eliminada
            usuario.puntuacion -= accionEliminada.puntos;
            if (usuario.puntuacion < 0) usuario.puntuacion = 0;
            usuario.actualizarNivel();

            await usuario.save();
        }

        res.json({
            message: "Acción eliminada correctamente",
            usuarioActualizado: usuario,
        });
    } catch (err) {
        console.error("Error al eliminar acción:", err);
        res.status(500).json({ message: "Error al eliminar acción" });
    }
});

module.exports = router;