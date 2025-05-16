import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function RegisterPage() {
    const [step, setStep] = useState(1);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await authService.requestRegistrationOtp(username, email, password);
            setMessage('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.');
            setStep(2);
        } catch (err) {
            const resMessage =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(resMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpAndRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const response = await authService.verifyOtpAndRegister(email, otp);
            setMessage(response.data.message || 'Đăng ký thành công! Bạn có thể đăng nhập.');
            setTimeout(() => {
                 navigate('/login');
            }, 3000);
        } catch (err) {
            const resMessage =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(resMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <h2>Đăng ký tài khoản</h2>

            {error && <p className="message error-message">{error}</p>}
            {message && <p className="message success-message">{message}</p>}

            {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                    <div>
                        <label htmlFor="username">Username (*):</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="email">Email (*):</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="password">Password (*):</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Nhận mã OTP'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtpAndRegister}>
                    <p>Một mã OTP đã được gửi đến <strong>{email}</strong>. Vui lòng nhập vào bên dưới.</p>
                    <div>
                        <label htmlFor="otp">Mã OTP (*):</label>
                        <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required pattern="\d{6}" title="OTP phải là 6 chữ số" />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'}
                    </button>
                    <button type="button" onClick={() => {setStep(1); setMessage(''); setError('');}} style={{marginLeft: '10px', backgroundColor: 'var(--secondary-color)'}} disabled={loading}>
                        Nhập lại thông tin
                    </button>
                </form>
            )}
            <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
    );
}
export default RegisterPage;