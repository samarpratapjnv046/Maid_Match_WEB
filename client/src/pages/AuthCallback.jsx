import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const getDashboardPath = (role) => {
  if (role === 'worker') return '/worker/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
};

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err || !token) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
      return;
    }

    loginWithToken(token)
      .then((role) => navigate(getDashboardPath(role), { replace: true }))
      .catch(() => {
        setError('Failed to complete sign-in. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col items-center justify-center gap-4">
      {error ? (
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-1">Redirecting to login…</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Completing sign-in…</p>
        </div>
      )}
    </div>
  );
}
