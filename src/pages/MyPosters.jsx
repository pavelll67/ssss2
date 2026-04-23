import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { getMyImages } from '@/api';
import { PosterCard } from '@/components/my-posters/PosterCard';
import { PosterPreviewDialog } from '@/components/my-posters/PosterPreviewDialog';
import { PosterSizeDialog } from '@/components/my-posters/PosterSizeDialog';
import { FloatingCart } from '@/components/my-posters/FloatingCart';

export function MyPosters() {
  const { user } = useAuth();
  const { items, addToCart, removeFromCart, totalPrice, clearCart } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [posters, setPosters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewPoster, setPreviewPoster] = useState(null);
  const [sizeModalPoster, setSizeModalPoster] = useState(null);
  const [widthInput, setWidthInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getAspectRatioNumbers = (poster) => {
    const aspectRatio = poster?.AspectRatio || poster?.aspect_ratio;
    if (!aspectRatio) return null;
    // API возвращает формат "3:4", парсим его
    const [wStr, hStr] = String(aspectRatio).split(':');
    const w = Number(wStr);
    const h = Number(hStr);
    if (!w || !h) return null;
    return { w, h };
  };

  const handleOpenSizeModal = ({ poster, title, url }) => {
    // Предзаполняем размеры на основе соотношения сторон, если оно есть
    let initialWidth = '';
    let initialHeight = '';
    const ratio = getAspectRatioNumbers(poster);
    if (ratio) {
      const baseHeight = 40; // базовая высота в см
      const calcWidth = Math.round((baseHeight * ratio.w) / ratio.h);
      initialWidth = String(calcWidth);
      initialHeight = String(baseHeight);
    }
    setSizeModalPoster({
      ...poster,
      title,
      url: url || poster.StoredURL || poster.preview_url
    });
    setWidthInput(initialWidth);
    setHeightInput(initialHeight);
  };

  const handleWidthChange = (value) => {
    setWidthInput(value);
    const num = Number(value);
    const ratio = getAspectRatioNumbers(sizeModalPoster);
    if (!ratio || !num || num <= 0) return;
    const newHeight = Math.round((num * ratio.h) / ratio.w);
    setHeightInput(String(newHeight));
  };

  const handleHeightChange = (value) => {
    setHeightInput(value);
    const num = Number(value);
    const ratio = getAspectRatioNumbers(sizeModalPoster);
    if (!ratio || !num || num <= 0) return;
    const newWidth = Math.round((num * ratio.w) / ratio.h);
    setWidthInput(String(newWidth));
  };

  const handleConfirmSize = () => {
    if (!sizeModalPoster) return;

    const width = Number(widthInput);
    const height = Number(heightInput);

    if (!width || !height || width <= 0 || height <= 0) {
      return;
    }

    const sizeLabel = `${width}×${height} см`;
    // простая формула цены в зависимости от площади
    const area = width * height;
    const price = Math.round(area * 0.5); // можно легко поменять под реальный прайс

    addToCart({
      sourceId: sizeModalPoster.id || sizeModalPoster.image_id,
      title: sizeModalPoster.title,
      imageUrl: sizeModalPoster.url || sizeModalPoster.StoredURL || sizeModalPoster.preview_url,
      aspectRatio: sizeModalPoster.AspectRatio || sizeModalPoster.aspect_ratio,
      width,
      height,
      sizeId: `${width}x${height}`,
      sizeLabel,
      price,
    });

    setSizeModalPoster(null);
    setWidthInput('');
    setHeightInput('');
  };

  useEffect(() => {
    if (!user) return;

    const fetchPosters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyImages();
        // Ожидаем массив постеров, адаптируем структуру данных из API
        const adaptedPosters = Array.isArray(data) 
          ? data.map((item) => ({
              id: item.image_id,
              StoredURL: item.preview_url || null,
              AspectRatio: item.aspect_ratio || null,
              // Для совместимости со старым кодом
              image_id: item.image_id,
              preview_url: item.preview_url,
              aspect_ratio: item.aspect_ratio,
            }))
          : [];
        setPosters(adaptedPosters);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить постеры');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosters();
  }, [user]);

  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <h1 className="text-4xl font-bold">Вы не авторизованы</h1>
              <p className="text-lg text-muted-foreground">
                Войдите в аккаунт, чтобы просмотреть свои постеры
              </p>
              <Button onClick={() => setAuthModalOpen(true)} size="lg">
                Войти
              </Button>
            </div>
          </div>
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Мои постеры</h1>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Загрузка постеров...
          </div>
        )}

        {error && !isLoading && (
          <div className="py-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && posters.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            У вас пока нет сохранённых постеров
          </div>
        )}

        {!isLoading && !error && posters.length > 0 && (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posters.map((poster, index) => (
                <PosterCard
                  key={poster.id || index}
                  poster={poster}
                  index={index}
                  onPreview={setPreviewPoster}
                  onSelectSize={handleOpenSizeModal}
                />
              ))}
            </div>

            <PosterPreviewDialog
              poster={previewPoster}
              onClose={() => setPreviewPoster(null)}
            />

            <PosterSizeDialog
              poster={sizeModalPoster}
              widthInput={widthInput}
              heightInput={heightInput}
              onWidthChange={handleWidthChange}
              onHeightChange={handleHeightChange}
              onCancel={() => {
                setSizeModalPoster(null);
                setWidthInput('');
                setHeightInput('');
              }}
              onConfirm={handleConfirmSize}
            />
          </>
        )}
      </div>
    </div>

      <FloatingCart
        items={items}
        totalPrice={totalPrice}
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        onClear={clearCart}
        onRemoveItem={removeFromCart}
      />
    </>
  );
}

