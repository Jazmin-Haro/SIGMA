// src/models/entrega.model.js
'use strict';
const { query, getClient } = require('../config/database');

const EntregaModel = {
  findAll: async () => {
    const { rows } = await query(
      'SELECT * FROM comodatos.entrega_comodato ORDER BY fecha_registro DESC'
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.entrega_comodato WHERE pk_entrega = $1', [id]
    );
    return rows[0] || null;
  },
  create: async (datos) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const sql = `
        INSERT INTO comodatos.entrega_comodato
          (fk_comodato, fk_maquinaria, numero_economico, fecha_entrega,
           nombre_receptor, cargo_receptor, ubicacion_entrega, horas_entrega,
           estado_motor, estado_llantas, estado_asiento, nivel_combustible,
           rayones, descripcion_rayones, piezas_faltantes,
           observaciones_checklist, registrado_por)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING *`;
      const { rows } = await client.query(sql, [
        datos.fk_comodato, datos.fk_maquinaria || null,
        datos.numero_economico || null, datos.fecha_entrega,
        datos.nombre_receptor, datos.cargo_receptor || null,
        datos.ubicacion_entrega || null, datos.horas_entrega || null,
        datos.estado_motor || 'bueno', datos.estado_llantas || 'bueno',
        datos.estado_asiento || 'bueno', datos.nivel_combustible || 'lleno',
        datos.rayones || false, datos.descripcion_rayones || null,
        datos.piezas_faltantes || null, datos.observaciones_checklist || null,
        datos.registrado_por || null,
      ]);
      // Cambiar comodato a activo
      await client.query(
        `UPDATE comodatos.comodato SET estado = 'activo' WHERE pk_comodato = $1`,
        [datos.fk_comodato]
      );
      // Actualizar ubicación de maquinaria
      if (datos.fk_maquinaria) {
        await client.query(
          `UPDATE comodatos.maquinaria_local
           SET estado_operativo = 'prestada', ubicacion = $1
           WHERE pk_maquinaria = $2`,
          [datos.ubicacion_entrega || 'campo', datos.fk_maquinaria]
        );
      }
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.entrega_comodato WHERE pk_entrega = $1 RETURNING pk_entrega', [id]
    );
    return rows[0] || null;
  },
};

module.exports = EntregaModel;
