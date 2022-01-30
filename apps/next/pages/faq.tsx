import { NextSeo } from 'next-seo';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { allFaqItems } from '@app/modules/faq/data';
import { Container } from '@chakra-ui/react';

export default function Page() {
    return (
        <>
            <NextSeo
                title="FAQ"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/faq',
                    title: 'PulseBanner - FAQ',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />

            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <FaqSection items={allFaqItems} />
            </Container>
        </>
    );
}
