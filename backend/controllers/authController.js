const Usuario = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 🔹 Función para generar contraseñas aleatorias simples
const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// 🔹 Registro
exports.registrar = async(req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ message: "Faltan campos" });
    }

    try {
        // Verificar si ya existe el usuario
        const existe = await Usuario.findOne({ email });
        if (existe) {
            return res.status(400).json({ message: "Email ya registrado" });
        }

        // Si el usuario no envió password, generamos uno automático
        const passwordFinal = password || generarPassword();

        // Hasheamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordFinal, salt);

        // Creamos el nuevo usuario
        const usuario = new Usuario({
            nombre,
            email,
            password: hashedPassword,
        });

        await usuario.save();

        // 🔹 Mostrar la contraseña generada en la consola
        console.log(`🔐 Contraseña generada para ${email}: ${passwordFinal}`);

        // Generar token
        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Enviamos respuesta (sin contraseña)
        res.status(201).json({
            usuario: { id: usuario._id, nombre, email },
            token,
        });
    } catch (err) {
        console.error("Error en registro:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
};

// 🔹 Login
exports.login = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Faltan campos" });

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario)
            return res.status(404).json({ message: "Usuario no encontrado" });

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido)
            return res.status(400).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            usuario: { id: usuario._id, nombre: usuario.nombre, email },
            token,
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
};