// src/config/database.js
// Conexión a PostgreSQL mediante Pool de conexiones
'use strict';

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'crean',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max:      parseInt(process.env.DB_POOL_MAX    || '10'),
  idleTimeoutMillis:    parseInt(process.env.DB_POOL_IDLE    || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE || '60000'),
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Error de conexión a PostgreSQL:', err.message);
    process.exit(1);
  }
  release();
  console.log('✅  Conectado a PostgreSQL — Base de datos:', process.env.DB_NAME);
});

// Helper para ejecutar queries
const query = (text, params) => pool.query(text, params);

// Helper para transacciones
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
