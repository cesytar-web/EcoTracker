const Accion = require("../models/Accion");
const Usuario = require("../models/Usuario");

// Crear una nueva acción ecológica
exports.crearAccion = async(req, res) => {
    try {
        const { descripcion, usuarioId } = req.body;

        // Validar campos
        if (!descripcion || !usuarioId) {
            return res.status(400).json({ mensaje: "Faltan campos requeridos" });
        }

        // Buscar usuario
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Crear la acción
        const nuevaAccion = new Accion({
            descripcion,
            usuario: usuarioId,
        });

        await nuevaAccion.save();

        // 🔹 Agregar puntos al usuario (cada acción vale 50 puntos)
        await usuario.agregarPuntos(50);

        // 🔹 Asociar acción al usuario
        usuario.accionesRealizadas.push(nuevaAccion._id);

        // 🔹 Registrar logro si llega a cierto nivel
        if (usuario.puntuacion >= 500 && !usuario.logros.some(l => l.titulo === "Nivel Oro")) {
            usuario.logros.push({
                titulo: "Nivel Oro",
                descripcion: "Has alcanzado el nivel Oro 🌟 gracias a tus acciones ecológicas.",
            });
        }

        await usuario.save();

        res.status(201).json({
            mensaje: "Acción registrada con éxito",
            accion: nuevaAccion,
            usuarioActualizado: usuario,
        });
    } catch (error) {
        console.error("Error al crear acción:", error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
};

// Obtener todas las acciones (opcional)
exports.obtenerAcciones = async(req, res) => {
    try {
        const acciones = await Accion.find().populate("usuario", "nombre email puntuacion nivel");
        res.json(acciones);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener acciones" });
    }
};