/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface ValidImageProps {
    src: string; // Image URL to validate
    alt: string; // Alt text for the image
    fallbackSrc?: string; // Optional fallback image
    height?: number; // Image height
    width?: number; // Image width
    className?: string; // Additional CSS classes
    size?: 'sm' | 'md';
}

const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
        // Use the Image object to validate the URL
        return await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    } catch (error) {
        console.error("Error validating image:", error);
        return false;
    }
};

export const ValidImage: React.FC<ValidImageProps> = ({
    src,
    alt,
    size = 'md',
    fallbackSrc = "/avatar-boy.jpg",
    height = 40,
    width = 40,
    className = "",
}) => {
    const [validSrc, setValidSrc] = useState<string>(fallbackSrc);

    useEffect(() => {
        const validateImage = async () => {
            const isValid = await validateImageUrl(src);
            if (isValid) {
                setValidSrc(src);
            } else {
                setValidSrc(fallbackSrc);
            }
        };
        if (!!src) validateImage();
    }, [src, fallbackSrc]);

    return size === 'md' ? (
        <img
            src={validSrc}
            alt={alt}
            height={height}
            width={width}
            className={cn(`rounded-full object-cover`, !className && '!w-[40px] !h-[40px]', className)}
        />
    ) : (
        <img
            src={validSrc}
            alt={alt}
            height={20}
            width={20}
            className={cn(`rounded-full object-cover`, !className && '!w-[40px] !h-[40px]', className)}
        />
    );
};
