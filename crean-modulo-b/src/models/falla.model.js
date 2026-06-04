// src/models/falla.model.js
'use strict';
const { query } = require('../config/database');

const FallaModel = {
  findAll: async () => {
    const sql = `
      SELECT f.*, m.numero_economico AS eco, m.tipo_equipo, m.modelo
      FROM comodatos.falla f
      LEFT JOIN comodatos.maquinaria_local m ON f.fk_maquinaria = m.pk_maquinaria
      ORDER BY f.fecha_registro DESC`;
    const { rows } = await query(sql);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.falla WHERE pk_falla = $1', [id]
    );
    return rows[0] || null;
  },

  findByEstado: async (estado) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.falla WHERE estado = $1 ORDER BY fecha_registro DESC',
      [estado]
    );
    return rows;
  },

  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.falla
        (fk_comodato, fk_maquinaria, numero_economico, tipo, urgencia,
         descripcion, origen, reportado_por, fecha_reporte, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;
    const { rows } = await query(sql, [
      datos.fk_comodato || null, datos.fk_maquinaria || null,
      datos.numero_economico || null, datos.tipo, datos.urgencia || 'normal',
      datos.descripcion, datos.origen || 'comodatos',
      datos.reportado_por || null,
      datos.fecha_reporte || new Date().toISOString().split('T')[0],
      datos.observaciones || null,
    ]);
    return rows[0];
  },

  updateEstado: async (id, estado) => {
    const { rows } = await query(
      'UPDATE comodatos.falla SET estado = $1 WHERE pk_falla = $2 RETURNING *',
      [estado, id]
    );
    return rows[0] || null;
  },

  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.falla WHERE pk_falla = $1 RETURNING pk_falla', [id]
    );
    return rows[0] || null;
  },
};

module.exports = FallaModel;
