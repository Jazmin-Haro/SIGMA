// src/models/maquinaria.model.js
'use strict';
const { query } = require('../config/database');

const MaquinariaModel = {
  findAll: async () => {
    const { rows } = await query(
      'SELECT * FROM comodatos.maquinaria_local ORDER BY numero_economico'
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.maquinaria_local WHERE pk_maquinaria = $1', [id]
    );
    return rows[0] || null;
  },
  findByEstado: async (estado) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.maquinaria_local WHERE estado_operativo = $1 ORDER BY numero_economico',
      [estado]
    );
    return rows;
  },
  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.maquinaria_local
        (numero_economico, tipo_equipo, marca, modelo, serie, num_motor,
         color, horas_actuales, ubicacion, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;
    const { rows } = await query(sql, [
      datos.numero_economico, datos.tipo_equipo, datos.marca || null,
      datos.modelo, datos.serie || null, datos.num_motor || null,
      datos.color || null, datos.horas_actuales || 0,
      datos.ubicacion || 'CREAN', datos.observaciones || null,
    ]);
    return rows[0];
  },
  update: async (id, datos) => {
    const sql = `
      UPDATE comodatos.maquinaria_local SET
        estado_operativo = COALESCE($1, estado_operativo),
        horas_actuales   = COALESCE($2, horas_actuales),
        ubicacion        = COALESCE($3, ubicacion),
        observaciones    = COALESCE($4, observaciones)
      WHERE pk_maquinaria = $5
      RETURNING *`;
    const { rows } = await query(sql, [
      datos.estado_operativo || null, datos.horas_actuales || null,
      datos.ubicacion || null, datos.observaciones || null, id,
    ]);
    return rows[0] || null;
  },
  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.maquinaria_local WHERE pk_maquinaria = $1 RETURNING pk_maquinaria',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = MaquinariaModel;
