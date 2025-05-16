const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db');

const sequelize = dbConfig.sequelize;
const Sequelize = dbConfig.Sequelize;
const DataTypes = dbConfig.DataTypes;

const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const modelDefinition = require(path.join(__dirname, file));
    const model = modelDefinition(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("Models loaded and associated:", Object.keys(db));

module.exports = db;