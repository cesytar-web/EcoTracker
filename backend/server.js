// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- para permitir conexiones desde React
require('dotenv').config();

// Crear la aplicación Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // <--- habilita CORS

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);



// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

const accionesRoutes = require('./routes/acciones'); // Nueva ruta de acciones
app.use('/api/acciones', accionesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor EcoTracker funcionando!');
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));