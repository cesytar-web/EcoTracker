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

module.exports = router;