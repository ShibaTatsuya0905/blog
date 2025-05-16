// backend/src/models/user.js
const bcrypt = require('bcryptjs');

module.exports = (sequelizeInstance, DataTypes) => {
  const User = sequelizeInstance.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'user',
    },
    avatar_url: { // Thêm trường này
      type: DataTypes.STRING(255), // Hoặc DataTypes.TEXT nếu URL có thể rất dài
      allowNull: true,
      // defaultValue: '/default-avatar.png' // Hoặc null nếu không có default
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
         if (user.password_hash) {
           const salt = await bcrypt.genSalt(10);
           user.password_hash = await bcrypt.hash(user.password_hash, salt);
         }
       },
       beforeUpdate: async (user) => {
         if (user.changed('password_hash') && user.password_hash) {
           if (!user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
             const salt = await bcrypt.genSalt(10);
             user.password_hash = await bcrypt.hash(user.password_hash, salt);
           }
         }
       }
    }
  });

  User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'user_id',
      as: 'posts',
    });
  };

  return User;
};