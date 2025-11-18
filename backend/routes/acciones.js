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
    console.log("📌 Datos recibidos en POST /acciones:", req.body);

    try {
        const { descripcion, usuarioId, tipo } = req.body;

        if (!descripcion || !usuarioId || !tipo) {
            console.log("❌ Faltan campos requeridos");
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            console.log("❌ Usuario no encontrado");
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const nuevaAccion = new Accion({ descripcion, tipo, usuario: usuarioId });
        await nuevaAccion.save();
        console.log("✅ Acción creada:", nuevaAccion);

        // 🔹 Agregar puntos al usuario
        await usuario.agregarPuntos(nuevaAccion.puntos);

        // 🔹 Asociar acción al usuario
        usuario.accionesRealizadas.push(nuevaAccion._id);

        // 🔹 Comprobar logros adicionales (primera acción, recliclado X veces, 10 acciones, ...)
        try {
            const totalAcciones = await Accion.countDocuments({ usuario: usuarioId });
            const tipoCount = await Accion.countDocuments({ usuario: usuarioId, tipo: tipo });

            const tieneLogro = (titulo) => usuario.logros && usuario.logros.some(l => l.titulo === titulo);

            // Primera acción
            if (totalAcciones === 1 && !tieneLogro("Primera Acción")) {
                usuario.logros.push({
                    titulo: "Primera Acción",
                    descripcion: "Has registrado tu primera acción ecológica. ¡Bienvenido al cambio!",
                });
            }

            // Reciclaste 5 veces
            if (tipo === "Reciclaje" && tipoCount >= 5 && !tieneLogro("Reciclaste 5 veces")) {
                usuario.logros.push({
                    titulo: "Reciclaste 5 veces",
                    descripcion: "Has realizado 5 acciones de reciclaje. ¡Excelente hábito!",
                });
            }

            // 10 acciones totales
            if (totalAcciones >= 10 && !tieneLogro("10 Acciones")) {
                usuario.logros.push({
                    titulo: "10 Acciones",
                    descripcion: "Has registrado 10 acciones. Sigues avanzando hacia un mundo más sostenible.",
                });
            }
            
            // Contar días distintos con acciones y rachas consecutivas
            const accionesUsuario = await Accion.find({ usuario: usuarioId }).select('fecha tipo').lean();
            const daySet = new Set();
            accionesUsuario.forEach(a => {
                if (a.fecha) {
                    const d = new Date(a.fecha).toISOString().slice(0,10); // YYYY-MM-DD
                    daySet.add(d);
                }
            });
            const diasUnicos = Array.from(daySet).sort().reverse(); // orden descendente
            const diasUnicosCount = diasUnicos.length;

            // calcular racha consecutiva que termina en la fecha más reciente
            let racha = 0;
            if (diasUnicosCount > 0) {
                const diaMasReciente = new Date(diasUnicos[0]);
                let current = new Date(diaMasReciente);
                const daySetLookup = new Set(diasUnicos);
                while (true) {
                    const key = current.toISOString().slice(0,10);
                    if (daySetLookup.has(key)) {
                        racha++;
                        // restar 1 día
                        current.setUTCDate(current.getUTCDate() - 1);
                    } else break;
                }
            }

            // 5 días con acción (no necesariamente consecutivos)
            if (diasUnicosCount >= 5 && !tieneLogro("5 Días Activo")) {
                usuario.logros.push({
                    titulo: "5 Días Activo",
                    descripcion: "Has realizado acciones en 5 días distintos. ¡Constancia!",
                });
            }

            // Racha de 3 días consecutivos
            if (racha >= 3 && !tieneLogro("Racha 3 Días")) {
                usuario.logros.push({
                    titulo: "Racha 3 Días",
                    descripcion: "Has registrado acciones en 3 días consecutivos. ¡Mantén el impulso!",
                });
            }

            // Racha de 7 días consecutivos -> Semana Activa
            if (racha >= 7 && !tieneLogro("Semana Activa")) {
                usuario.logros.push({
                    titulo: "Semana Activa",
                    descripcion: "Has mantenido acciones durante 7 días seguidos. ¡Eres imparable!",
                });
            }

            // Uso de bicicleta 5 veces
            if (tipo === "Uso de Bicicleta" && tipoCount >= 5 && !tieneLogro("Uso de Bicicleta 5 veces")) {
                usuario.logros.push({
                    titulo: "Uso de Bicicleta 5 veces",
                    descripcion: "Has usado la bicicleta 5 veces. ¡Excelente para el planeta y tu salud!",
                });
            }
        } catch (errLogros) {
            console.error("Error al evaluar logros:", errLogros);
        }

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
        console.error("❌ Error al crear acción:", err);
        res.status(500).json({ message: "Error al crear acción", error: err.message });
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