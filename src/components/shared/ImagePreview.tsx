import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";

type Props = {
  selectedImage: string;
  setSelectedImage: (image: string | null) => void;
  images: string[];
};
export const ImagePreview = ({ selectedImage, setSelectedImage, images }: Props) => {
  const currentIndex = images.indexOf(selectedImage);
  return (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0">
        <div className="relative w-full h-full flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedImage && (
            <div className="flex-1 relative bg-white py-2 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setSelectedImage(images[currentIndex - 1])} disabled={currentIndex === 0} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black text-white z-[4] px-2 py-1 rounded-md">Prev</button>
              <Image
                src={selectedImage}
                alt="Full size image"
                className="object-contain rounded-xl w-full h-full"
                fill
              />
              <button type="button" onClick={() => setSelectedImage(images[currentIndex + 1])} disabled={currentIndex === images.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black z-[4] text-white px-2 py-1 rounded-md">Next</button>
            </div>
          )}
          <DialogFooter className="sm:px-6 px-4 py-4 bg-background/80 backdrop-blur-sm  flex justify-center">
            <Button
              variant="secondary"
              onClick={() => setSelectedImage(null)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
