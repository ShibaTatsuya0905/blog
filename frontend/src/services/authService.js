import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/auth`;

const requestRegistrationOtp = (username, email, password, role) => {
    return axios.post(`${API_URL}/register/request-otp`, {
        username, email, password, role,
    });
};

const verifyOtpAndRegister = (email, otp) => {
    return axios.post(`${API_URL}/register/verify-otp`, {
        email, otp,
    });
};

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        email, password,
    });
    if (response.data && response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        if (user && user.token) {
            return user;
        }
        localStorage.removeItem('user');
        return null;

    } catch (error) {
        console.error("AuthService: Could not parse user from localStorage or invalid user object", error);
        localStorage.removeItem('user');
        return null;
    }
};

const authHeader = () => {
    const user = getCurrentUser();
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
};

const authService = {
    requestRegistrationOtp,
    verifyOtpAndRegister,
    login,
    logout,
    getCurrentUser,
    authHeader,
};

export default authService;