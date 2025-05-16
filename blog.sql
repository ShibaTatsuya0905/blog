DROP DATABASE IF EXISTS anime_blog_db;

CREATE database if not exists anime_blog_db;
USE anime_blog_db;
select * from posts;
select * from users;
-- Bảng users (Quản trị viên)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng categories (Danh mục)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tags (Thẻ)
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(70) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng posts (Bài viết)
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    user_id INT NOT NULL,
    category_id INT,
    views INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tạo index cho slug của posts để tìm kiếm nhanh hơn
CREATE INDEX idx_posts_slug ON posts(slug);
-- Tạo index cho status của posts
CREATE INDEX idx_posts_status ON posts(status);


-- Bảng post_tags (Bảng nối giữa posts và tags)
CREATE TABLE post_tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_posttags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_posttags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Bảng comments (Bình luận)
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100),
    user_id INT, -- Có thể NULL nếu không phải user đăng nhập
    content TEXT NOT NULL,
    parent_comment_id INT, -- Cho bình luận trả lời (threaded comments)
    status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Tạo index cho post_id trong comments để query nhanh hơn
CREATE INDEX idx_comments_post_id ON comments(post_id);
-- Tạo index cho status của comments
CREATE INDEX idx_comments_status ON comments(status);
ALTER TABLE posts MODIFY COLUMN cover_image_url TEXT;
DESCRIBE posts;
