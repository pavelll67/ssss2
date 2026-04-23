import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем токен в query-параметрах и авторизацию при загрузке
    const initAuth = async () => {
      try {
        // 1. Забираем token/email из URL, если пришли после OAuth
        const currentUrl = new URL(window.location.href);
        const params = currentUrl.searchParams;
        const tokenFromUrl = params.get('token');
        const emailFromUrl = params.get('email');

        if (tokenFromUrl) {
          // Сохраняем токен и, при желании, временного пользователя (email)
          localStorage.setItem('token', tokenFromUrl);

          if (emailFromUrl && !user) {
            setUser((prev) => prev ?? { email: decodeURIComponent(emailFromUrl) });
          }

          // Очищаем URL от технических параметров
          params.delete('token');
          params.delete('email');
          currentUrl.search = params.toString();
          window.history.replaceState(null, '', currentUrl.toString());
        }

        // 2. Проверяем токен (из URL или уже сохранённый)
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          // Токен невалиден
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } catch {
        // На всякий случай, чтобы не ломать приложение при ошибках парсинга URL
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

