import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllPosts, deletePost, getAllCategories, getAllTags } from '../services/api';
import authService from '../services/authService';
import { Link, useSearchParams } from 'react-router-dom';
import './PostList.css';

function PostList() {
    const [postsData, setPostsData] = useState({ posts: [], totalPages: 1, currentPage: 1, totalPosts: 0 });
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = authService.getCurrentUser();
    const filterOptionsFetched = useRef(false);

    const fetchFilterOptions = useCallback(async () => {
        if (filterOptionsFetched.current) return;
        filterOptionsFetched.current = true;
        setLoadingOptions(true);
        try {
            const [catRes, tagRes] = await Promise.all([
                getAllCategories(),
                getAllTags()
            ]);
            setCategories(catRes || []);
            setTags(tagRes || []);
        } catch (err) {
            console.error("Error fetching categories/tags for filter", err);
            setError("Không thể tải tùy chọn lọc.");
        } finally {
            setLoadingOptions(false);
        }
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true);
        setError(null);
        const params = {
            page: searchParams.get('page') || '1',
            search: searchParams.get('search') || '',
            categoryId: searchParams.get('categoryId') || '',
            tagId: searchParams.get('tagId') || '',
            limit: '6'
        };

        try {
            const data = await getAllPosts(params);
            setPostsData(data || { posts: [], totalPages: 1, currentPage: 1, totalPosts: 0 });
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách bài viết.');
            console.error(err);
        } finally {
            setLoadingPosts(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    useEffect(() => {
        if (!loadingOptions) {
            fetchPosts();
        }
    }, [fetchPosts, loadingOptions]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        newParams.set('page', '1');
        setSearchParams(newParams);
    };
    
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleFilterChange(e);
        }
    };
    const handleSearchClick = () => {
        const searchInput = document.querySelector('input[name="search"]');
        if (searchInput) {
             handleFilterChange({ target: { name: 'search', value: searchInput.value } });
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > postsData.totalPages || newPage === postsData.currentPage) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
        window.scrollTo(0, 0);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                await deletePost(postId);
                fetchPosts();
            } catch (err) {
                alert('Lỗi khi xóa bài viết: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    if (error) return <p className="error-message message">Lỗi: {error}</p>;
    if (loadingOptions && !filterOptionsFetched.current) return <p className="loading-message message">Đang tải bộ lọc...</p>;

    return (
        <div className="post-list-container">
            <div className="filters-container">
                <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm tiêu đề..."
                    defaultValue={searchParams.get('search') || ''}
                    onKeyDown={handleSearchKeyDown}
                />
                <button onClick={handleSearchClick}>Tìm</button>

                <select
                    name="categoryId"
                    value={searchParams.get('categoryId') || ''}
                    onChange={handleFilterChange}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select
                    name="tagId"
                    value={searchParams.get('tagId') || ''}
                    onChange={handleFilterChange}
                >
                    <option value="">Tất cả thẻ</option>
                    {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                </select>
            </div>

            {loadingPosts && <p className="loading-message message">Đang tải bài viết...</p>}
            {!loadingPosts && postsData.posts.length === 0 && <p className="info-message message">Không tìm thấy bài viết nào khớp với tiêu chí.</p>}

            {!loadingPosts && postsData.posts.length > 0 && (
                <>
                    <div className="posts-grid">
                        {postsData.posts.map(post => (
                            <article key={post.id} className="post-item-card">
                                {post.cover_image_url && (
                                     <Link to={`/posts/${post.slug || post.id}`} className="post-image-link">
                                        <img src={post.cover_image_url} alt={post.title} className="post-cover-image"/>
                                    </Link>
                                )}
                                <div className="post-item-content">
                                    <h3 className="post-title">
                                        <Link to={`/posts/${post.slug || post.id}`}>{post.title}</Link>
                                    </h3>
                                    {post.categoryDetails && (
                                        <span className="post-category">
                                            <Link to={`/?categoryId=${post.categoryDetails.id}`}>{post.categoryDetails.name}</Link>
                                        </span>
                                    )}
                                    <p className="post-excerpt-text">
                                        {post.excerpt || (post.content ? post.content.substring(0, 120) + (post.content.length > 120 ? '...' : '') : '')}
                                    </p>
                                    
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="post-tags-list">
                                            <strong>Thẻ: </strong>
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <Link key={tag.id} to={`/?tagId=${tag.id}`} className="tag-link">#{tag.name}</Link>
                                            ))}
                                            {post.tags.length > 3 && <span className="tag-link">...</span>}
                                        </div>
                                    )}

                                    <div className="post-meta-info">
                                        <span>Bởi: {post.authorDetails ? post.authorDetails.username : 'N/A'}</span>
                                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                                        <span>{post.views} xem</span>
                                    </div>

                                    {currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin') && (
                                        <div className="post-actions">
                                            <Link to={`/edit-post/${post.id}`} className="action-link-edit">Sửa</Link>
                                            <button onClick={() => handleDeletePost(post.id)} className="action-button-delete">Xóa</button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    {postsData.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(postsData.currentPage - 1)}
                                disabled={postsData.currentPage === 1 || loadingPosts}
                            >
                                « Trước
                            </button>

                            {(() => {
                                const pageNumbers = [];
                                const totalPages = postsData.totalPages;
                                const currentPage = postsData.currentPage;
                                const pageLimitSide = 2;
                                const pageLimitTotal = (pageLimitSide * 2) + 1 + 2 + 2;

                                if (totalPages <= pageLimitTotal) {
                                    for (let i = 1; i <= totalPages; i++) {
                                        pageNumbers.push(i);
                                    }
                                } else {
                                    pageNumbers.push(1);
                                    
                                    let startPage = Math.max(2, currentPage - pageLimitSide);
                                    let endPage = Math.min(totalPages - 1, currentPage + pageLimitSide);

                                    if (currentPage - pageLimitSide <= 2) {
                                       endPage = 1 + (pageLimitSide * 2) +1;
                                    }
                                    if (currentPage + pageLimitSide >= totalPages -1) {
                                       startPage = totalPages - (pageLimitSide*2) -1;
                                    }

                                    if (startPage > 2) {
                                        pageNumbers.push('...');
                                    }
                                    for (let i = startPage; i <= endPage; i++) {
                                        if (i > 1 && i < totalPages) pageNumbers.push(i);
                                    }
                                    if (endPage < totalPages - 1) {
                                        pageNumbers.push('...');
                                    }
                                    pageNumbers.push(totalPages);
                                }
                                
                                const finalPageNumbers = pageNumbers.filter((item, pos, ary) => {
                                    return item !== '...' || ary[pos - 1] !== '...';
                                });

                                return finalPageNumbers.map((page, index) =>
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="ellipsis">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={page === postsData.currentPage || loadingPosts}
                                            className={page === postsData.currentPage ? 'current-page' : ''}
                                        >
                                            {page}
                                        </button>
                                    )
                                );
                            })()}

                            <button
                                onClick={() => handlePageChange(postsData.currentPage + 1)}
                                disabled={postsData.currentPage === postsData.totalPages || loadingPosts}
                            >
                                Sau »
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
export default PostList;