// lib/setupDb.js - Vérification et initialisation de la base de données PostgreSQL
import pool from '@/lib/db';

async function setupDatabase() {
    const client = await pool.connect();
    try {
        // Vérification si la table 'users' existe déjà
        const tableCheck = await client.query(`SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'users'
        );`);

        if (tableCheck.rows[0].exists) {
            console.log('✅ Les tables existent déjà. Aucune action requise.');
            return;
        }

        // Création des tables si elles n'existent pas
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                wallet_address VARCHAR(42) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE,
                score INTEGER DEFAULT 0,
                cheat INTEGER DEFAULT 0,
                bot INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS metadata (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE REFERENCES users(username),
                head VARCHAR(255),
                eyes VARCHAR(255),
                arm VARCHAR(255),
                neck VARCHAR(255),
                rarity VARCHAR(20) DEFAULT 'Common'
            );

            CREATE TABLE IF NOT EXISTS user_access_tokens (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE,
                user_id BIGINT UNIQUE,
                user_wallet_id INTEGER UNIQUE REFERENCES users(id),
                avatarUrl VARCHAR(250),
                metadata_set BOOLEAN DEFAULT FALSE,
                metadata_id INTEGER REFERENCES metadata(id),
                pac_fidelity INTEGER DEFAULT 0,
                discord_id BIGINT UNIQUE,
                discord_username VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS score_twitter (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES user_access_tokens(user_id),
                score INTEGER NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS score_users_daily (
                id SERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES user_access_tokens(user_id),
                username VARCHAR(50),
                score INTEGER NOT NULL,
                date DATE NOT NULL
            );
        `);
        console.log('📦 Base de données initialisée avec succès !');
    } catch (err) {
        console.error('❌ Erreur lors de la création des tables:', err);
    } finally {
        client.release();
    }
}

setupDatabase();
