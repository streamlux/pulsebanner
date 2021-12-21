import { NextSeoProps } from "next-seo"

// https://github.com/garmeeh/next-seo#nextseo-options
// Options for the SEO component we put in pages/_app.ts
const seoOptions: NextSeoProps = {

    // Basic information https://github.com/garmeeh/next-seo#add-seo-to-page
    description: "Easily attract more viewers to your stream from Twitter.",
    titleTemplate: 'PulseBanner - %s',
    defaultTitle: 'PulseBanner',
    twitter: {
        cardType: 'summary_large_image',
        site: '@PulseBanner'
    },

    // https://github.com/garmeeh/next-seo#open-graph
    openGraph: {
        site_name: 'PulseBanner',
        type: 'website',
        url: 'https://pulsebanner.com/',
        title: 'PulseBanner - Twitter Live Banner for Twitch',
        description: 'Easily attract more viewers to your stream from Twitter',
        images: [
            {
                url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/pulsebanner_og.webp',
                width: 1200,
                height: 627,
                alt: 'PulseBanner automates your Twitter banner for free.',
            },
        ]
    }
}

export default seoOptions;
