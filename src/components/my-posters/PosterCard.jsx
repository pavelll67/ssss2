import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PosterCard({ poster, index, onPreview, onSelectSize }) {
  const url = poster.StoredURL;

  const title =
    poster.title ||
    poster.name ||
    `Постер ${index + 1}`;

  return (
    <div
      className="group aspect-square bg-card rounded-xl border overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative flex-1 bg-muted flex items-center justify-center overflow-hidden">
        {poster.AspectRatio && (
          <Badge className="absolute right-3 top-3 z-10 shadow-md bg-background/60">
            {poster.AspectRatio}
          </Badge>
        )}
        {url ? (
          <button
            type="button"
            className="w-full h-full"
            onClick={() =>
              onPreview({
                url,
                title,
              })
            }
          >
            <img
              src={url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
            />
          </button>
        ) : (
          <span className="text-muted-foreground text-sm px-4 text-center">
            Без превью
          </span>
        )}
      </div>
      <div className="p-3 border-t bg-gradient-to-b from-background/80 to-background">
        <p className="text-sm font-semibold truncate">
          {title}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="relative group/price">
            <Badge
              variant="outline"
              className="text-xs font-semibold px-3 py-1.5"
            >
              <span className="blur-[4px] select-none">999</span>
              <span className="ml-1">руб</span>
            </Badge>
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border/50 opacity-0 group-hover/price:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Цена зависит от размера постера
              <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-popover" />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full px-3 h-8 gap-1.5 text-xs font-medium border-primary/60 text-primary bg-background/80 hover:bg-primary hover:text-primary-foreground shadow-sm transition-colors duration-200"
            onClick={() => onSelectSize({ poster, title, url })}
            aria-label="Добавить постер в корзину"
          >
            Добавить в корзину
          </Button>
        </div>
      </div>
    </div>
  );
}


