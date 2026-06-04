// src/controllers/comodato.controller.js
'use strict';
const ComodatoModel = require('../models/comodato.model');

const ComodatoController = {
  getAll: async (req, res, next) => {
    try {
      const { estado } = req.query;
      const datos = estado
        ? await ComodatoModel.findByEstado(estado)
        : await ComodatoModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await ComodatoModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Comodato no encontrado.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await ComodatoModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Comodato registrado correctamente.', dato: nuevo });
    } catch (err) { next(err); }
  },
  updateEstado: async (req, res, next) => {
    try {
      const { estado, fecha_devolucion_real } = req.body;
      const dato = await ComodatoModel.updateEstado(req.params.id, estado, fecha_devolucion_real);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Comodato no encontrado.' });
      res.json({ success: true, mensaje: `Comodato actualizado a: ${estado}.`, dato });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await ComodatoModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Comodato no encontrado.' });
      res.json({ success: true, mensaje: 'Comodato eliminado.' });
    } catch (err) { next(err); }
  },
};

module.exports = ComodatoController;


// ─────────────────────────────────────────────────────────
// src/controllers/maquinaria.controller.js
// ─────────────────────────────────────────────────────────
const MaquinariaModel = require('../models/maquinaria.model');

const MaquinariaController = {
  getAll: async (req, res, next) => {
    try {
      const { estado } = req.query;
      const datos = estado
        ? await MaquinariaModel.findByEstado(estado)
        : await MaquinariaModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const dato = await MaquinariaModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Maquinaria no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const nuevo = await MaquinariaModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Maquinaria registrada.', dato: nuevo });
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const dato = await MaquinariaModel.update(req.params.id, req.body);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Maquinaria no encontrada.' });
      res.json({ success: true, mensaje: 'Maquinaria actualizada.', dato });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const eliminado = await MaquinariaModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Maquinaria no encontrada.' });
      res.json({ success: true, mensaje: 'Maquinaria eliminada.' });
    } catch (err) { next(err); }
  },
};

module.exports = { ComodatoController, MaquinariaController };
