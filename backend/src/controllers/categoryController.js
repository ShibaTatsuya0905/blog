const { Category, Post } = require('../models');
const slugify = require('slugify');

class CategoryController {
    async createCategory(req, res) {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }
        try {
            const slug = slugify(name, { lower: true, strict: true });
            const existingCategory = await Category.findOne({ where: { slug } });
            if (existingCategory) {
                return res.status(400).json({ message: 'Danh mục với slug này đã tồn tại' });
            }
            const newCategory = await Category.create({ name, slug, description });
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll({
                include: [{
                    model: Post,
                    as: 'posts',
                    attributes: ['id', 'title']
                }]
            });
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error: error.message });
        }
    }

    async getCategoryBySlug(req, res) {
        try {
            const category = await Category.findOne({
                where: { slug: req.params.slug },
                include: [{ model: Post, as: 'posts' }]
            });
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy thông tin danh mục', error: error.message });
        }
    }

    async updateCategory(req, res) {
        const { name, description } = req.body;
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            category.name = name || category.name;
            category.description = description === undefined ? category.description : description;
            if (name) {
                category.slug = slugify(name, { lower: true, strict: true });
            }
            await category.save();
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy danh mục' });
            }
            await category.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: error.message });
        }
    }
}
module.exports = new CategoryController();