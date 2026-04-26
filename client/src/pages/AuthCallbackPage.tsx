import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('auth_error');

    if (error) {
      navigate('/?auth_error=true', { replace: true });
      return;
    }

    if (token) {
      setAccessToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, setAccessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-2 border-[#1A3C5E]/30 border-t-[#1A3C5E] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
}
