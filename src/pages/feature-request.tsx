import { Layout } from '@/components';
import { FeatureRequest } from '@/features/featureRequest';
import Head from 'next/head';


const FeatureRequestPage = () => {
    return (
        <>
            <Head>
                <title>Feature Request</title>
            </Head>
            <Layout>
                <FeatureRequest />
            </Layout>
        </>
    )
}

export default FeatureRequestPage