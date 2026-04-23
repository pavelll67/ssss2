import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STYLES = [
  { 
    id: 'custom', 
    name: 'Свой',
    image: null
  },
  { 
    id: 'realistic', 
    name: 'Реализм',
    image: '/styles/realistic.jpg'
  },
  { 
    id: 'minimalist', 
    name: 'Минимализм',
    image: '/styles/minimalist.jpg'
  },
  { 
    id: 'neon', 
    name: 'Неон',
    image: '/styles/neon.jpg'
  },
  { 
    id: 'watercolor', 
    name: 'Акварель',
    image: '/styles/watercolor.jpg'
  },
  { 
    id: 'vintage-comic', 
    name: 'Винтаж',
    image: '/styles/vintage-comic.jpg'
  },
  { 
    id: 'art-deco', 
    name: 'Арт-деко',
    image: '/styles/art-deco.jpg'
  },
  { 
    id: 'comic-book', 
    name: 'Комикс',
    image: '/styles/comic-book.jpg'
  },
  { 
    id: 'grunge', 
    name: 'Гранж',
    image: '/styles/grunge.jpg'
  },
];

// Компонент для превью стиля
function StylePreview({ style, className = "" }) {
  if (!style.image) {
    return (
      <div className={cn("relative w-[180px] h-[180px] border rounded-lg bg-muted/30", className)}>
      </div>
    );
  }
  
  return (
    <div className={cn("relative w-[180px] h-[180px] border rounded-lg bg-muted/30 overflow-hidden", className)}>
      <img 
        src={style.image} 
        alt={style.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback если изображение не загрузилось
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div class="w-full h-full flex items-center justify-center bg-muted/50">
              <span class="text-xs text-muted-foreground">${style.name}</span>
            </div>
          `;
        }}
      />
    </div>
  );
}

// Компонент иконки для списка
function StyleIcon({ style, className = "h-4 w-4" }) {
  return (
    <div className={cn("relative overflow-hidden rounded", className)}>
      <img 
        src={style.image} 
        alt={style.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback - простая иконка если изображение не загрузилось
          e.target.style.display = 'none';
          const parent = e.target.parentElement;
          if (parent && !parent.querySelector('.fallback-icon')) {
            const fallback = document.createElement('div');
            fallback.className = 'fallback-icon w-full h-full bg-muted flex items-center justify-center';
            fallback.innerHTML = '<div class="w-2 h-2 bg-muted-foreground/30 rounded"></div>';
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );
}

export function StyleSelector({ value, onValueChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState(null);
  const defaultStyle = STYLES[0]; // "Свой"
  const selectedStyle = value ? STYLES.find(s => s.id === value) : defaultStyle;
  
  // Все стили в одном списке без категорий
  
  const displayStyle = hoveredStyle 
    ? STYLES.find(s => s.id === hoveredStyle) || selectedStyle
    : selectedStyle;

  const handleSelect = (styleId) => {
    onValueChange(styleId);
    setOpen(false);
    setHoveredStyle(null);
  };

  // Показываем "Стиль" если выбран "Свой" или ничего не выбрано
  const buttonText = (!value || value === 'custom') ? 'Стиль' : selectedStyle.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 px-3"
          disabled={disabled}
        >
          <span>{buttonText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        side="top" 
        align="start"
        sideOffset={4}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-4">Стиль</h3>
          <div className="flex gap-4 items-start">
            {/* Превью слева */}
            <div className="flex flex-col items-center gap-4">
              <StylePreview style={displayStyle} />
            </div>

            {/* Список опций справа - все стили друг за другом без секций */}
            <div className="flex flex-col gap-3 min-w-[160px]">
              <div className="flex flex-col gap-0.5">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleSelect(style.id)}
                    onMouseEnter={() => setHoveredStyle(style.id)}
                    onMouseLeave={() => setHoveredStyle(null)}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-accent text-left w-full",
                      (!value || value === 'custom' ? style.id === 'custom' : value === style.id) && "bg-accent"
                    )}
                  >
                    <span>{style.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

