import { Link } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice } = useCart();

  const isCartEmpty = items.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              to="/my-posters"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Вернуться к моим постерам"
            >
              <IconArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Оформление заказа
            </h1>
          </div>

        {isCartEmpty ? (
          <div className="mt-8 border rounded-2xl bg-muted/40 px-6 py-10 text-center space-y-4">
            <h2 className="text-xl font-semibold">Ваша корзина пуста</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Добавьте постеры в корзину на странице «Мои постеры», чтобы перейти к оформлению заказа.
            </p>
            <Button asChild size="lg">
              <Link to="/my-posters">Перейти к моим постерам</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
            {/* Левая колонка — форма заказа */}
            <div className="space-y-6">
              <div className="border rounded-2xl bg-card/80 backdrop-blur-sm shadow-sm p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-semibold">Контактные данные</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Имя
                    </label>
                    <Input placeholder="Иван" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Фамилия
                    </label>
                    <Input placeholder="Иванов" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      defaultValue={user?.email || ''}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Телефон
                    </label>
                    <Input placeholder="+7 (___) ___-__-__" />
                  </div>
                </div>
              </div>

              <div className="border rounded-2xl bg-card/80 backdrop-blur-sm shadow-sm p-6 md:p-7 space-y-5">
                <h2 className="text-lg font-semibold">Адрес доставки</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Город
                    </label>
                    <Input placeholder="Москва" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Почтовый индекс
                    </label>
                    <Input placeholder="101000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Улица, дом, квартира
                  </label>
                  <Input placeholder="ул. Пример, д. 1, кв. 1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Комментарий к заказу
                  </label>
                  <textarea
                    className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Например: позвонить за час до доставки, подъезд с внутренней стороны двора"
                  />
                </div>
              </div>

            </div>

            {/* Правая колонка — сводка заказа */}
            <aside className="space-y-4">
              <div className="border rounded-2xl bg-card/90 backdrop-blur-sm shadow-sm p-5 space-y-4">
                <h2 className="text-lg font-semibold">Ваш заказ</h2>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center"
                    >
                      <div className="w-14 h-14 rounded-md bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
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
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">
                        {item.price} ₽
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-semibold">Бесплатно</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t mt-1">
                    <span className="font-semibold">Итого</span>
                    <span className="text-lg font-bold">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-11 text-base font-semibold shadow-md flex items-center justify-center gap-2"
                disabled={isCartEmpty}
              >
                <span>Оплатить через</span>
                <img
                  src="/iomoney.svg"
                  alt="YooMoney"
                  className="h-6 w-auto"
                />
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Нажимая «Оплатить», вы подтверждаете корректность введённых данных.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}


