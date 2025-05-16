// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/api';
import authService from '../services/authService';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Di chuyển hàm ra ngoài component
const getCurrentUserFromStorage = () => {
    return authService.getCurrentUser();
};

function ProfilePage() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Bỏ useCallback ở đây vì hàm đã ổn định
    // const getCurrentUserFromStorage = useCallback(() => {
    //     return authService.getCurrentUser();
    // }, []);


    useEffect(() => {
        const currentUser = getCurrentUserFromStorage(); // Gọi hàm đã được định nghĩa bên ngoài

        if (!currentUser || !currentUser.token) {
            navigate('/login', { state: { from: '/profile' }, replace: true });
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError('');

        getMyProfile()
            .then(data => {
                if (isMounted) {
                    setProfileData(data);
                }
            })
            .catch(err => {
                if (isMounted) {
                    let errMsg = 'Không thể tải thông tin cá nhân. ';
                    if (err.response) {
                        errMsg += (err.response.data?.message || err.message);
                        if (err.response.status === 401) {
                            errMsg = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
                            authService.logout();
                            navigate('/login', { replace: true });
                        }
                    } else {
                        errMsg += err.message || 'Lỗi mạng hoặc server không phản hồi.';
                    }
                    setError(errMsg);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [navigate]); // Chỉ còn navigate trong dependency array, hoặc có thể để trống nếu navigate ổn định

    // ... (phần còn lại của component không đổi) ...

    if (loading) {
        return <p className="loading-message message">Đang tải thông tin cá nhân...</p>;
    }

    if (error) {
        return <p className="message error-message">{error}</p>;
    }

    if (!profileData) {
        return <p className="message info-message">Không tìm thấy thông tin cá nhân.</p>;
    }

    const displayAvatarSrc = profileData.avatar_url ? `${API_URL}${profileData.avatar_url}` : '/default-avatar.png';

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h2>Thông tin cá nhân</h2>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <img
                    key={displayAvatarSrc}
                    src={displayAvatarSrc}
                    alt="Avatar"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee' }}
                    onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png"; }}
                />
            </div>

            <div className="profile-info-item">
                <label>Email:</label>
                <p>{profileData.email}</p>
            </div>
            <div className="profile-info-item">
                <label>Username:</label>
                <p>{profileData.username}</p>
            </div>
            <div className="profile-info-item">
                <label>Vai trò:</label>
                <p>{profileData.role}</p>
            </div>
            {profileData.created_at && (
                <div className="profile-info-item">
                    <label>Ngày tham gia:</label>
                    <p>{new Date(profileData.created_at).toLocaleDateString()}</p>
                </div>
            )}

            <style jsx>{`
                .profile-info-item {
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    background-color: #f8f9fa;
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }
                .profile-info-item label {
                    font-weight: 600;
                    display: block;
                    margin-bottom: 0.25rem;
                    color: var(--dark-color);
                }
                .profile-info-item p {
                    margin: 0;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
export default ProfilePage;