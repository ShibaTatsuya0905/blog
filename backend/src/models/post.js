// backend/src/models/post.js
// const slugify = require('slugify'); // If you want Post to auto-create slug (handled in controller)

module.exports = (sequelizeInstance, DataTypes) => {
  const Post = sequelizeInstance.define('Post', {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_image_url: {
      type: DataTypes.TEXT, // <<<< THIS IS THE CRITICAL CHANGE
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references are defined by associations and foreign key constraints
    },
    category_id: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      // references are defined by associations and foreign key constraints
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // hooks: {
    //   beforeValidate: (post) => {
    //     if (post.title && !post.slug) {
    //       post.slug = slugify(post.title, { lower: true, strict: true }) + '-' + Date.now();
    //     }
    //   }
    // }
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'authorDetails', // Alias for User model when accessed from Post
    });

    Post.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'categoryDetails', // Alias for Category model
    });

    Post.belongsToMany(models.Tag, {
      through: models.PostTag, // The join table model
      foreignKey: 'post_id',   // Foreign key in PostTag that points to Post
      otherKey: 'tag_id',      // Foreign key in PostTag that points to Tag
      as: 'tags',              // Alias for Tag model when accessed from Post
    });
  };

  return Post;
};