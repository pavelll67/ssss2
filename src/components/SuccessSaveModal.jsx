import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function SuccessSaveModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="mb-6 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Успешно сохранено!
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground mb-6 text-lg">
            Постер успешно сохранен
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
            size="lg"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

