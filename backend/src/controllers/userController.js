const { User, sequelize, Sequelize: { Op } } = require('../models');
const fs = require('fs');
const path = require('path');

class UserController {
    async getMyProfile(req, res) {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Lỗi xác thực người dùng. Không tìm thấy thông tin người dùng trong request.' });
        }
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân.', error: error.message });
        }
    }

    async updateMyProfile(req, res) {
        if (!req.user || !req.user.id) {
            if (req.file) { fs.unlink(req.file.path, err => { if (err) console.error("Error deleting uploaded file for unauthenticated user:", err); });}
            return res.status(401).json({ message: 'Lỗi xác thực người dùng.' });
        }

        const { username } = req.body;
        const userId = req.user.id;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                if (req.file) { fs.unlink(req.file.path, err => { if (err) console.error("Error deleting uploaded file for non-existent user:", err); });}
                return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
            }

            let changesMade = false;

            if (username && username.trim() !== '' && username !== user.username) {
                const usernameExists = await User.findOne({
                    where: { username: username.trim(), id: { [Op.ne]: userId } }
                });
                if (usernameExists) {
                    if (req.file) { fs.unlinkSync(req.file.path); }
                    return res.status(400).json({ message: 'Username này đã được sử dụng bởi người khác.' });
                }
                user.username = username.trim();
                changesMade = true;
            }

            if (req.file) {
                const oldAvatarPath = user.avatar_url;
                const newAvatarRelativePath = `/uploads/avatars/${req.file.filename}`;
                user.avatar_url = newAvatarRelativePath;
                changesMade = true;

                if (oldAvatarPath && oldAvatarPath !== '/default-avatar.png' && !oldAvatarPath.startsWith('http')) {
                    const fullOldPath = path.join(__dirname, '..', '..', 'public', oldAvatarPath);
                    if (fs.existsSync(fullOldPath)) {
                        fs.unlink(fullOldPath, err => {
                            if (err) console.error("Error deleting old avatar:", err);
                        });
                    }
                }
            }

            if (changesMade) {
                await user.save();
            }

            const updatedUser = await User.findByPk(userId, {
                attributes: { exclude: ['password_hash'] }
            });

            res.json({ message: changesMade ? 'Thông tin cá nhân đã được cập nhật.' : 'Không có thay đổi nào được thực hiện.', user: updatedUser });

        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting uploaded file after save error:", err);
                });
            }
            if (error.name === 'SequelizeUniqueConstraintError') {
                 return res.status(400).json({ message: 'Lỗi ràng buộc duy nhất, có thể username đã tồn tại.', fields: error.fields });
            }
            res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin cá nhân.', error: error.message });
        }
    }
}

module.exports = new UserController();