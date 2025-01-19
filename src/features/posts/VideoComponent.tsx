import React from 'react'

type Props = {
    videoUrl: string
}

export const VideoComponent = (props: Props) => {
    const { videoUrl } = props
    return !!videoUrl ? (
        <div>
            <iframe className='md:rounded-2xl' width="100%" height="350px" src={videoUrl} title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen>

            </iframe>
        </div>
    ) : null
}