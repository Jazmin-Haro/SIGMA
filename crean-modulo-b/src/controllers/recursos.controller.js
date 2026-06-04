'use strict';

// ─────────────────────────────────────────────────────────
// src/controllers/auth.controller.js
// ─────────────────────────────────────────────────────────
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { UsuarioModel } = require('../models/otros.model');

const AuthController = {

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, mensaje: 'Usuario y contraseña requeridos.' });
      }
      const usuario = await UsuarioModel.findByUsername(username);
      if (!usuario) {
        return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
      }
      const coincide = await bcrypt.compare(password, usuario.password_hash);
      if (!coincide) {
        return res.status(401).json({ success: false, mensaje: 'Credenciales incorrectas.' });
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
        usuario: { id: usuario.pk_usuario, nombre: usuario.nombre, rol: usuario.rol },
      });
    } catch (err) { next(err); }
  },

  // GET /api/auth/perfil  (ruta protegida)
  perfil: async (req, res, next) => {
    try {
      const usuario = await UsuarioModel.findById(req.usuario.id);
      if (!usuario) return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
      res.json({ success: true, dato: usuario });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// src/controllers/falla.controller.js
// ─────────────────────────────────────────────────────────
const FallaModel = require('../models/falla.model');

const FallaController = {
  getAll: async (req, res, next) => {
    try {
      const { estado } = req.query;
      const datos = estado
        ? await FallaModel.findByEstado(estado)
        : await FallaModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await FallaModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Falla no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await FallaModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Falla reportada correctamente.', dato: nuevo });
    } catch (err) { next(err); }
  },
  updateEstado: async (req, res, next) => {
    try {
      const dato = await FallaModel.updateEstado(req.params.id, req.body.estado);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Falla no encontrada.' });
      res.json({ success: true, mensaje: 'Estado de falla actualizado.', dato });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await FallaModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Falla no encontrada.' });
      res.json({ success: true, mensaje: 'Falla eliminada.' });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// src/controllers/mantenimiento.controller.js
// ─────────────────────────────────────────────────────────
const MantenimientoModel = require('../models/mantenimiento.model');

const MantenimientoController = {
  getAll: async (req, res, next) => {
    try {
      const datos = await MantenimientoModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await MantenimientoModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Orden no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await MantenimientoModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Orden de mantenimiento emitida.', dato: nuevo });
    } catch (err) { next(err); }
  },
  terminar: async (req, res, next) => {
    try {
      const { costo_real, observaciones } = req.body;
      const dato = await MantenimientoModel.terminar(req.params.id, costo_real, observaciones);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Orden no encontrada.' });
      res.json({ success: true, mensaje: 'Mantenimiento terminado. Maquinaria disponible.', dato });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await MantenimientoModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Orden no encontrada.' });
      res.json({ success: true, mensaje: 'Orden eliminada.' });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// src/controllers/entrega.controller.js
// ─────────────────────────────────────────────────────────
const EntregaModel = require('../models/entrega.model');

const EntregaController = {
  getAll: async (req, res, next) => {
    try {
      const datos = await EntregaModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await EntregaModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Entrega no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await EntregaModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Entrega registrada correctamente.', dato: nuevo });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await EntregaModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Entrega no encontrada.' });
      res.json({ success: true, mensaje: 'Entrega eliminada.' });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// src/controllers/devolucion.controller.js
// ─────────────────────────────────────────────────────────
const DevolucionModel = require('../models/devolucion.model');

const DevolucionController = {
  getAll: async (req, res, next) => {
    try {
      const datos = await DevolucionModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await DevolucionModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Devolución no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await DevolucionModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Devolución registrada correctamente.', dato: nuevo });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await DevolucionModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Devolución no encontrada.' });
      res.json({ success: true, mensaje: 'Devolución eliminada.' });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// src/controllers/dashboard.controller.js
// ─────────────────────────────────────────────────────────
const { query } = require('../config/database');

const DashboardController = {
  // GET /api/dashboard
  resumen: async (req, res, next) => {
    try {
      const [maq, comodatos, fallas, solicitudes] = await Promise.all([
        query(`SELECT estado_operativo, COUNT(*) AS total
               FROM comodatos.maquinaria_local
               GROUP BY estado_operativo`),
        query(`SELECT COUNT(*) AS total FROM comodatos.comodato
               WHERE estado IN ('activo','programado')`),
        query(`SELECT COUNT(*) AS total FROM comodatos.falla
               WHERE estado = 'pendiente'`),
        query(`SELECT COUNT(*) AS total FROM comodatos.solicitud_comodato
               WHERE estado = 'pendiente'`),
      ]);

      const maquinariaPorEstado = {};
      maq.rows.forEach(r => { maquinariaPorEstado[r.estado_operativo] = parseInt(r.total); });

      res.json({
        success: true,
        dato: {
          maquinaria:              maquinariaPorEstado,
          comodatos_activos:       parseInt(comodatos.rows[0].total),
          fallas_pendientes:       parseInt(fallas.rows[0].total),
          solicitudes_pendientes:  parseInt(solicitudes.rows[0].total),
        },
      });
    } catch (err) { next(err); }
  },
};


// ─────────────────────────────────────────────────────────
// Exportaciones
// ─────────────────────────────────────────────────────────
module.exports = {
  AuthController,
  FallaController,
  MantenimientoController,
  EntregaController,
  DevolucionController,
  DashboardController,
};