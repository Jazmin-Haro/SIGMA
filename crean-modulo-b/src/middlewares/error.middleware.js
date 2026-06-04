// src/middlewares/error.middleware.js
// Manejador global de errores — responde siempre en JSON
'use strict';

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${req.method} ${req.path}`);
  console.error(err.stack || err.message);

  // Error de validación de express-validator (se maneja en los controllers)
  if (err.type === 'validacion') {
    return res.status(422).json({
      success: false,
      mensaje: 'Error de validación en los datos enviados.',
      errores: err.errores,
    });
  }

  // Error de base de datos PostgreSQL
  if (err.code) {
    // Violación de llave única
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        mensaje: 'Ya existe un registro con ese valor. Verifique los datos.',
        detalle: err.detail,
      });
    }
    // Violación de llave foránea
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        mensaje: 'El registro referenciado no existe en el sistema.',
        detalle: err.detail,
      });
    }
    // Violación de check constraint
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        mensaje: 'El valor no está permitido para ese campo.',
        detalle: err.detail,
      });
    }
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Ruta no encontrada (404)
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
