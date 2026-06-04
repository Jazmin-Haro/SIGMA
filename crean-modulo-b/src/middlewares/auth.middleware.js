// src/middlewares/auth.middleware.js
// Verificación de token JWT en rutas protegidas
'use strict';

const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      mensaje: 'Acceso denegado. Se requiere token de autenticación.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nombre, rol }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      mensaje: 'Token inválido o expirado. Inicie sesión nuevamente.',
    });
  }
};

// Middleware de roles (para futuras restricciones por perfil)
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ success: false, mensaje: 'No autenticado.' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}.`,
      });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
