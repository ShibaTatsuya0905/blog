// backend/src/config/db.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config(); // Load biến môi trường

const DB_NAME = process.env.DB_NAME || 'anime_blog_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // Mật khẩu mặc định nếu không có trong .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL khi dev
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.DataTypes = DataTypes;

module.exports = db;