import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PosterSizeDialog({
  poster,
  widthInput,
  heightInput,
  onWidthChange,
  onHeightChange,
  onCancel,
  onConfirm,
}) {
  return (
    <Dialog
      open={!!poster}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        {poster && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Выберите размер постера</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {poster.url ? (
                  <img
                    src={poster.url}
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Без превью</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm">{poster.title}</p>
                {poster.AspectRatio && (
                  <p className="text-xs text-muted-foreground">
                    Соотношение сторон: {poster.AspectRatio}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Укажите ширину и высоту постера в сантиметрах. Цена зависит от выбранного размера.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Ширина (см)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={widthInput}
                  onChange={(e) => onWidthChange(e.target.value)}
                  placeholder="Например, 60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Высота (см)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={heightInput}
                  onChange={(e) => onHeightChange(e.target.value)}
                  placeholder="Например, 40"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={
                  !widthInput ||
                  !heightInput ||
                  Number(widthInput) <= 0 ||
                  Number(heightInput) <= 0
                }
                onClick={onConfirm}
              >
                Добавить в корзину
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


