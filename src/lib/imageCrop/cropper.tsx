import React, { useState, useRef, useEffect } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Image from 'next/image'

type Props = {
    imgFile: File
    onCropComplete: (croppedFile: File) => void
}

export function ImageCropper({ imgFile, onCropComplete }: Props) {

    const [imgSrc, setImgSrc] = useState<string>('')
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const imgRef = useRef<HTMLImageElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const reader = new FileReader()
        reader.onload = () => setImgSrc(reader.result as string)
        reader.readAsDataURL(imgFile)
    }, [imgFile])

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height), width, height))
    }

    useEffect(() => {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

        const image = imgRef.current
        const canvas = previewCanvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        canvas.width = completedCrop.width * scaleX
        canvas.height = completedCrop.height * scaleY

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        )

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], imgFile.name, { type: 'image/png' })
                onCropComplete(croppedFile)
            }
        }, 'image/png')
    }, [completedCrop, imgFile, onCropComplete])

    return (
        <div className='pt-2'>
            {!!imgSrc && (
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                // aspect={16 / 9}
                >
                    <Image
                        height={400}
                        width={400}
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
        </div>
    )
}
