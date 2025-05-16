const { Tag, Post } = require('../models');
const slugify = require('slugify');

class TagController {
    async createTag(req, res) {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Tên thẻ là bắt buộc' });
        }
        try {
            const slug = slugify(name, { lower: true, strict: true });
            const existingTag = await Tag.findOne({ where: { slug } });
            if (existingTag) {
                return res.status(400).json({ message: 'Thẻ với slug này đã tồn tại' });
            }
            const newTag = await Tag.create({ name, slug });
            res.status(201).json(newTag);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo thẻ', error: error.message });
        }
    }

    async getAllTags(req, res) {
        try {
            const tags = await Tag.findAll({
                include: [{
                    model: Post,
                    as: 'posts',
                    attributes: ['id', 'title']
                }]
            });
            res.status(200).json(tags);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách thẻ', error: error.message });
        }
    }

    async getTagBySlug(req, res) {
        try {
            const tag = await Tag.findOne({
                where: { slug: req.params.slug },
                include: [{ model: Post, as: 'posts' }]
            });
            if (!tag) {
                return res.status(404).json({ message: 'Không tìm thấy thẻ' });
            }
            res.status(200).json(tag);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy thông tin thẻ', error: error.message });
        }
    }

    async updateTag(req, res) {
        const { name } = req.body;
        try {
            const tag = await Tag.findByPk(req.params.id);
            if (!tag) {
                return res.status(404).json({ message: 'Không tìm thấy thẻ' });
            }
            tag.name = name || tag.name;
            if (name) {
                tag.slug = slugify(name, { lower: true, strict: true });
            }
            await tag.save();
            res.status(200).json(tag);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật thẻ', error: error.message });
        }
    }

    async deleteTag(req, res) {
        try {
            const tag = await Tag.findByPk(req.params.id);
            if (!tag) {
                return res.status(404).json({ message: 'Không tìm thấy thẻ' });
            }
            await tag.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa thẻ', error: error.message });
        }
    }
}
module.exports = new TagController();