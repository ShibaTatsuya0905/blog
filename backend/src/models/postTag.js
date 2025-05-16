// backend/src/models/postTag.js
module.exports = (sequelizeInstance, DataTypes) => {
  const PostTag = sequelizeInstance.define('PostTag', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Một phần của khóa chính phức hợp
      references: {
        model: 'posts', // Tên bảng posts
        key: 'id',
      },
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Một phần của khóa chính phức hợp
      references: {
        model: 'tags', // Tên bảng tags
        key: 'id',
      },
    },
  }, {
    tableName: 'post_tags',
    timestamps: false, // Bảng nối thường không cần timestamps
  });

  // Không cần định nghĩa associations ở đây vì nó đã được xử lý trong Post và Tag
  // PostTag.associate = (models) => {
  //   // models.PostTag.belongsTo(models.Post, { foreignKey: 'post_id' });
  //   // models.PostTag.belongsTo(models.Tag, { foreignKey: 'tag_id' });
  // };

  return PostTag;
};