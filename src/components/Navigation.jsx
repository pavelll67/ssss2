import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';
import { User } from 'lucide-react';
import { useSaveNotification } from '@/contexts/SaveNotificationContext';

const navigationItems = [
  { path: '/', label: 'Создать постер' },
  { path: '/my-posters', label: 'Мои постеры' },
  { path: '/profile', label: '', requiresAuth: true }, // label будет определяться динамически
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { showSaveAnimation } = useSaveNotification();

  const handleProfileClick = (e, item) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  const handleResetClick = (e) => {
    // Проверяем, идет ли генерация (есть статус загрузки или есть imageId без imageUrl)
    const status = localStorage.getItem('poster_status');
    const imageId = localStorage.getItem('poster_imageId');
    const editingImageId = localStorage.getItem('poster_editingImageId'); // Для режима редактирования
    const imageUrl = localStorage.getItem('poster_imageUrl');
    // Проверяем загрузку как для обычной генерации, так и для редактирования
    const isGenerating = (status === 'streaming' || status === 'submitted') || 
                        (imageId && !imageUrl) || 
                        (editingImageId && !imageUrl);
    
    // Если идет генерация, просто переходим на главную без очистки данных
    if (isGenerating) {
      // Не предотвращаем переход по ссылке, просто переходим на главную
      if (location.pathname !== '/') {
        navigate('/');
      }
      return;
    }
    
    // Если генерация не идет, предотвращаем переход и выполняем сброс
    e?.preventDefault();
    
    // Очищаем ошибку и промпт при нажатии на лого только если не идет генерация
    window.dispatchEvent(new CustomEvent('clearPosterError'));
    window.dispatchEvent(new CustomEvent('clearPosterPrompt'));
    
    // Проверяем, есть ли у гостя сгенерированный постер
    const hasGuestPoster = !user && (localStorage.getItem('poster_imageUrl') || localStorage.getItem('poster_imageId'));
    
    // Если гость пытается сбросить состояние с постером, показываем окно входа
    if (hasGuestPoster) {
      setAuthModalOpen(true);
      return;
    }
    
    // Очищаем все данные постеров из localStorage
    localStorage.removeItem('poster_prompt');
    localStorage.removeItem('poster_aspectRatio');
    localStorage.removeItem('poster_style');
    localStorage.removeItem('poster_imageUrl');
    localStorage.removeItem('poster_imageId');
    localStorage.removeItem('poster_isEditMode');
    localStorage.removeItem('poster_imageHistory');
    localStorage.removeItem('poster_currentHistoryIndex');
    localStorage.removeItem('poster_imageAttached');
    localStorage.removeItem('poster_status');
    localStorage.removeItem('poster_generatingPrompt');
    localStorage.removeItem('poster_generationStartTime');
    localStorage.removeItem('poster_error');
    // Полностью перезагружаем страницу
    window.location.href = '/';
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Кнопка doposter слева */}
          <Link
            to="/"
            onClick={handleResetClick}
            className="flex items-center gap-2 text-foreground hover:text-foreground/80 font-bold text-2xl transition-colors"
          >
            <img src="/logo.svg" alt="doposter" className="h-8 w-8" />
            doposter
          </Link>
          
          {/* Центральные элементы навигации */}
          <div className="flex items-center gap-6 sm:gap-12">
            {navigationItems.filter(item => item.path !== '/profile').map((item) => {
              const isActive = location.pathname === item.path;
              const isMyPosters = item.path === '/my-posters';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 transition-all duration-200 relative rounded-lg group text-base font-medium",
                    isActive
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  {/* Анимация синей точки для "Мои постеры" */}
                  {isMyPosters && showSaveAnimation && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full w-2 h-2 animate-bounce shadow-lg z-10" style={{ animationDuration: '1.5s' }} />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Элемент справа (Войти/Имя пользователя) */}
          <div className="flex items-center">
            {(() => {
              const profileItem = navigationItems.find(item => item.path === '/profile');
              const isActive = location.pathname === '/profile';
              const displayLabel = user ? (user.name || user.email || 'Профиль') : 'Войти';
              
              if (profileItem?.requiresAuth && !user) {
                return (
                  <button
                    onClick={(e) => handleProfileClick(e, profileItem)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 transition-all duration-200 relative rounded-lg group text-base font-medium",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <User size={18} />
                    {displayLabel}
                  </button>
                );
              }

              return (
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 transition-all duration-200 relative rounded-lg group text-base font-medium",
                    isActive
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User size={18} />
                  {displayLabel}
                </Link>
              );
            })()}
          </div>
        </div>
      </nav>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

