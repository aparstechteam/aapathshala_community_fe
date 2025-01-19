import { Layout } from '@/components'
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'

const Marketpage = () => {
    return (
        <>
            <Head>
                <title>MarketPlace</title>
            </Head>
            <Layout>
                <div className='min-h-[calc(100vh-100px)] flex flex-col justify-center gap-4'>

                    <div className='w-full h-full grid gap-4 items-center justify-center max-w-5xl mx-auto'>
                        <Image src={'/images/coming-soon.svg'} alt='marketplace' width={100} height={100} className='mx-auto' />
                        <h2 className='text-xl font-bold text-center'>মারকেটপ্লেস শীঘ্রই আসছে! </h2>
                        <h2 className='text-base text-center'>চোখ রাখো ACS ফিউচার স্কুল, স্টাডি কমিউনিটিতে...</h2>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default Marketpage