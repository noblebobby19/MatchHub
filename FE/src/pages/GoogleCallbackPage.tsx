import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import apiService from '../services/api';

export function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);

            const fetchProfile = async () => {
                try {
                    // Fetch user profile from backend using the new token
                    const userProfile = await apiService.getProfile();

                    // Save user info to localStorage so AuthContext pick it up
                    localStorage.setItem('user', JSON.stringify({
                        id: userProfile._id,
                        name: userProfile.name,
                        email: userProfile.email,
                        role: userProfile.role,
                        image: userProfile.image
                    }));

                    // Force reload to update AuthContext state
                    window.location.href = '/';
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    navigate('/dang-nhap?error=auth_failed');
                }
            };

            fetchProfile();
        } else {
            navigate('/dang-nhap?error=no_token');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập Google...</h2>
                <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
}
