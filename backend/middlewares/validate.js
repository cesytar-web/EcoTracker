import { body, validationResult } from "express-validator";

export const validarUsuario = [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validarAccion = [
    body("descripcion").notEmpty().withMessage("La descripción es obligatoria"),
    body("usuarioId").notEmpty().withMessage("El usuarioId es obligatorio"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];