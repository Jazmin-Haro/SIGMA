// src/models/comodato.model.js
// Capa Model — Operaciones CRUD sobre comodatos.comodato
'use strict';

const { query, getClient } = require('../config/database');

const ComodatoModel = {

  findAll: async () => {
    const sql = `
      SELECT c.*,
             m.tipo_equipo, m.marca, m.modelo
      FROM comodatos.comodato c
      LEFT JOIN comodatos.maquinaria_local m
             ON c.fk_maquinaria = m.pk_maquinaria
      ORDER BY c.fecha_registro DESC`;
    const { rows } = await query(sql);
    return rows;
  },

  findById: async (id) => {
    const sql = `
      SELECT c.*,
             m.tipo_equipo, m.marca, m.modelo, m.estado_operativo
      FROM comodatos.comodato c
      LEFT JOIN comodatos.maquinaria_local m
             ON c.fk_maquinaria = m.pk_maquinaria
      WHERE c.pk_comodato = $1`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },

  findByEstado: async (estado) => {
    const sql = `
      SELECT * FROM comodatos.comodato
      WHERE estado = $1
      ORDER BY fecha_registro DESC`;
    const { rows } = await query(sql, [estado]);
    return rows;
  },

  // CREATE — usa transacción para también actualizar estado de maquinaria
  create: async (datos) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const sql = `
        INSERT INTO comodatos.comodato
          (fk_solicitud, fk_maquinaria, numero_economico_maq, descripcion_maquinaria,
           nombre_comodatario, telefono, ejido, municipio, cultivo,
           superficie_ha, num_beneficiarios, fecha_entrega,
           fecha_devolucion_esperada, dias_prestamo, oficio_comodato,
           horas_entrega, registrado_por, observaciones)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING *`;
      const valores = [
        datos.fk_solicitud || null, datos.fk_maquinaria || null,
        datos.numero_economico_maq || null, datos.descripcion_maquinaria || null,
        datos.nombre_comodatario, datos.telefono || null,
        datos.ejido || null, datos.municipio || null,
        datos.cultivo || null, datos.superficie_ha || null,
        datos.num_beneficiarios || null, datos.fecha_entrega || null,
        datos.fecha_devolucion_esperada || null, datos.dias_prestamo || null,
        datos.oficio_comodato || null, datos.horas_entrega || null,
        datos.registrado_por || null, datos.observaciones || null,
      ];
      const { rows } = await client.query(sql, valores);
      const comodato = rows[0];

      // Actualizar estado de maquinaria a "prestada"
      if (datos.fk_maquinaria) {
        await client.query(
          `UPDATE comodatos.maquinaria_local
           SET estado_operativo = 'prestada'
           WHERE pk_maquinaria = $1`,
          [datos.fk_maquinaria]
        );
      }

      await client.query('COMMIT');
      return comodato;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  updateEstado: async (id, estado, fecha_devolucion_real = null) => {
    const sql = `
      UPDATE comodatos.comodato
      SET estado = $1,
          fecha_devolucion_real = COALESCE($2, fecha_devolucion_real)
      WHERE pk_comodato = $3
      RETURNING *`;
    const { rows } = await query(sql, [estado, fecha_devolucion_real, id]);
    return rows[0] || null;
  },

  delete: async (id) => {
    const sql = `
      DELETE FROM comodatos.comodato
      WHERE pk_comodato = $1
      RETURNING pk_comodato`;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  },
};

module.exports = ComodatoModel;
