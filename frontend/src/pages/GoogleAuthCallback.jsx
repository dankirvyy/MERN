import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function GoogleAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        console.log('Processing Google callback...');

        if (error) {
            console.error('Google auth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token && userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                console.log('Logging in user:', userData.name);
                
                // Save to sessionStorage and context
                login(userData);

                // Redirect based on role
                setTimeout(() => {
                    if (userData.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (userData.role === 'front_desk') {
                        navigate('/frontdesk/dashboard');
                    } else {
                        navigate('/');
                    }
                }, 100);
            } catch (err) {
                console.error('Error parsing user data:', err);
                navigate('/login?error=invalid_response');
            }
        } else {
            console.error('Missing token or user data');
            navigate('/login?error=missing_data');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}

export default GoogleAuthCallback;
