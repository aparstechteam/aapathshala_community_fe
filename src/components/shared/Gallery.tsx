/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
// import Image from "next/image";

type Props = {
  images: string[];
  setSelectedImage: (image: string) => void;
};

export const Gallery = (props: Props) => {
  const { images, setSelectedImage } = props;
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setAspectRatio(img.naturalHeight / img.naturalWidth);
  };
  return (
    <div
      className={cn(
        "grid gap-3",
        images?.length > 0 ? " sm:grid-cols-2 grid-cols-1" : "grid-cols-1"
      )}
    >
      {images?.slice(0, 4).map((image, index) => (
        <div
          key={image}
          className="w-full rounded-lg bg-cover bg-center relative"
          style={{
            paddingBottom: aspectRatio ? `${aspectRatio * 100}%` : "56.25%",
          }}
        >
          <Image
            src={image}
            alt="Image"
            fill
            className="object-cover rounded-xl bg-ash"
            onLoad={handleImageLoad}
          />
          {index === 3 && images?.length > 4 && (
            <button
              type="button"
              onClick={() => setSelectedImage(image)}
              className="absolute inset-0 bg-black/50 hover:bg-black/70 duration-300 rounded-xl flex items-center justify-center"
            >
              <span className="p-2 text-white text-lg font-bold">See More</span>
            </button>
          )}
          {index !== 3 && (
            <button
              type="button"
              onClick={() => setSelectedImage(image)}
              className="absolute inset-0"
            />
          )}
        </div>
      ))}
    </div>
  );
};
