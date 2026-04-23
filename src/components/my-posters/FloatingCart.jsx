import { IconShoppingCart, IconTrash, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function FloatingCart({
  items,
  totalPrice,
  isOpen,
  onOpenChange,
  onClear,
  onRemoveItem,
}) {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex flex-col items-end gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 shadow-lg hover:bg-primary/90 transition-colors"
          >
            <IconShoppingCart size={20} />
            <span className="text-sm font-medium">
              Корзина
              {items.length > 0 && ` (${items.length})`}
            </span>
            {items.length > 0 && (
              <span className="text-xs bg-primary-foreground/10 rounded-full px-2 py-0.5">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </button>
        )}

        {isOpen && (
          <div className="w-80 max-h-[70vh] rounded-xl border bg-background shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
              <div className="flex items-center gap-2">
                <IconShoppingCart size={18} />
                <span className="text-sm font-semibold">Корзина</span>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onOpenChange(false)}
                aria-label="Закрыть корзину"
              >
                <IconX size={16} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Ваша корзина пуста
              </div>
            ) : (
              <>
                <div className="max-h-[40vh] overflow-y-auto px-4 py-3 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-start border-b last:border-b-0 pb-3 last:pb-0"
                    >
                      <div className="w-14 h-14 rounded-md bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Постер
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.sizeLabel}
                        </p>
                        <p className="text-sm font-bold mt-0.5">
                          {item.price} ₽
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="Удалить из корзины"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t px-4 py-3 space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Итого:</span>
                    <span className="font-semibold">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={onClear}
                    >
                      Очистить
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-8 text-xs"
                      asChild
                    >
                      <Link to="/checkout">
                        Оформить
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


