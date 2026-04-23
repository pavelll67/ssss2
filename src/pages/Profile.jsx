import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Profile() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Личный кабинет</h1>  
        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card border-destructive/20">
            <h2 className="text-2xl font-semibold mb-4 text-destructive">Выход</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Выйти из аккаунта
            </p>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти из аккаунта
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

