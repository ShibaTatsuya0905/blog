const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();
const { sendMail } = require('../config/emailConfig');
const { storeOtp, verifyOtp, removeOtpEntry } = require('../utils/otpStore');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

class AuthController {
    async requestRegistrationOtp(req, res) {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password.' });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: 'Địa chỉ email không hợp lệ.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        try {
            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email này đã được sử dụng.' });
            }

            const usernameExists = await User.findOne({ where: { username } });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username này đã tồn tại.' });
            }

            const userData = { username, email, password, role: role || 'user' };
            const otp = storeOtp(email, userData);

            const emailSubject = 'Mã Xác Thực Đăng Ký Tài Khoản - Anime Manga Blog';
            const emailHtmlContent = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Xác Thực Tài Khoản Anime Manga Blog</h2>
                    <p>Chào ${username},</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại Anime Manga Blog. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình đăng ký:</p>
                    <p style="font-size: 24px; font-weight: bold; color: #28a745; letter-spacing: 2px; text-align: center; padding: 10px; border: 1px dashed #ccc; background-color: #f8f9fa;">
                        ${otp}
                    </p>
                    <p>Mã OTP này sẽ có hiệu lực trong vòng <strong>10 phút</strong>.</p>
                    <p>Nếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email này. Tài khoản của bạn sẽ không được tạo nếu không có mã xác thực.</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #6c757d;">Trân trọng,<br>Đội ngũ Anime Manga Blog</p>
                </div>
            `;

            const emailSent = await sendMail(email, emailSubject, emailHtmlContent);

            if (emailSent) {
                res.status(200).json({ message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả Spam/Junk) và nhập mã để hoàn tất đăng ký.' });
            } else {
                removeOtpEntry(email);
                res.status(500).json({ message: 'Lỗi gửi email OTP. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.' });
            }
        } catch (error) {
            console.error('Error in requestRegistrationOtp:', error);
            res.status(500).json({ message: 'Lỗi server khi yêu cầu OTP.', error: error.message });
        }
    }

    async verifyOtpAndRegister(req, res) {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
        }
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ. OTP phải là 6 chữ số.' });
        }

        const verificationResult = verifyOtp(email, otp);

        if (!verificationResult.success) {
            return res.status(400).json({ message: verificationResult.message });
        }

        const userData = verificationResult.userData;
        if (!userData) {
            console.error(`CRITICAL: UserData not found for ${email} after successful OTP verification.`);
            return res.status(500).json({ message: 'Lỗi hệ thống: Không tìm thấy dữ liệu người dùng. Vui lòng thử đăng ký lại.' });
        }

        try {
            const userExists = await User.findOne({ where: { email: userData.email } });
            if (userExists) {
                removeOtpEntry(email);
                return res.status(400).json({ message: 'Email này đã được đăng ký bởi một người dùng khác.' });
            }

            const newUser = await User.create({
                username: userData.username,
                email: userData.email,
                password_hash: userData.password,
                role: userData.role || 'user',
            });

            removeOtpEntry(email);

            if (newUser) {
                res.status(201).json({
                    message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.'
                });
            } else {
                res.status(400).json({ message: 'Không thể tạo tài khoản. Dữ liệu không hợp lệ.' });
            }
        } catch (error) {
            console.error('Error in verifyOtpAndRegister (User.create):', error);
            res.status(500).json({ message: 'Lỗi server khi tạo tài khoản sau khi xác thực OTP.', error: error.message });
        }
    }

    async loginUser(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và password.' });
        }

        try {
            const user = await User.findOne({ where: { email } });

            if (user && (await user.isValidPassword(password))) {
                res.json({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user.id),
                });
            } else {
                res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
        }
    }

    async getMe(req, res) {
        if (req.user) {
            res.json({
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
    }
}

module.exports = new AuthController();