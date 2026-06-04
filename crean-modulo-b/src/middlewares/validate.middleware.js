// src/middlewares/validate.middleware.js
// Revisa el resultado de express-validator y responde si hay errores
'use strict';

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(422).json({
      success: false,
      mensaje: 'Error de validación. Revise los datos enviados.',
      errores: errores.array().map(e => ({
        campo: e.path,
        mensaje: e.msg,
        valor: e.value,
      })),
    });
  }
  next();
};

module.exports = { validate };
