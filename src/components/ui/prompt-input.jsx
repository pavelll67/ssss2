import * as React from "react";
import { Plus, ArrowUp } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function PromptInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Введите описание постера...",
  disabled = false,
  isLoading = false,
  className,
  ...props 
}) {
  const textareaRef = React.useRef(null);
  const [isMultiline, setIsMultiline] = React.useState(false);

  // Автоматическое изменение размера textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Сброс высоты для получения правильного scrollHeight
    textarea.style.height = 'auto';
    
    // Проверяем, нужна ли многострочность
    const needsMultiline = textarea.scrollHeight > textarea.clientHeight;
    setIsMultiline(needsMultiline);
    
    // Устанавливаем высоту
    const maxHeight = 200; // Максимальная высота в пикселях
    if (textarea.scrollHeight <= maxHeight) {
      textarea.style.height = `${textarea.scrollHeight}px`;
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    }
  }, [value]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isLoading) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const handleChange = (e) => {
    onChange?.(e);
  };

  return (
    <div className={cn("relative w-full", className)} {...props}>
      <div 
        className={cn(
          "relative flex gap-3 border bg-background px-3 shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all",
          isMultiline 
            ? "items-start py-2.5 rounded-2xl" 
            : "items-center py-2.5 rounded-full"
        )}
      >
        {/* Иконка плюса слева */}
        <button
          type="button"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors",
            isMultiline ? "h-8 w-8 mt-1" : "h-8 w-8"
          )}
          disabled={disabled}
          aria-label="Добавить"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Textarea поле */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden min-h-[1.5rem] max-h-[200px] leading-6"
          style={{
            height: 'auto',
          }}
        />

        {/* Кнопка отправки справа */}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isLoading || !value?.trim()}
          size="icon"
          className={cn(
            "shrink-0 rounded-full",
            isMultiline ? "h-8 w-8 mt-1" : "h-8 w-8"
          )}
          aria-label="Отправить"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

