const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool
 * Updated to support Cloud Database (Neon)
 */

// 👇 Check if we have a Cloud URL from .env
const isCloudConnection = !!process.env.DATABASE_URL;

const poolConfig = isCloudConnection
    ? {
        // ☁️ CLOUD CONFIG (Neon)
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Neon/Cloud DBs
        }
    }
    : {
        // 🏠 LOCAL CONFIG (Fallback)
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'campus_placement',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
    };

const pool = new Pool({
    ...poolConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for cloud latency
});

// Test connection
pool.on('connect', () => {
    console.log(isCloudConnection 
        ? '✅ Connected to CLOUD Database (Neon)' 
        : '✅ Connected to LOCAL Database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});

/**
 * Execute a query with automatic connection handling
 */
const query = async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
        // console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    }

    return result;
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
    const client = await pool.connect();
    return client;
};

module.exports = {
    pool,
    query,
    getClient
};