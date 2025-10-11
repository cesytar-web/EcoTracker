const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    puntuacion: { type: Number, default: 0 },
    nivel: {
        type: String,
        enum: ["Bronce", "Plata", "Oro", "EcoLíder"],
        default: "Bronce",
    },
    logros: [{
        titulo: String,
        descripcion: String,
        fecha: { type: Date, default: Date.now },
    }],
    accionesRealizadas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accion",
    }],
    redesSociales: {
        facebook: String,
        instagram: String,
        twitter: String,
    },
}, { timestamps: true });

// 🔹 Hashear la contraseña antes de guardar
usuarioSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔹 Comparar contraseña
usuarioSchema.methods.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// 🔹 Actualizar nivel automáticamente según la puntuación
usuarioSchema.methods.actualizarNivel = function() {
    if (this.puntuacion >= 1000) this.nivel = "EcoLíder";
    else if (this.puntuacion >= 500) this.nivel = "Oro";
    else if (this.puntuacion >= 200) this.nivel = "Plata";
    else this.nivel = "Bronce";
};

// 🔹 Añadir puntos y actualizar nivel automáticamente
usuarioSchema.methods.agregarPuntos = async function(puntos) {
    this.puntuacion += puntos;
    this.actualizarNivel();
    await this.save();
};

module.exports = mongoose.model("Usuario", usuarioSchema);