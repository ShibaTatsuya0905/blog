// frontend/src/pages/CreatePostPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, updatePost, getPostById, getAllCategories, getAllTags } from '../services/api';
import authService from '../services/authService';

function CreatePostPage() {
    const { postId } = useParams();
    const isEditMode = !!postId;

    // States cho form fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [status, setStatus] = useState('draft');
    const [categoryId, setCategoryId] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    // States cho dropdown data
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    // States cho loading và messages
    const [formLoading, setFormLoading] = useState(false);
    const [initialDataLoading, setInitialDataLoading] = useState(true);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const dataFetchedRef = useRef(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { state: { from: isEditMode ? `/edit-post/${postId}` : '/create-post' }, replace: true });
            return;
        }

        if (!dataFetchedRef.current) {
            dataFetchedRef.current = true;
            setInitialDataLoading(true);

            const fetchAllInitialData = async () => {
                try {
                    const promises = [getAllCategories(), getAllTags()];
                    if (isEditMode && postId) { // Chỉ push getPostById nếu postId có giá trị
                        promises.push(getPostById(postId));
                    }

                    const results = await Promise.all(promises);

                    setCategories(results[0] || []);
                    setTags(results[1] || []);

                    if (isEditMode && postId && results[2]) {
                        const postToEdit = results[2];
                        setTitle(postToEdit.title || '');
                        setContent(postToEdit.content || '');
                        setSlug(postToEdit.slug || '');
                        setExcerpt(postToEdit.excerpt || '');
                        setCoverImageUrl(postToEdit.cover_image_url || '');
                        setStatus(postToEdit.status || 'draft');
                        setCategoryId(postToEdit.category_id?.toString() || '');
                        setSelectedTagIds(postToEdit.tags ? postToEdit.tags.map(t => t.id.toString()) : []);
                    }
                } catch (error) {
                    console.error("Error fetching initial data for post form:", error);
                    setMessage("Lỗi tải dữ liệu cho form: " + (error.response?.data?.message || error.message));
                    dataFetchedRef.current = false; // Cho phép thử lại nếu lỗi
                } finally {
                    setInitialDataLoading(false);
                }
            };
            fetchAllInitialData();
        } else if (!isEditMode && dataFetchedRef.current) {
             setInitialDataLoading(false);
        }
    }, [currentUser, postId, isEditMode, navigate]);

    const handleTagChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedTagIds(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setMessage("Tiêu đề và nội dung không được để trống.");
            return;
        }
        setMessage('');
        setFormLoading(true);
        const postData = {
            title,
            content,
            slug: slug.trim() === '' ? undefined : slug.trim(),
            excerpt,
            cover_image_url: coverImageUrl,
            status,
            category_id: categoryId ? parseInt(categoryId) : null,
            tagIds: selectedTagIds.map(id => parseInt(id))
        };

        try {
            let savedPost;
            if (isEditMode) {
                savedPost = await updatePost(postId, postData);
            } else {
                savedPost = await createPost(postData);
            }

            console.log("Response từ API sau khi lưu:", savedPost); // DEBUG LOG

            if (savedPost && ( (typeof savedPost.slug === 'string' && savedPost.slug.trim() !== '') || (typeof savedPost.id === 'number' && savedPost.id > 0) ) ) {
                const navigateTo = savedPost.slug || savedPost.id;
                console.log("Điều hướng đến:", `/posts/${navigateTo}`);
                navigate(`/posts/${navigateTo}`, { replace: true });
            } else {
                console.error("Dữ liệu slug hoặc id không hợp lệ từ API:", savedPost);
                if(savedPost) {
                    console.error("savedPost.slug:", savedPost.slug, "Type:", typeof savedPost.slug);
                    console.error("savedPost.id:", savedPost.id, "Type:", typeof savedPost.id);
                }
                setMessage("Lưu bài viết thành công, nhưng có lỗi khi lấy thông tin để điều hướng. Kiểm tra console.");
                navigate('/', { replace: true });
            }
        } catch (error) {
            console.error("Lỗi khi submit form:", error.response || error);
            const resMessage = (error.response?.data?.message) || error.message || error.toString();
            setMessage(resMessage + (error.response?.data?.fields ? ` (Trường lỗi: ${Object.keys(error.response.data.fields).join(', ')})` : ''));
        } finally {
            setFormLoading(false);
        }
    };

    if (!currentUser) return null;
    if (initialDataLoading) return <p className="loading-message">Đang tải dữ liệu form...</p>;

    return (
        <div>
            <h2>{isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Tiêu đề (*):</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="slug">Slug (để trống sẽ tự tạo):</label>
                    <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="content">Nội dung (*):</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="15" required />
                </div>
                <div>
                    <label htmlFor="excerpt">Tóm tắt (Excerpt):</label>
                    <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows="3" />
                </div>
                <div>
                    <label htmlFor="coverImageUrl">URL Ảnh bìa:</label>
                    <input type="url" id="coverImageUrl" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="category">Danh mục:</label>
                    <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="tags">Thẻ (giữ Ctrl/Cmd để chọn nhiều):</label>
                    <select id="tags" multiple value={selectedTagIds} onChange={handleTagChange} size={tags.length > 10 ? 10 : Math.max(5, tags.length)} style={{minHeight: '80px', maxHeight:'200px'}}>
                        {tags.map(tag => (
                            <option key={tag.id} value={tag.id.toString()}>{tag.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="status">Trạng thái:</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="draft">Bản nháp (Draft)</option>
                        <option value="published">Xuất bản (Published)</option>
                        <option value="archived">Lưu trữ (Archived)</option>
                    </select>
                </div>
                <button type="submit" disabled={formLoading || initialDataLoading} style={{marginTop: '20px'}}>
                    {formLoading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật bài viết' : 'Đăng bài')}
                </button>
                {message && <p style={{ color: message.toLowerCase().includes('thành công') ? 'green' : 'red', marginTop: '10px' }}>{message}</p>}
            </form>
        </div>
    );
}
export default CreatePostPage;