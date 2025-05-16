import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllPosts = async (params = {}) => {
  try {
    const activeParams = Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    const response = await apiClient.get('/posts', { params: activeParams });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getPostById = async (idOrSlug) => {
  try {
    const response = await apiClient.get(`/posts/${idOrSlug}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết ${idOrSlug}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await apiClient.post('/posts', postData, { headers: authService.authHeader() });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, postData, { headers: authService.authHeader() });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật bài viết ${postId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await apiClient.delete(`/posts/${postId}`, { headers: authService.authHeader() });
  } catch (error) {
    console.error(`Lỗi khi xóa bài viết ${postId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const getSuggestedPosts = async (currentPostId, categoryId, limit = 3) => {
  try {
    const params = { limit };
    if (categoryId) {
      params.categoryId = categoryId;
    }
    const response = await apiClient.get(`/posts/suggested/${currentPostId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết đề xuất cho post ${currentPostId}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh mục ${slug}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post('/categories', categoryData, { headers: authService.authHeader() });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo danh mục:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const getAllTags = async () => {
  try {
    const response = await apiClient.get('/tags');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thẻ:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getTagBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/tags/${slug}`);
    return response.data;
  } catch (error)
{
    console.error(`Lỗi khi lấy thẻ ${slug}:`, error.response?.data?.message || error.message);
    throw error;
  }
};

export const createTag = async (tagData) => {
    try {
        const response = await apiClient.post('/tags', tagData, { headers: authService.authHeader() });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo thẻ:', error.response?.data?.message || error.message);
        throw error;
    }
};

export const getMyProfile = async () => {
     try {
         const response = await apiClient.get('/users/profile', { headers: authService.authHeader() });
         return response.data;
     } catch (error) {
         console.error('Lỗi khi lấy thông tin cá nhân:', error.response?.data?.message || error.message);
         throw error;
     }
};

export const updateMyProfile = async (formData) => {
  try {
    const response = await apiClient.put('/users/profile', formData, {
      headers: {
        ...authService.authHeader(),
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin cá nhân:', error.response?.data?.message || error.message);
    throw error;
  }
};