import React, { useEffect, useState } from 'react';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // First, check if tokens are in URL params (from landing page)
      const urlParams = new URLSearchParams(window.location.search);
      const urlIdToken = urlParams.get('idToken');
      const urlAccessToken = urlParams.get('accessToken');

      if (urlIdToken) {
        // Save tokens from URL to localStorage
        localStorage.setItem('idToken', urlIdToken);
        if (urlAccessToken) {
          localStorage.setItem('accessToken', urlAccessToken);
        }

        // Remove tokens from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Now check localStorage for token
      const token = localStorage.getItem('idToken');

      if (!token) {
        window.location.href = 'http://localhost:3002/login';
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;

        if (Date.now() >= expirationTime) {
          localStorage.clear();
          window.location.href = 'http://localhost:3002/login';
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        window.location.href = 'http://localhost:3002/login';
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
        <p style={{ color: '#9ca3af' }}>Verificando autenticação...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
