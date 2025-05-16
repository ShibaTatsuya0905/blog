// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Giả sử admin mới được quản lý

router.route('/')
    .post(protect, authorize('admin'), categoryController.createCategory)
    .get(categoryController.getAllCategories);

router.route('/:slug') // Hoặc /:id nếu bạn dùng ID
    .get(categoryController.getCategoryBySlug);

router.route('/:id') // ID cho update và delete
    .put(protect, authorize('admin'), categoryController.updateCategory)
    .delete(protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;