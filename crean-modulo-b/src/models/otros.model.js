// src/models/traslado.model.js
'use strict';
const { query } = require('../config/database');

const TrasladoModel = {
  findAll: async () => {
    const { rows } = await query(
      'SELECT * FROM comodatos.operacion_traslado ORDER BY fecha_registro DESC'
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.operacion_traslado WHERE pk_traslado = $1', [id]
    );
    return rows[0] || null;
  },
  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.operacion_traslado
        (fk_comodato, tipo, destino, fecha_salida, fecha_llegada,
         fk_vehiculo, numero_economico_veh, km_salida, km_llegada,
         observaciones, registrado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`;
    const { rows } = await query(sql, [
      datos.fk_comodato, datos.tipo || 'entrega', datos.destino,
      datos.fecha_salida || null, datos.fecha_llegada || null,
      datos.fk_vehiculo || null, datos.numero_economico_veh || null,
      datos.km_salida || null, datos.km_llegada || null,
      datos.observaciones || null, datos.registrado_por || null,
    ]);
    return rows[0];
  },
  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.operacion_traslado WHERE pk_traslado = $1 RETURNING pk_traslado',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = TrasladoModel;


// ─────────────────────────────────────────────────────────
// src/models/documento.model.js
// ─────────────────────────────────────────────────────────
const DocumentoModel = {
  findAll: async () => {
    const { rows } = await query(
      'SELECT * FROM comodatos.documento_oficial ORDER BY fecha_registro DESC'
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.documento_oficial WHERE pk_documento = $1', [id]
    );
    return rows[0] || null;
  },
  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.documento_oficial
        (fk_comodato, tipo_documento, numero_folio, fecha_documento,
         contenido_json, estado, registrado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`;
    const { rows } = await query(sql, [
      datos.fk_comodato || null, datos.tipo_documento,
      datos.numero_folio, datos.fecha_documento || null,
      JSON.stringify(datos.contenido_json || {}),
      datos.estado || 'borrador', datos.registrado_por || null,
    ]);
    return rows[0];
  },
  updateEstado: async (id, estado) => {
    const { rows } = await query(
      `UPDATE comodatos.documento_oficial SET estado = $1
       WHERE pk_documento = $2 RETURNING *`,
      [estado, id]
    );
    return rows[0] || null;
  },
  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.documento_oficial WHERE pk_documento = $1 RETURNING pk_documento',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = { TrasladoModel, DocumentoModel };


// ─────────────────────────────────────────────────────────
// src/models/usuario.model.js
// ─────────────────────────────────────────────────────────
const UsuarioModel = {
  findByUsername: async (username) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.usuario WHERE username = $1 AND activo = true',
      [username]
    );
    return rows[0] || null;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT pk_usuario, username, nombre, rol, activo FROM comodatos.usuario WHERE pk_usuario = $1',
      [id]
    );
    return rows[0] || null;
  },
  create: async (datos) => {
    const sql = `
      INSERT INTO comodatos.usuario (username, password_hash, nombre, rol)
      VALUES ($1,$2,$3,$4) RETURNING pk_usuario, username, nombre, rol`;
    const { rows } = await query(sql, [
      datos.username, datos.password_hash, datos.nombre, datos.rol || 'operador',
    ]);
    return rows[0];
  },
};

module.exports = { TrasladoModel, DocumentoModel, UsuarioModel };
