import Image from 'next/image'
import React from 'react'

export const UnpaidMsg = () => {
    return (
        <div className='flex flex-col pt-10 xl:pt-4 gap-4 items-center justify-center'>
            <Image src={'/hw-404.png'} alt='hw-404' width={100} height={100} className='mx-auto' />
            <h2 className='text-xl font-bold text-center'>ACS Future School কতৃক এই হোমওয়ার্ক কমিউনিটি শুধুমাত্র পেইড ইউজারদের জন্য একমাত্র প্রযোজ্য</h2>
            <h2 className='text-base text-center'>তাই আর দেরি না করে এখনই কিনে নাও আমাদের যেকোন একটি কোর্স এবং উপভোগ কর সব কিছু একসাথে</h2>
        </div>
    )
}