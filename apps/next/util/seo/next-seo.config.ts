import { NextSeoProps } from "next-seo"

// https://github.com/garmeeh/next-seo#nextseo-options
// Options for the SEO component we put in pages/_app.ts
const seoOptions: NextSeoProps = {

    // Basic information https://github.com/garmeeh/next-seo#add-seo-to-page
    title: "PulseBanner - Twitter live banner for Twitch",
    description: "Easily attract more viewers to your stream from Twitter.",

    twitter: {
        cardType: 'summary_large_image',
        site: '@PulseBanner'
    },

    // https://github.com/garmeeh/next-seo#open-graph
    openGraph: {
        type: 'website',
        url: 'https://pulsebanner.com/',
        title: 'PulseBanner - Twitter live banner for Twitch',
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
