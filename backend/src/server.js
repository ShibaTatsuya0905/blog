// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Cần cho static files
const db = require('./models'); // Đường dẫn đến models/index.js

dotenv.config();

// Import Routes
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const userRoutes = require('./routes/userRoutes'); // << KIỂM TRA DÒNG NÀY

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files (cho avatars) - Đặt TRƯỚC các API routes nếu có thể gây xung đột
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// Hoặc: app.use('/public', express.static(path.join(__dirname, 'public'))); (tùy theo cách bạn lưu user.avatar_url)


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes); // << KIỂM TRA KỸ DÒNG NÀY. Phải là /api/users

app.get('/', (req, res) => {
  res.send('Backend server for Anime Manga Blog is running!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack); // Log lỗi ra console backend
    res.status(err.status || 500).json({
        message: err.message || 'Đã có lỗi xảy ra trên server.',
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Chỉ gửi stack trace khi dev
    });
});

// Đồng bộ Database và Khởi động Server
db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('Database synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API base URL should be http://localhost:${PORT}/api`);
      console.log(`Profile route should be http://localhost:${PORT}/api/users/profile`);
    });
  })
  .catch(err => {
    console.error('Error synchronizing database OR starting server:', err);
  });