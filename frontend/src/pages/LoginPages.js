// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
// App.css already imported at App.js level

function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const userData = await authService.login(email, password);
            onLoginSuccess(userData);
            navigate('/');
        } catch (error) {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            setMessage(resMessage);
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px', margin: '2rem auto' }}> {/* Added class and inline style for centering */}
            <h2>Đăng nhập</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
                {message && <p className={`message ${message.includes('Lỗi') || message.includes('failed') || !message.includes('thành công') ? 'error-message' : 'info-message'}`}>{message}</p>}
            </form>
            <p style={{marginTop: '1.5rem', textAlign: 'center'}}>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
        </div>
    );
}
export default LoginPage;