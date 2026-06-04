// src/controllers/auth.controller.js
'use strict';

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { UsuarioModel } = require('../models/otros.model');

const AuthController = {

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          mensaje: 'Usuario y contraseña requeridos.',
        });
      }
      const usuario = await UsuarioModel.findByUsername(username);
      if (!usuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Credenciales incorrectas.',
        });
      }
      const coincide = await bcrypt.compare(password, usuario.password_hash);
      if (!coincide) {
        return res.status(401).json({
          success: false,
          mensaje: 'Credenciales incorrectas.',
        });
      }
      const token = jwt.sign(
        { id: usuario.pk_usuario, nombre: usuario.nombre, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      res.json({
        success: true,
        mensaje: `Bienvenido, ${usuario.nombre}.`,
        token,
        usuario: {
          id: usuario.pk_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      });
    } catch (err) { next(err); }
  },

  // GET /api/auth/perfil
  perfil: async (req, res, next) => {
    try {
      const usuario = await UsuarioModel.findById(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          mensaje: 'Usuario no encontrado.',
        });
      }
      res.json({ success: true, dato: usuario });
    } catch (err) { next(err); }
  },
};

module.exports = AuthController;
