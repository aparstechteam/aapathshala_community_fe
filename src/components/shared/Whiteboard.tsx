/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import * as markerjs2 from "markerjs2";
import Image from 'next/image';
import { Button } from '../ui';

type Props = {
    image: string;
}

export const Whiteboard = (props: Props) => {
    const { image } = props;
    const imgRef = React.useRef<HTMLImageElement>(null);
    const [newimage, setNewimage] = useState<string>('')
    const [imgFile, setImgFile] = useState<File>()

    const showMarkerArea = () => {

        if (imgRef.current !== null) {
            const markerArea = new markerjs2.MarkerArea(imgRef.current);
            markerArea.addEventListener("render", (event) => {
                setNewimage(event.dataUrl);
                if (imgRef.current) {
                    imgRef.current.src = event.dataUrl;
                    const file = new File([event.dataUrl], "whiteboard.png", { type: "image/png" });
                    setImgFile(file)
                }
            });
            markerArea.show();
        }
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("image", imgFile as File);
        console.log(formData);
    }

    return (
        <div className='w-full h-full grid gap-4 justify-center items-center py-[100px]'>
            <div className='w-full'>
                <div className='w-full h-[500px] relative'>
                    <Image src={newimage} alt="sample" fill />
                </div>
                <img
                    ref={imgRef}
                    src={image}
                    alt="homeworks"
                    crossOrigin="anonymous"
                    style={{ maxWidth: "50%" }}
                    onClick={() => showMarkerArea()}
                />
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    )
}