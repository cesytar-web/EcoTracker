const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");

// 🔹 Registro
exports.registrar = async(req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ message: "Faltan campos" });

    try {
        const existe = await Usuario.findOne({ email });
        if (existe) return res.status(400).json({ message: "Email ya registrado" });

        const usuario = new Usuario({ nombre, email, password });
        await usuario.save();

        // 🔹 Generar token
        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({ usuario: { id: usuario._id, nombre, email }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};

// 🔹 Login
exports.login = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan campos" });

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        const esValido = await usuario.compararPassword(password);
        if (!esValido) return res.status(400).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ usuario: { id: usuario._id, nombre: usuario.nombre, email }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error del servidor" });
    }
};