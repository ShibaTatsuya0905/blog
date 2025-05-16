const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!process.env.JWT_SECRET) {
                console.error('[Protect Middleware] CRITICAL: JWT_SECRET is not defined in .env');
                return res.status(500).json({ message: 'Lỗi cấu hình server (JWT Secret missing).' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded.id) {
                console.warn('[Protect Middleware] Decoded token does not contain user ID.');
                return res.status(401).json({ message: 'Token không hợp lệ (thiếu ID người dùng).' });
            }

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!req.user) {
                console.warn(`[Protect Middleware] User with ID ${decoded.id} not found in database.`);
                return res.status(401).json({ message: 'Không được phép, người dùng không tồn tại hoặc token đã bị vô hiệu hóa.' });
            }
            next();
        } catch (error) {
            console.error('[Protect Middleware] Token verification or DB error:', error.name, '-', error.message);
            let status = 401;
            let message = 'Không được phép, token không hợp lệ hoặc đã hết hạn.';

            if (error.name === 'TokenExpiredError') {
                message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            } else if (error.name === 'JsonWebTokenError') {
                message = 'Token không hợp lệ hoặc đã bị thay đổi.';
            } else if (error.name === 'NotBeforeError') {
                message = 'Token chưa có hiệu lực.';
            }
            return res.status(status).json({ message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Không được phép, yêu cầu không có token xác thực.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Yêu cầu xác thực để thực hiện hành động này.'});
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Người dùng với vai trò ${req.user.role} không có quyền truy cập tài nguyên này.` });
        }
        next();
    };
};

module.exports = { protect, authorize };