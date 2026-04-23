import { Dialog, DialogContent } from '@/components/ui/dialog';

export function PosterPreviewDialog({ poster, onClose }) {
  return (
    <Dialog
      open={!!poster}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-3xl">
        {poster && (
          <div className="w-full">
            <img
              src={poster.url}
              alt={poster.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


