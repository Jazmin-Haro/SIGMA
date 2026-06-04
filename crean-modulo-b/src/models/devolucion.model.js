// src/models/devolucion.model.js
'use strict';
const { query, getClient } = require('../config/database');

const DevolucionModel = {
  findAll: async () => {
    const { rows } = await query(
      'SELECT * FROM comodatos.devolucion_comodato ORDER BY fecha_registro DESC'
    );
    return rows;
  },
  findById: async (id) => {
    const { rows } = await query(
      'SELECT * FROM comodatos.devolucion_comodato WHERE pk_devolucion = $1', [id]
    );
    return rows[0] || null;
  },
  create: async (datos) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const sql = `
        INSERT INTO comodatos.devolucion_comodato
          (fk_comodato, fk_maquinaria, numero_economico, fecha_devolucion,
           horas_regreso, tipo_devolucion, tiene_danos, requiere_mantenimiento,
           estado_cierre, estado_motor, estado_llantas, nivel_combustible,
           rayones_nuevos, descripcion_danos, observaciones, registrado_por)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *`;
      const { rows } = await client.query(sql, [
        datos.fk_comodato, datos.fk_maquinaria || null,
        datos.numero_economico || null, datos.fecha_devolucion,
        datos.horas_regreso || null, datos.tipo_devolucion || 'voluntaria',
        datos.tiene_danos || false, datos.requiere_mantenimiento || false,
        datos.estado_cierre || 'conforme',
        datos.estado_motor || null, datos.estado_llantas || null,
        datos.nivel_combustible || null, datos.rayones_nuevos || false,
        datos.descripcion_danos || null, datos.observaciones || null,
        datos.registrado_por || null,
      ]);
      const dev = rows[0];

      // Cerrar comodato
      await client.query(
        `UPDATE comodatos.comodato
         SET estado = 'finalizado', fecha_devolucion_real = $1
         WHERE pk_comodato = $2`,
        [datos.fecha_devolucion, datos.fk_comodato]
      );

      // Actualizar maquinaria
      const nuevoEstado = datos.tiene_danos ? 'mantenimiento' : 'disponible';
      if (datos.fk_maquinaria) {
        await client.query(
          `UPDATE comodatos.maquinaria_local
           SET estado_operativo = $1,
               horas_actuales = COALESCE($2, horas_actuales),
               ubicacion = 'CREAN'
           WHERE pk_maquinaria = $3`,
          [nuevoEstado, datos.horas_regreso || null, datos.fk_maquinaria]
        );
      }

      // Si hay daños, crear falla automáticamente
      if (datos.tiene_danos) {
        await client.query(
          `INSERT INTO comodatos.falla
             (fk_comodato, fk_maquinaria, numero_economico,
              tipo, urgencia, descripcion, origen, estado)
           VALUES ($1,$2,$3,'dano_devolucion','normal',$4,'devolucion','pendiente')`,
          [
            datos.fk_comodato, datos.fk_maquinaria || null,
            datos.numero_economico || null,
            datos.descripcion_danos || 'Daño detectado en devolución de comodato',
          ]
        );
      }

      await client.query('COMMIT');
      return dev;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  delete: async (id) => {
    const { rows } = await query(
      'DELETE FROM comodatos.devolucion_comodato WHERE pk_devolucion = $1 RETURNING pk_devolucion',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = DevolucionModel;
