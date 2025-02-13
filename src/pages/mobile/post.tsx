import { CreatePost } from '@/features'
import React from 'react'

const MobilePostPage = () => {
    return (
        <div className='flex flex-col gap-4 text-black bg-ash h-screen w-full'>
            <div className='flex flex-col w-full gap-4 max-w-4xl py-10 mx-auto'>
                {/* <div className='w-[700px] h-[450px] mx-auto bg-white' style={{ position: 'relative' }}>
                    <iframe
                        src="https://customer-yo4w3ztkgeta1b8k.cloudflarestream.com/41e5ae99bb123e17c53637672b188ef2/watch"
                        loading="lazy"
                        className='rounded-2xl'
                        style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen={true}
                    ></iframe>
                </div> */}
                <CreatePost />
            </div>
        </div>
    )
}

export default MobilePostPage