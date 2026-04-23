import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1', category: 'square' },
  { id: '2:3', name: '2:3', category: 'portrait' },
  { id: '3:2', name: '3:2', category: 'landscape' },
  { id: '3:4', name: '3:4', category: 'portrait' },
  { id: '4:3', name: '4:3', category: 'landscape' },
  { id: '9:16', name: '9:16', category: 'portrait' },
  { id: '16:9', name: '16:9', category: 'landscape' },
  { id: '21:9', name: '21:9', category: 'landscape' },
];

// Компонент для превью aspect ratio
function AspectRatioPreview({ ratio, className = "" }) {
  const getDimensions = (ratio) => {
    const [width, height] = ratio.split(':').map(Number);
    const aspect = width / height;
    
    const previewSize = 180;
    const padding = 15;
    const availableSize = previewSize - padding * 2;
    
    let rectWidth, rectHeight, x, y;
    
    if (aspect > 1) {
      // Горизонтальный (широкий)
      rectWidth = availableSize;
      rectHeight = rectWidth / aspect;
      x = padding;
      y = (previewSize - rectHeight) / 2;
    } else if (aspect < 1) {
      // Вертикальный (высокий)
      rectHeight = availableSize;
      rectWidth = rectHeight * aspect;
      x = (previewSize - rectWidth) / 2;
      y = padding;
    } else {
      // Квадрат
      rectWidth = availableSize;
      rectHeight = rectWidth;
      x = padding;
      y = padding;
    }
    
    return { width: rectWidth, height: rectHeight, x, y };
  };

  const { width, height, x, y } = getDimensions(ratio);

  return (
    <div className={cn("relative w-[180px] h-[180px] border rounded-lg bg-muted/30 flex items-center justify-center", className)}>
      <svg
        className="absolute inset-0"
        viewBox="0 0 180 180"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx="4"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium text-foreground relative z-10">{ratio}</span>
    </div>
  );
}

// Компонент иконки для списка
function AspectRatioIcon({ ratio, className = "h-4 w-4" }) {
  const getDimensions = (ratio) => {
    const [width, height] = ratio.split(':').map(Number);
    const aspect = width / height;
    
    const viewBoxSize = 16;
    const padding = 1;
    
    let rectWidth, rectHeight, x, y;
    
    if (aspect > 1) {
      rectHeight = viewBoxSize - padding * 2;
      rectWidth = rectHeight * aspect;
      if (rectWidth > viewBoxSize - padding * 2) {
        rectWidth = viewBoxSize - padding * 2;
        rectHeight = rectWidth / aspect;
      }
      x = padding;
      y = (viewBoxSize - rectHeight) / 2;
    } else if (aspect < 1) {
      rectWidth = viewBoxSize - padding * 2;
      rectHeight = rectWidth / aspect;
      if (rectHeight > viewBoxSize - padding * 2) {
        rectHeight = viewBoxSize - padding * 2;
        rectWidth = rectHeight * aspect;
      }
      x = (viewBoxSize - rectWidth) / 2;
      y = padding;
    } else {
      rectWidth = viewBoxSize - padding * 2;
      rectHeight = rectWidth;
      x = padding;
      y = padding;
    }
    
    return { width: rectWidth, height: rectHeight, x, y };
  };

  const { width, height, x, y } = getDimensions(ratio);

  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AspectRatioSelector({ value, onValueChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [hoveredRatio, setHoveredRatio] = useState(null);
  const selectedRatio = ASPECT_RATIOS.find(r => r.id === value) || ASPECT_RATIOS[0];
  
  const portraitRatios = ASPECT_RATIOS.filter(r => r.category === 'portrait');
  const landscapeRatios = ASPECT_RATIOS.filter(r => r.category === 'landscape');
  const squareRatios = ASPECT_RATIOS.filter(r => r.category === 'square');

  const displayRatio = hoveredRatio || value;

  const handleSelect = (ratioId) => {
    onValueChange(ratioId);
    setOpen(false);
    setHoveredRatio(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 gap-1.5 px-3"
          disabled={disabled}
        >
          <AspectRatioIcon ratio={value} />
          <span>{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        side="top" 
        align="start"
        sideOffset={4}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-4">Соотношение сторон</h3>
          <div className="flex gap-4 items-start">
            {/* Превью слева */}
            <div className="flex flex-col items-center gap-4">
              <AspectRatioPreview ratio={displayRatio} />
            </div>

            {/* Список опций справа */}
            <div className="flex flex-col gap-3 min-w-[160px]">
              {/* Portrait */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Портрет</h4>
                <div className="flex flex-col gap-0.5">
                  {portraitRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => handleSelect(ratio.id)}
                      onMouseEnter={() => setHoveredRatio(ratio.id)}
                      onMouseLeave={() => setHoveredRatio(null)}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-accent text-left w-full",
                        value === ratio.id && "bg-accent"
                      )}
                    >
                      <AspectRatioIcon ratio={ratio.id} className="h-3.5 w-3.5" />
                      <span>{ratio.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Square */}
              {squareRatios.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1.5 uppercase">Квадрат</h4>
                  <div className="flex flex-col gap-0.5">
                    {squareRatios.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => handleSelect(ratio.id)}
                        onMouseEnter={() => setHoveredRatio(ratio.id)}
                        onMouseLeave={() => setHoveredRatio(null)}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-accent text-left w-full",
                          value === ratio.id && "bg-accent"
                        )}
                      >
                        <AspectRatioIcon ratio={ratio.id} className="h-3.5 w-3.5" />
                        <span>{ratio.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Landscape */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1.5 uppercase">Альбомный</h4>
                <div className="flex flex-col gap-0.5">
                  {landscapeRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => handleSelect(ratio.id)}
                      onMouseEnter={() => setHoveredRatio(ratio.id)}
                      onMouseLeave={() => setHoveredRatio(null)}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors hover:bg-accent text-left w-full",
                        value === ratio.id && "bg-accent"
                      )}
                    >
                      <AspectRatioIcon ratio={ratio.id} className="h-3.5 w-3.5" />
                      <span>{ratio.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

