const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const Accion = require("../models/Accion");

// GET: Listar todos los usuarios
router.get("/", async(req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ message: "Error al cargar usuarios" });
    }
});

// POST: Crear un nuevo usuario
router.post("/", async(req, res) => {
    const { nombre, email, puntuacion } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ message: "Nombre y email son requeridos" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email inválido" });
    }

    try {
        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ message: "Email ya registrado" });
        }

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            puntuacion: puntuacion || 0,
        });

        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (err) {
        console.error("Error al crear usuario:", err);
        res.status(500).json({ message: "Error al crear usuario" });
    }
});

// PUT: Actualizar usuario por ID
router.put("/:id", async(req, res) => {
    const { nombre, email, puntuacion } = req.body;

    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id, { nombre, email, puntuacion }, { new: true }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(usuarioActualizado);
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
});

// PUT: Incrementar puntuación de usuario
router.put("/:id/puntuacion", async(req, res) => {
    try {
        const { puntos } = req.body;
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario)
            return res.status(404).json({ message: "Usuario no encontrado" });

        await usuario.agregarPuntos(puntos || 10);
        res.json(usuario);
    } catch (err) {
        console.error("Error al incrementar puntuación:", err);
        res.status(500).json({ message: "Error al incrementar puntuación" });
    }
});

// DELETE: Eliminar usuario por ID y sus acciones
router.delete("/:id", async(req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 🔹 Opcional: eliminar todas las acciones de este usuario
        await Accion.deleteMany({ usuario: req.params.id });

        res.json({ message: "Usuario y acciones eliminados correctamente" });
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
});

module.exports = router;