// backend/src/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), tagController.createTag)
    .get(tagController.getAllTags);

router.route('/:slug')
    .get(tagController.getTagBySlug);

router.route('/:id')
    .put(protect, authorize('admin'), tagController.updateTag)
    .delete(protect, authorize('admin'), tagController.deleteTag);

module.exports = router;