// src/models/solicitud.model.js
// Capa Model — Operaciones CRUD sobre comodatos.solicitud_comodato
'use strict';

const { query } = require('../config/database');

const SolicitudModel = {

  // ── READ — Obtener todas las solicitudes ─────────────
  findAll: async () => {
    const sql = `
      SELECT * FROM comodatos.solicitud_comodato
      ORDER BY fecha_registro DESC`;
    const { rows } = await query(sql);
    return rows;
  },

  // ── READ — Obtener solicitud por ID ──────────────────
  findById: async (id) => {
    const sql = `
      SELECT * FROM comodatos.solicitud_comodato
      WHERE pk_solicitud = $1`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  // ── READ — Filtrar por estado ────────────────────────
  findByEstado: async (estado) => {
    const sql = `
      SELECT * FROM comodatos.solicitud_comodato
      WHERE estado = $1
      ORDER BY fecha_registro DESC`;
    const { rows } = await query(sql, [estado]);
    return rows;
  },

  // ── CREATE ────────────────────────────────────────────
  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.solicitud_comodato
        (folio, nombre_productor, telefono, ejido, municipio,
         superficie_ha, cultivo, equipos_solicitados, num_beneficiarios,
         documento_ceder, fecha_solicitud, registrado_por, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`;
    const valores = [
      datos.folio, datos.nombre_productor, datos.telefono || null,
      datos.ejido || null, datos.municipio,
      datos.superficie_ha || null, datos.cultivo || null,
      datos.equipos_solicitados || null, datos.num_beneficiarios || null,
      datos.documento_ceder || null, datos.fecha_solicitud || null,
      datos.registrado_por || null, datos.observaciones || null,
    ];
    const { rows } = await query(sql, valores);
    return rows[0];
  },

  // ── UPDATE — Cambiar estado ───────────────────────────
  updateEstado: async (id, estado) => {
    const sql = `
      UPDATE comodatos.solicitud_comodato
      SET estado = $1
      WHERE pk_solicitud = $2
      RETURNING *`;
    const { rows } = await query(sql, [estado, id]);
    return rows[0] || null;
  },

  // ── UPDATE — Edición completa ─────────────────────────
  update: async (id, datos) => {
    const sql = `
      UPDATE comodatos.solicitud_comodato SET
        folio = COALESCE($1, folio),
        nombre_productor = COALESCE($2, nombre_productor),
        telefono = COALESCE($3, telefono),
        ejido = COALESCE($4, ejido),
        municipio = COALESCE($5, municipio),
        superficie_ha = COALESCE($6, superficie_ha),
        cultivo = COALESCE($7, cultivo),
        equipos_solicitados = COALESCE($8, equipos_solicitados),
        num_beneficiarios = COALESCE($9, num_beneficiarios),
        observaciones = COALESCE($10, observaciones)
      WHERE pk_solicitud = $11
      RETURNING *`;
    const valores = [
      datos.folio || null, datos.nombre_productor || null,
      datos.telefono || null, datos.ejido || null,
      datos.municipio || null, datos.superficie_ha || null,
      datos.cultivo || null, datos.equipos_solicitados || null,
      datos.num_beneficiarios || null, datos.observaciones || null,
      id,
    ];
    const { rows } = await query(sql, valores);
    return rows[0] || null;
  },

  // ── DELETE ────────────────────────────────────────────
  delete: async (id) => {
    const sql = `
      DELETE FROM comodatos.solicitud_comodato
      WHERE pk_solicitud = $1
      RETURNING pk_solicitud`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },
};

module.exports = SolicitudModel;
