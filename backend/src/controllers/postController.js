const { Post, User, Category, Tag, sequelize, Sequelize: { Op } } = require('../models');
const slugify = require('slugify');

class PostController {
  async createPost(req, res) {
    const { title, content, slug, status, excerpt, cover_image_url, category_id, tagIds } = req.body;
    const user_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
    }

    let finalSlug = slug;
    if (!finalSlug || finalSlug.trim() === '') {
        if (title) {
            finalSlug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g }) + '-' + Date.now();
        }
    } else {
        finalSlug = slugify(finalSlug, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
    }

    if (!finalSlug) {
        return res.status(400).json({ message: 'Không thể tạo slug. Vui lòng cung cấp tiêu đề hoặc slug hợp lệ.' });
    }

    try {
      const existingPostBySlug = await Post.findOne({ where: { slug: finalSlug } });
      if (existingPostBySlug) {
        return res.status(400).json({ message: `Slug '${finalSlug}' đã tồn tại. Vui lòng chọn slug khác.` });
      }

      const newPostData = {
        title,
        content,
        slug: finalSlug,
        status: status || 'draft',
        excerpt: excerpt || null,
        cover_image_url: cover_image_url || null,
        user_id,
        category_id: category_id || null,
        published_at: (status === 'published') ? new Date() : null,
      };

      const newPost = await Post.create(newPostData);

      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        await newPost.setTags(tagIds.map(id => parseInt(id)).filter(id => !isNaN(id)));
      }

      const resultPost = await Post.findByPk(newPost.id, {
        include: [
          { model: User, as: 'authorDetails', attributes: ['id', 'username'] },
          { model: Category, as: 'categoryDetails', attributes: ['id', 'name', 'slug'] },
          { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
        ]
      });

      res.status(201).json(resultPost);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.name === 'SequelizeUniqueConstraintError' || (error.parent && error.parent.code === 'ER_DUP_ENTRY')) {
        return res.status(400).json({ message: 'Slug đã tồn tại hoặc có lỗi ràng buộc duy nhất.', fields: error.fields });
      }
      res.status(500).json({ message: 'Lỗi server khi tạo bài viết', error: error.message });
    }
  }

  async getPosts(req, res) {
    const { categoryId, tagId, search, page = 1, limit = 5, excludePostId } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    let whereClause = {
        status: 'published'
    };
    let includeClauses = [
        { model: User, as: 'authorDetails', attributes: ['id', 'username', 'email'] },
        { model: Category, as: 'categoryDetails', attributes: ['id', 'name', 'slug'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
    ];

    if (categoryId) {
        whereClause.category_id = parseInt(categoryId, 10);
    }
    if (excludePostId) {
        whereClause.id = { [Op.ne]: parseInt(excludePostId, 10) };
    }

    if (search) {
        whereClause.title = { [Op.like]: `%${search}%` };
    }

    let postIdsWithTag = null;
    if (tagId) {
        try {
            const tagToFilter = await Tag.findByPk(parseInt(tagId, 10), {
                include: [{
                    model: Post,
                    as: 'posts',
                    attributes: ['id'],
                    through: { attributes: [] }
                }]
            });
            if (tagToFilter && tagToFilter.posts) {
                postIdsWithTag = tagToFilter.posts.map(p => p.id);
                if (postIdsWithTag.length === 0) {
                    return res.status(200).json({ totalPages: 0, currentPage: 1, totalPosts: 0, posts: [] });
                }
                if (whereClause.id) {
                    whereClause.id = { [Op.and]: [whereClause.id, { [Op.in]: postIdsWithTag }] };
                } else {
                    whereClause.id = { [Op.in]: postIdsWithTag };
                }
            } else {
                 return res.status(200).json({ totalPages: 0, currentPage: 1, totalPosts: 0, posts: [] });
            }
        } catch (tagError) {
            console.error("[BACKEND PostController] Error filtering by tagId:", tagError);
        }
    }

    try {
      const { count, rows: posts } = await Post.findAndCountAll({
        where: whereClause,
        include: includeClauses,
        order: [['published_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset: offset,
        distinct: true,
        subQuery: false
      });
      res.status(200).json({
        totalPages: Math.ceil(count / parseInt(limit, 10)),
        currentPage: parseInt(page, 10),
        totalPosts: count,
        posts
      });
    } catch (error) {
      console.error('[BACKEND PostController] Error fetching posts:', error);
      res.status(500).json({ message: 'Lỗi khi tải danh sách bài viết', error: error.message });
    }
  }

  async getPostById(req, res) {
    const idOrSlugFromParams = req.params.idOrSlug;

    let post;

    if (!idOrSlugFromParams || typeof idOrSlugFromParams !== 'string' || idOrSlugFromParams.trim() === '' || idOrSlugFromParams.toLowerCase() === 'undefined' || idOrSlugFromParams.toLowerCase() === 'null') {
        return res.status(400).json({ message: 'ID hoặc Slug của bài viết là bắt buộc và không hợp lệ.' });
    }

    try {
        const queryOptions = {
            include: [
                { model: User, as: 'authorDetails', attributes: ['id', 'username', 'email'] },
                { model: Category, as: 'categoryDetails', attributes: ['id', 'name', 'slug'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }
            ]
        };

        const parsedId = parseInt(idOrSlugFromParams, 10);

        if (!isNaN(parsedId) && parsedId > 0 && parsedId.toString() === idOrSlugFromParams) {
            post = await Post.findByPk(parsedId, queryOptions);
        } else {
            post = await Post.findOne({
                where: { slug: idOrSlugFromParams },
                ...queryOptions
            });
        }

      if (!post) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      }

      if (post.status === 'published' && !req.headers['user-agent']?.toLowerCase().includes('bot')) {
         post.increment('views').catch(err => console.error("[BACKEND PostController getPostById] Error incrementing views:", err.message));
      }
      
      res.status(200).json(post);

    } catch (error) {
      console.error(`[BACKEND PostController getPostById] Error fetching post with id/slug ${idOrSlugFromParams}:`, error);
      res.status(500).json({ message: 'Lỗi server khi tải chi tiết bài viết', error: error.message });
    }
  }

  async updatePost(req, res) {
    const postId = req.params.idOrSlug;
    const { title, content, slug, status, excerpt, cover_image_url, category_id, tagIds } = req.body;
    const user_id_from_token = req.user.id;

    const actualPostId = parseInt(postId, 10);
    if (isNaN(actualPostId)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ để cập nhật.' });
    }

    try {
        const post = await Post.findByPk(actualPostId);
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        if (post.user_id !== user_id_from_token && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này.' });
        }

        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;

        if (slug && slug.trim() !== '' && slug !== post.slug) {
            const newSlug = slugify(slug, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
            const existingPostBySlug = await Post.findOne({ where: { slug: newSlug, id: { [Op.ne]: actualPostId } } });
            if (existingPostBySlug) {
                return res.status(400).json({ message: `Slug '${newSlug}' đã được sử dụng bởi bài viết khác.` });
            }
            post.slug = newSlug;
        } else if ((!slug || slug.trim() === '') && title && title !== post.title) {
             post.slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g }) + '-' + Date.now();
        }

        if (status !== undefined) post.status = status;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (cover_image_url !== undefined) post.cover_image_url = cover_image_url;
        if (category_id !== undefined) post.category_id = category_id ? parseInt(category_id) : null;
        
        const previousStatus = post.status;
        if (status === 'published' && previousStatus !== 'published') {
            post.published_at = new Date();
        }

        await post.save();

        if (tagIds && Array.isArray(tagIds)) {
            await post.setTags(tagIds.map(id => parseInt(id)).filter(id => !isNaN(id)));
        } else if (tagIds === null || (Array.isArray(tagIds) && tagIds.length === 0)) {
            await post.setTags([]);
        }

        const updatedPost = await Post.findByPk(post.id, {
            include: [
                { model: User, as: 'authorDetails', attributes: ['id', 'username'] },
                { model: Category, as: 'categoryDetails', attributes: ['id', 'name', 'slug'] },
                { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] }  }
            ]
        });

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(`Error updating post with id ${actualPostId}:`, error);
         if (error.name === 'SequelizeUniqueConstraintError' || (error.parent && error.parent.code === 'ER_DUP_ENTRY')) {
            return res.status(400).json({ message: 'Slug đã tồn tại hoặc có lỗi ràng buộc duy nhất.', fields: error.fields });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error: error.message });
    }
  }

    async deletePost(req, res) {
        const postId = req.params.idOrSlug; 
        const actualPostId = parseInt(postId, 10);

        if (isNaN(actualPostId)) {
            return res.status(400).json({ message: 'ID bài viết không hợp lệ để xóa.'});
        }
        try {
          const post = await Post.findByPk(actualPostId);

          if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
          }

          if (post.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bài viết này.' });
          }
          await post.destroy();
          res.status(204).send();
        } catch (error) {
          console.error(`Error deleting post with id ${actualPostId}:`, error);
          res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: error.message });
        }
    }

    async getSuggestedPosts(req, res) {
        const currentPostId = parseInt(req.params.currentPostId, 10);
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;
        const limit = parseInt(req.query.limit, 10) || 3;

        if (isNaN(currentPostId)) {
            return res.status(400).json({ message: 'ID bài viết hiện tại không hợp lệ.' });
        }

        let whereClause = {
            id: { [Op.ne]: currentPostId },
            status: 'published'
        };

        if (categoryId) {
            whereClause.category_id = categoryId;
        }

        try {
            const suggestedPosts = await Post.findAll({
                where: whereClause,
                limit: limit,
                order: [['published_at', 'DESC']],
                include: [
                    { model: User, as: 'authorDetails', attributes: ['username'] },
                    { model: Category, as: 'categoryDetails', attributes: ['name', 'slug'] },
                ],
                attributes: ['id', 'title', 'slug', 'cover_image_url', 'excerpt', 'published_at', 'views']
            });

            if (suggestedPosts.length < limit && categoryId) {
                const remainingLimit = limit - suggestedPosts.length;
                const existingIds = [currentPostId, ...suggestedPosts.map(p => p.id)];

                const fallbackPosts = await Post.findAll({
                    where: {
                        id: { [Op.notIn]: existingIds },
                        status: 'published'
                    },
                    limit: remainingLimit,
                    order: [['published_at', 'DESC']],
                    include: [
                        { model: User, as: 'authorDetails', attributes: ['username'] },
                        { model: Category, as: 'categoryDetails', attributes: ['name', 'slug'] },
                    ],
                    attributes: ['id', 'title', 'slug', 'cover_image_url', 'excerpt', 'published_at', 'views']
                });
                suggestedPosts.push(...fallbackPosts);
            }

            res.status(200).json(suggestedPosts);
        } catch (error) {
            console.error('Error fetching suggested posts:', error);
            res.status(500).json({ message: 'Lỗi server khi tải bài viết đề xuất', error: error.message });
        }
    }
}
module.exports = new PostController();