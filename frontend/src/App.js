// frontend/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Routes,
    Route,
    Link,
    useNavigate,
    NavLink,
    useLocation,
} from 'react-router-dom';

import Home from './pages/Home';
import LoginPage from './pages/LoginPages'; // Sửa lại tên file nếu là LoginPage.js
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
// import ProfilePage from './pages/ProfilePage'; // <--- XÓA DÒNG NÀY

import authService from './services/authService';
import './App.css';

const API_BASE_URL_FOR_IMAGES = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function NavigateToLogin() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/login', { state: { from: location }, replace: true });
    }, [navigate, location]);

    return null;
}

function App() {
    const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[App.js] currentUser state in App.js changed to:', currentUser);
    }, [currentUser]);

    const handleLoginSuccess = useCallback((userData) => {
        console.log('[App.js] Login successful, setting currentUser:', userData);
        setCurrentUser(userData);
    }, []);

    const handleLogout = useCallback(() => {
        console.log('[App.js] Handling logout.');
        // const currentPath = window.location.pathname; // Không cần thiết nếu không có trang profile
        authService.logout();
        setCurrentUser(null);
        // Không cần điều hướng đặc biệt từ profile nữa
        // const protectedPaths = ['/profile', '/create-post', '/edit-post'];
        // if (protectedPaths.some(path => currentPath.startsWith(path))) {
        //     navigate('/login', { replace: true });
        // }
        // Đơn giản là điều hướng về trang chủ hoặc trang login sau khi logout nếu đang ở trang protected
        const currentPath = window.location.pathname;
        if (['/create-post', '/edit-post'].some(path => currentPath.startsWith(path))) {
            navigate('/login', { replace: true });
        }

    }, [navigate]);

    useEffect(() => {
        const handleStorageChange = () => {
            const newUserFromStorage = authService.getCurrentUser();
            console.log('[App.js] "storage" event detected.');
            setCurrentUser(prevCurrentUser => {
                const prevUserStr = JSON.stringify(prevCurrentUser);
                const newUserStr = JSON.stringify(newUserFromStorage);
                if (prevUserStr !== newUserStr) {
                    console.log('[App.js] User data from storage is DIFFERENT, updating App state.');
                    return newUserFromStorage;
                }
                console.log('[App.js] User data from storage is THE SAME, no App state update needed from storage event.');
                return prevCurrentUser;
            });
        };

        const initialUser = authService.getCurrentUser();
        setCurrentUser(initialUser);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            console.log('[App.js] Removing "storage" event listener.');
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    return (
        <div className="app-wrapper">
            <nav className="main-nav">
                <ul>
                    <li><NavLink to="/" className={({isActive}) => isActive ? "active nav-link" : "nav-link"}>Trang Chủ</NavLink></li>
                    {currentUser ? (
                        <>
                            <li><NavLink to="/create-post" className={({isActive}) => isActive ? "active nav-link" : "nav-link"}>Tạo Bài Viết</NavLink></li>
                            {/* <li><NavLink to="/profile" className={({isActive}) => isActive ? "active nav-link" : "nav-link"}>Hồ sơ</NavLink></li> */}{/* <--- XÓA HOẶC COMMENT DÒNG NÀY */}
                            <li style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                                {currentUser.avatar_url && (
                                    <img
                                        className="user-avatar"
                                        key={currentUser.avatar_url}
                                        src={`${API_BASE_URL_FOR_IMAGES}${currentUser.avatar_url}`}
                                        alt="avatar"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover', border: '1px solid #ddd' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src="/default-avatar.png"; e.target.style.border='1px solid #ccc'; }}
                                    />
                                )}
                                <span className="user-greeting" style={{marginRight: '15px'}}>
                                    Chào, {currentUser.username}!
                                    {currentUser.role === 'admin' && <span style={{fontSize: '0.8em', color: 'var(--warning-color)', fontWeight: 'bold'}}> (Admin)</span>}
                                </span>
                                <button onClick={handleLogout} className="logout-button">
                                    Đăng xuất
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li style={{marginLeft: 'auto'}}><NavLink to="/login" className={({isActive}) => isActive ? "active nav-link" : "nav-link"}>Đăng Nhập</NavLink></li>
                            <li><NavLink to="/register" className={({isActive}) => isActive ? "active nav-link" : "nav-link"}>Đăng Ký</NavLink></li>
                        </>
                    )}
                </ul>
            </nav>

            <div className="content-wrap">
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* <Route path="/profile" element={currentUser ? <ProfilePage key={currentUser.id} /> : <NavigateToLogin />} /> */}{/* <--- XÓA HOẶC COMMENT DÒNG NÀY */}
                        <Route path="/create-post" element={currentUser ? <CreatePostPage /> : <NavigateToLogin />} />
                        <Route path="/edit-post/:postId" element={currentUser ? <CreatePostPage /> : <NavigateToLogin />} />

                        <Route path="/posts/:slugOrId" element={<PostDetailPage />} />
                        <Route path="*" element={
                            <div className="page-container" style={{textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem'}}>
                                <h2>404 - Trang không tìm thấy</h2>
                                <p>Rất tiếc, trang bạn tìm kiếm không tồn tại.</p>
                                <Link to="/" className="button-primary" style={{marginTop: '1rem'}}>Về trang chủ</Link>
                            </div>
                        } />
                    </Routes>
                </div>
            </div>

            <footer className="main-footer">
                <p>© {new Date().getFullYear()} Anime Manga Game Blog. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;