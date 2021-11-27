import { NextSeoProps } from "next-seo"

// https://github.com/garmeeh/next-seo#nextseo-options
// Options for the SEO component we put in pages/_app.ts
const seoOptions: NextSeoProps = {

    // Basic information https://github.com/garmeeh/next-seo#add-seo-to-page
    title: "PulseBanner - Twitter live banner for Twitch",
    description: "Easily attract more viewers to your stream from Twitter.",

    // https://github.com/garmeeh/next-seo#open-graph
    openGraph: {
        type: 'website',
        url: 'https://pulsebanner.com/',
        title: 'PulseBanner - Twitter live banner for Twitch',
        description: 'Easily attract more viewers to your stream from Twitch',
    }
}

export default seoOptions;
