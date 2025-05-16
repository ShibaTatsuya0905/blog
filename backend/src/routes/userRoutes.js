// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware'); // Import middleware upload

router.route('/profile')
    .get(protect, userController.getMyProfile)
    // Sử dụng middleware uploadAvatar.single('ten_field_file')
    // 'avatar' là tên của input file trên frontend
    .put(protect, uploadAvatar.single('avatar'), userController.updateMyProfile);

module.exports = router;