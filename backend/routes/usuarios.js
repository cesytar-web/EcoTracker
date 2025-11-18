const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const Accion = require("../models/Accion");

// Utilidad para generar password aleatorio
const generarPassword = () => Math.random().toString(36).slice(-8);

// GET: Listar todos los usuarios (sin password)
router.get("/", async(req, res) => {
    try {
        const usuarios = await Usuario.find().select("-password").lean();
        res.json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ message: "Error al cargar usuarios" });
    }
});

// POST: Crear usuario con contraseña automática
router.post("/", async(req, res) => {
    const { nombre, email, puntuacion } = req.body;

    if (!nombre || !email) return res.status(400).json({ message: "Nombre y email son requeridos" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Email inválido" });

    try {
        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) return res.status(400).json({ message: "Email ya registrado" });

        const password = generarPassword();

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password,
            puntuacion: puntuacion || 0,
        });

        const usuarioGuardado = await nuevoUsuario.save();

        console.log(`Contraseña generada para ${email}: ${password}`); // solo para pruebas

        const userResponse = {
            _id: usuarioGuardado._id,
            nombre: usuarioGuardado.nombre,
            email: usuarioGuardado.email,
            puntuacion: usuarioGuardado.puntuacion,
            nivel: usuarioGuardado.nivel,
            createdAt: usuarioGuardado.createdAt,
            updatedAt: usuarioGuardado.updatedAt,
        };

        res.status(201).json(userResponse);
    } catch (err) {
        console.error("Error al crear usuario:", err);
        res.status(500).json({ message: "Error al crear usuario" });
    }
});

// PUT: Actualizar usuario por ID (si se envía password se hashea automáticamente)
router.put("/:id", async(req, res) => {
    const { nombre, email, puntuacion, password } = req.body;

    try {
        if (typeof password !== "undefined") {
            const usuario = await Usuario.findById(req.params.id);
            if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

            if (nombre !== undefined) usuario.nombre = nombre;
            if (email !== undefined) usuario.email = email;
            if (puntuacion !== undefined) usuario.puntuacion = puntuacion;
            usuario.password = password;

            const actualizado = await usuario.save();
            const resp = await Usuario.findById(actualizado._id).select("-password").lean();
            return res.json(resp);
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id, { nombre, email, puntuacion }, { new: true, runValidators: true, context: "query" }
        ).select("-password");

        if (!usuarioActualizado) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json(usuarioActualizado);
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ message: "El email ya está en uso" });
        }
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
});

// PUT: Incrementar puntuación de usuario
router.put("/:id/puntuacion", async(req, res) => {
    try {
        const { puntos } = req.body;
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        await usuario.agregarPuntos(puntos || 10);

        const resp = await Usuario.findById(usuario._id).select("-password").lean();
        res.json(resp);
    } catch (err) {
        console.error("Error al incrementar puntuación:", err);
        res.status(500).json({ message: "Error al incrementar puntuación" });
    }
});

// DELETE: Eliminar usuario y sus acciones
router.delete("/:id", async(req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) return res.status(404).json({ message: "Usuario no encontrado" });

        await Accion.deleteMany({ usuario: req.params.id });

        res.json({ message: "Usuario y acciones eliminados correctamente" });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
});

// POST: Añadir un logro manualmente (útil para pruebas)
router.post("/:id/logros", async (req, res) => {
    try {
        const { titulo, descripcion, fecha } = req.body;
        if (!titulo) return res.status(400).json({ message: "El campo 'titulo' es requerido" });

        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        // Evitar duplicados por título
        if (usuario.logros && usuario.logros.some(l => l.titulo === titulo)) {
            return res.status(400).json({ message: "El logro ya existe para este usuario" });
        }

        const logro = { titulo, descripcion: descripcion || "", fecha: fecha ? new Date(fecha) : undefined };
        usuario.logros.push(logro);
        await usuario.save();

        const resp = await Usuario.findById(usuario._id).select("-password").lean();
        res.status(201).json(resp);
    } catch (err) {
        console.error("Error al añadir logro manual:", err);
        res.status(500).json({ message: "Error al añadir logro" });
    }
});

// POST: Recalcular logros de un usuario a partir de sus acciones
router.post("/:id/recalcular-logros", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        // Obtener todas las acciones del usuario
        const accionesUsuario = await Accion.find({ usuario: usuario._id }).select('fecha tipo puntos').lean();

        const totalAcciones = accionesUsuario.length;

        // Contar por tipo
        const countsByType = accionesUsuario.reduce((acc, a) => {
            acc[a.tipo] = (acc[a.tipo] || 0) + 1;
            return acc;
        }, {});

        const tipoReciclajeCount = countsByType['Reciclaje'] || 0;
        const tipoBiciCount = countsByType['Uso de Bicicleta'] || 0;

        // Días únicos con acciones
        const daySet = new Set();
        accionesUsuario.forEach(a => {
            if (a.fecha) {
                const d = new Date(a.fecha).toISOString().slice(0,10);
                daySet.add(d);
            }
        });
        const diasUnicos = Array.from(daySet).sort().reverse();
        const diasUnicosCount = diasUnicos.length;

        // Calcular racha consecutiva que termina en la fecha más reciente
        let racha = 0;
        if (diasUnicosCount > 0) {
            const diaMasReciente = new Date(diasUnicos[0]);
            let current = new Date(diaMasReciente);
            const daySetLookup = new Set(diasUnicos);
            while (true) {
                const key = current.toISOString().slice(0,10);
                if (daySetLookup.has(key)) {
                    racha++;
                    current.setUTCDate(current.getUTCDate() - 1);
                } else break;
            }
        }

        // Reconstruir logros desde cero
        const nuevosLogros = [];

        const pushLogro = (titulo, descripcion, fecha) => {
            nuevosLogros.push({ titulo, descripcion, fecha: fecha ? new Date(fecha) : new Date() });
        };

        if (totalAcciones >= 1) {
            // Fecha de la primera acción (si existe)
            let fechaPrimera = null;
            if (accionesUsuario.length > 0) {
                fechaPrimera = accionesUsuario.reduce((min, a) => {
                    const d = new Date(a.fecha);
                    return (!min || d < min) ? d : min;
                }, null);
            }
            pushLogro("Primera Acción", "Has registrado tu primera acción ecológica. ¡Bienvenido al cambio!", fechaPrimera || undefined);
        }

        if (tipoReciclajeCount >= 5) {
            pushLogro("Reciclaste 5 veces", "Has realizado 5 acciones de reciclaje. ¡Excelente hábito!", undefined);
        }

        if (totalAcciones >= 10) {
            pushLogro("10 Acciones", "Has registrado 10 acciones. Sigues avanzando hacia un mundo más sostenible.", undefined);
        }

        if (diasUnicosCount >= 5) {
            pushLogro("5 Días Activo", "Has realizado acciones en 5 días distintos. ¡Constancia!", undefined);
        }

        if (racha >= 3) {
            pushLogro("Racha 3 Días", "Has registrado acciones en 3 días consecutivos. ¡Mantén el impulso!", undefined);
        }

        if (racha >= 7) {
            pushLogro("Semana Activa", "Has mantenido acciones durante 7 días seguidos. ¡Eres imparable!", undefined);
        }

        if (tipoBiciCount >= 5) {
            pushLogro("Uso de Bicicleta 5 veces", "Has usado la bicicleta 5 veces. ¡Excelente para el planeta y tu salud!", undefined);
        }

        // Logro por puntuación (se conserva la puntuación actual)
        if (usuario.puntuacion >= 500) {
            pushLogro("Nivel Oro", "Has alcanzado el nivel Oro 🌟 gracias a tus acciones ecológicas.", undefined);
        }

        // Reemplazar logros y guardar
        usuario.logros = nuevosLogros;
        await usuario.save();

        const resp = await Usuario.findById(usuario._id).select("-password").lean();
        res.json({ message: "Logros recalculados", usuario: resp });
    } catch (err) {
        console.error("Error al recalcular logros:", err);
        res.status(500).json({ message: "Error al recalcular logros" });
    }
});

module.exports = router;