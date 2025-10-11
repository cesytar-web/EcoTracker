const mongoose = require("mongoose");

const AccionSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
    },
    tipo: {
        type: String,
        required: true,
        enum: [
            "Reciclaje",
            "Ahorro de Energía",
            "Uso de Bicicleta",
            "Plantar Árbol",
            "Limpieza de Playa",
            "Educación Ambiental",
            "Otro",
        ],
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },
    puntos: {
        type: Number,
        required: true,
        default: 10, // Valor base, se puede ajustar por tipo
    },
    fecha: {
        type: Date,
        default: Date.now,
    },
});

// 🔹 Antes de guardar, puedes asignar puntos automáticamente según el tipo
AccionSchema.pre("save", function(next) {
    if (!this.puntos || this.puntos === 10) {
        switch (this.tipo) {
            case "Reciclaje":
                this.puntos = 15;
                break;
            case "Ahorro de Energía":
                this.puntos = 20;
                break;
            case "Uso de Bicicleta":
                this.puntos = 25;
                break;
            case "Plantar Árbol":
                this.puntos = 50;
                break;
            case "Limpieza de Playa":
                this.puntos = 40;
                break;
            case "Educación Ambiental":
                this.puntos = 30;
                break;
            default:
                this.puntos = 10;
        }
    }
    next();
});

module.exports = mongoose.model("Accion", AccionSchema);