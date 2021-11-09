import './styles.css';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '../definitions/chakra/theme';
import React from 'react';
import Layout from '../components/layout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import favicon from '../public/favicon.png';
import { DefaultSeo } from 'next-seo';

// Use of the <SessionProvider> is now mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }) {
    const router = useRouter();
    return (
        <>
            <Head>
                <link rel="shortcut icon" type="image/png" href={favicon.src} />
                <link rel="shortcut icon" sizes="192x192" href={favicon.src} />
                <link rel="apple-touch-icon" href={favicon.src} />
            </Head>
            <DefaultSeo title="PulseBanner - Twitter live banner for Twitch" description="Easily attract more viewers to your stream from Twitch." />
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
        </>
    );
}
