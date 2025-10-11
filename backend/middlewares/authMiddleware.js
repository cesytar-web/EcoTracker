const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware para proteger rutas
const authMiddleware = (req, res, next) => {
    try {
        // Revisar si existe el header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No autorizado, token faltante" });
        }

        // Extraer token
        const token = authHeader.split(" ")[1];

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // info del usuario disponible en req.usuario

        next(); // pasar al siguiente middleware o ruta
    } catch (err) {
        console.error("Error en authMiddleware:", err);
        return res.status(401).json({ message: "No autorizado, token inválido" });
    }
};

module.exports = authMiddleware;