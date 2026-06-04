// src/controllers/solicitud.controller.js
'use strict';
const SolicitudModel = require('../models/solicitud.model');

const SolicitudController = {

  // GET /api/solicitudes
  getAll: async (req, res, next) => {
    try {
      const { estado } = req.query;
      const datos = estado
        ? await SolicitudModel.findByEstado(estado)
        : await SolicitudModel.findAll();
      res.json({ success: true, total: datos.length, datos });
    } catch (err) { next(err); }
  },

  // GET /api/solicitudes/:id
  getById: async (req, res, next) => {
    try {
      const dato = await SolicitudModel.findById(req.params.id);
      if (!dato) return res.status(404).json({ success: false, mensaje: 'Solicitud no encontrada.' });
      res.json({ success: true, dato });
    } catch (err) { next(err); }
  },

  // POST /api/solicitudes
  create: async (req, res, next) => {
    try {
      const nuevo = await SolicitudModel.create(req.body);
      res.status(201).json({ success: true, mensaje: 'Solicitud registrada correctamente.', dato: nuevo });
    } catch (err) { next(err); }
  },

  // PUT /api/solicitudes/:id
  update: async (req, res, next) => {
    try {
      const actualizado = await SolicitudModel.update(req.params.id, req.body);
      if (!actualizado) return res.status(404).json({ success: false, mensaje: 'Solicitud no encontrada.' });
      res.json({ success: true, mensaje: 'Solicitud actualizada.', dato: actualizado });
    } catch (err) { next(err); }
  },

  // PATCH /api/solicitudes/:id/estado
  updateEstado: async (req, res, next) => {
    try {
      const { estado } = req.body;
      const actualizado = await SolicitudModel.updateEstado(req.params.id, estado);
      if (!actualizado) return res.status(404).json({ success: false, mensaje: 'Solicitud no encontrada.' });
      res.json({ success: true, mensaje: `Solicitud marcada como: ${estado}.`, dato: actualizado });
    } catch (err) { next(err); }
  },

  // DELETE /api/solicitudes/:id
  delete: async (req, res, next) => {
    try {
      const eliminado = await SolicitudModel.delete(req.params.id);
      if (!eliminado) return res.status(404).json({ success: false, mensaje: 'Solicitud no encontrada.' });
      res.json({ success: true, mensaje: 'Solicitud eliminada.' });
    } catch (err) { next(err); }
  },
};

module.exports = SolicitudController;
