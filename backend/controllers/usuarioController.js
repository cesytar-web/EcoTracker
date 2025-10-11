const Accion = require("../models/Accion");
const Usuario = require("../models/Usuario");

// 🔹 Crear una nueva acción ecológica
exports.crearAccion = async(req, res) => {
    try {
        const { descripcion, usuarioId, tipo } = req.body;

        // Validar campos
        if (!descripcion || !usuarioId || !tipo) {
            return res.status(400).json({ mensaje: "Faltan campos requeridos" });
        }

        // Validar tipo
        const tiposValidos = [
            "Reciclaje",
            "Ahorro de Energía",
            "Uso de Bicicleta",
            "Plantar Árbol",
            "Limpieza de Playa",
            "Educación Ambiental",
            "Otro",
        ];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ mensaje: "Tipo de acción no válido" });
        }

        // Buscar usuario
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Crear la acción
        const nuevaAccion = new Accion({ descripcion, tipo, usuario: usuarioId });
        await nuevaAccion.save();

        // 🔹 Asociar acción al usuario
        usuario.accionesRealizadas.push(nuevaAccion._id);

        // 🔹 Actualizar puntuación y nivel automáticamente
        usuario.puntuacion += nuevaAccion.puntos;
        usuario.actualizarNivel();

        // 🔹 Registrar logro si llega a cierto nivel
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

        // Respuesta con datos actualizados
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

// 🔹 Obtener todas las acciones (opcional)
exports.obtenerAcciones = async(req, res) => {
    try {
        const { usuarioId } = req.query;

        let query = {};
        if (usuarioId) query.usuario = usuarioId;

        const acciones = await Accion.find(query).populate(
            "usuario",
            "nombre email puntuacion nivel"
        );

        res.json(acciones);
    } catch (error) {
        console.error("Error al obtener acciones:", error);
        res.status(500).json({ mensaje: "Error al obtener acciones" });
    }
};

// 🔹 Eliminar acción
exports.eliminarAccion = async(req, res) => {
    try {
        const { id } = req.params;

        const accion = await Accion.findById(id);
        if (!accion) return res.status(404).json({ mensaje: "Acción no encontrada" });

        // Restar puntos al usuario
        const usuario = await Usuario.findById(accion.usuario);
        if (usuario) {
            usuario.puntuacion -= accion.puntos;
            if (usuario.puntuacion < 0) usuario.puntuacion = 0;
            usuario.actualizarNivel();
            usuario.accionesRealizadas = usuario.accionesRealizadas.filter(
                (aId) => aId.toString() !== id
            );
            await usuario.save();
        }

        await Accion.findByIdAndDelete(id);

        res.json({ mensaje: "Acción eliminada correctamente", accionId: id });
    } catch (error) {
        console.error("Error al eliminar acción:", error);
        res.status(500).json({ mensaje: "Error al eliminar acción" });
    }
};