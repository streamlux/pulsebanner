import './styles.css';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '../definitions/chakra/theme';
import React from 'react';
import Layout from '../components/layout';
import Script from 'next/script';
import Head from 'next/head';
import favicon from '../public/favicon.png';
import { DefaultSeo } from 'next-seo';
import seoOptions from '@app/util/seo/next-seo.config';
import dynamic from 'next/dynamic';
import { holidayDecor } from '@app/util/constants';

const Snow = dynamic(() => import('react-snowfall'));

declare global {
    // eslint-disable-next-line no-var
    const umami: any;
}

// Use of the <SessionProvider> is now mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }) {
    // const router = useRouter();

    return (
        <>
            <Head>
                <link rel="shortcut icon" type="image/png" href={favicon.src} />
                <link rel="shortcut icon" sizes="192x192" href={favicon.src} />
                <link rel="apple-touch-icon" href={favicon.src} />
            </Head>
            <Script key="umami" strategy="afterInteractive" data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} src={process.env.NEXT_PUBLIC_UMAMI_SRC} />
            {/* https://github.com/garmeeh/next-seo */}
            <DefaultSeo {...seoOptions} />
            <SessionProvider session={pageProps.session}>
                <ChakraProvider theme={theme}>
                    {/* {router.pathname === '/' ? (
                    <Component {...pageProps} />
                ) : ( */}
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>

                    {/* )} */}
                </ChakraProvider>
            </SessionProvider>
            {holidayDecor && <div suppressHydrationWarning={true}>{process.browser && <Snow snowflakeCount={70} radius={[0.5, 2]} speed={[1, 2]} wind={[-0.5, 0.5]} />}</div>}
        </>
    );
}
