// src/models/mantenimiento.model.js
'use strict';
const { query, getClient } = require('../config/database');

const MantenimientoModel = {
  findAll: async () => {
    const sql = `
      SELECT mt.*, m.numero_economico AS eco, m.tipo_equipo, m.modelo
      FROM comodatos.mantenimiento mt
      LEFT JOIN comodatos.maquinaria_local m ON mt.fk_maquinaria = m.pk_maquinaria
      ORDER BY mt.fecha_registro DESC`;
    const { rows } = await query(sql);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.mantenimiento WHERE pk_mantenimiento = $1', [id]
    );
    return rows[0] || null;
  },

  create: async (datos) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const sql = `
        INSERT INTO comodatos.mantenimiento
          (fk_comodato, fk_falla, fk_maquinaria, numero_economico,
           tipo_manto, descripcion, taller, tecnico, costo_estimado,
           fecha_inicio, fecha_fin_estimada, repuestos_usados,
           observaciones, registrado_por)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *`;
      const { rows } = await client.query(sql, [
        datos.fk_comodato || null, datos.fk_falla || null,
        datos.fk_maquinaria || null, datos.numero_economico || null,
        datos.tipo_manto || 'correctivo', datos.descripcion,
        datos.taller || null, datos.tecnico || null,
        datos.costo_estimado || null, datos.fecha_inicio || null,
        datos.fecha_fin_estimada || null, datos.repuestos_usados || null,
        datos.observaciones || null, datos.registrado_por || null,
      ]);
      const manto = rows[0];

      // Cambiar maquinaria a "mantenimiento"
      if (datos.fk_maquinaria) {
        await client.query(
          `UPDATE comodatos.maquinaria_local
           SET estado_operativo = 'mantenimiento'
           WHERE pk_maquinaria = $1`,
          [datos.fk_maquinaria]
        );
      }

      await client.query('COMMIT');
      return manto;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Marcar mantenimiento como terminado y liberar maquinaria
  terminar: async (id, costo_real = null, observaciones = null) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `UPDATE comodatos.mantenimiento
         SET estado = 'terminado',
             fecha_fin_real = CURRENT_DATE,
             costo_real = COALESCE($1, costo_real),
             observaciones = COALESCE($2, observaciones)
         WHERE pk_mantenimiento = $3
         RETURNING *`,
        [costo_real, observaciones, id]
      );
      const manto = rows[0];
      if (manto?.fk_maquinaria) {
        await client.query(
          `UPDATE comodatos.maquinaria_local
           SET estado_operativo = 'disponible', ubicacion = 'CREAN'
           WHERE pk_maquinaria = $1`,
          [manto.fk_maquinaria]
        );
      }
      await client.query('COMMIT');
      return manto;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.mantenimiento WHERE pk_mantenimiento = $1 RETURNING pk_mantenimiento',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = MantenimientoModel;
