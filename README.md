# EcoTracker

EcoTracker es una aplicación para registrar y gamificar acciones ecológicas (reciclaje, ahorro energético, transporte sostenible, etc.).

**Tecnologías**

| Categoría            | Tecnología / Herramienta         |
|----------------------|----------------------------------|
| Frontend             | React                            |
| Estilo / Diseño      | CSS / Tailwind                   |
| Lenguaje Backend     | Node.js                          |
| Base de Datos        | MongoDB                          |
| API / Comunicación   | Express + Axios / fetch          |
| Formato de Datos     | JSON                             |
| Control de Versiones | Git / GitHub                     |

**Arquitectura (simplificada)**

Usuario/App -> Frontend (React) -> Backend (Node.js + Express) -> MongoDB

Servicios externos (p.ej. mapas, APIs) integrados desde el Backend cuando haga falta.

**Modelos de datos (propuestos)**

- Usuarios
	- id
	- nombre
	- email
	- puntos
	- retos_completados (lista)

- Retos
	- id
	- título
	- descripción
	- puntos
	- categoría

- Registro de actividad
	- id
	- usuario_id
	- reto_id
	- fecha_completado
	- comentarios (opcional)

**Funcionalidades**

- Básicas
	- Registro e inicio de sesión de usuarios
	- Registrar acciones ecológicas y sumar puntos
	- Listado histórico de acciones por usuario

- Gamificación (nivel moderado)
	- Sistema de puntos y niveles
	- Logros / medallas
	- Ranking de usuarios (top 5/10 por puntos)

**Estructura del proyecto**

```
EcoTracker/
├── backend/    # Node.js + Express + MongoDB
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/   # React app
│   ├── public/
│   └── src/
└── README.md
```

**Instalación y ejecución (Windows - cmd.exe)**

1) Backend

```
cd backend
npm install
npm start
```

2) Frontend

```
cd frontend
npm install
npm start
```

Si al ejecutar `npm start` en `frontend` aparece el error “"react-scripts" no se reconoce como un comando”, asegúrate de tener las dependencias instaladas. Prueba lo siguiente en `frontend`:

```
npm install
```

Si sigue fallando, instala `react-scripts` explícitamente:

```
npm install react-scripts --save
```

**Notas**
- Ejecuta primero el backend, luego el frontend.
- Toda la comunicación usa JSON.
- Ajusta variables de entorno (p.ej. `PORT`, cadena de conexión a MongoDB) en el backend.
