// lib/db.js - Gestion de la connexion PostgreSQL
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    /*ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,*/
});

pool.connect()
    .then(client => {
        console.log('✅ Connexion à PostgreSQL réussie !');
        client.release(); // Libère la connexion immédiatement
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à PostgreSQL:', err);
    });


export default pool;