const slugify = require('slugify');

module.exports = (sequelizeInstance, DataTypes) => {
  const Category = sequelizeInstance.define('Category', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = slugify(category.name, { lower: true, strict: true });
        }
      },
    }
  });

  Category.associate = (models) => {
    Category.hasMany(models.Post, {
      foreignKey: 'category_id',
      as: 'posts',
    });
  };

  return Category;
};