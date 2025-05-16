// backend/src/models/tag.js
const slugify = require('slugify');

module.exports = (sequelizeInstance, DataTypes) => {
  const Tag = sequelizeInstance.define('Tag', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(70),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Chỉ có created_at theo schema
    hooks: {
      beforeValidate: (tag) => {
        if (tag.name && !tag.slug) {
          tag.slug = slugify(tag.name, { lower: true, strict: true });
        }
      },
    }
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Post, {
      through: 'PostTag', // Tên model của bảng trung gian (Sequelize sẽ tự tạo nếu không có file model riêng)
      foreignKey: 'tag_id',
      otherKey: 'post_id',
      as: 'posts',
    });
  };

  return Tag;
};