import React from 'react';
import PostList from '../components/PostList';

function Home() {
  return (
   <div>
      <h1 className="page-title">Chào mừng đến với AnTuan Blog</h1>
      <p className="page-subtitle">Khám phá thế giới Anime, Manga và Game!</p>
      <h2 style={{ fontSize: '1.5em', marginBottom: '1.5rem', fontWeight: 500 }}>Danh sách bài viết</h2>
      <PostList />
    </div>
  );
}
export default Home;