// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    nx: {
        // Set this to true if you would like to to use SVGR
        // See: https://github.com/gregberge/svgr
        svgr: false,
    },

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {


        config.watchOptions = {};

        // Important: return the modified config
        return config;
    },
    async redirects() {
        return [
            {
                source: '/discord',
                destination: 'https://discord.gg/JU4McuJQt4',
                permanent: false,
                statusCode: 307
            },
            {
                source: '/redeem',
                destination: '/api/pricing/redeem',
                permanent: false,
                statusCode: 307,
                has: [
                    {
                      type: 'query',
                      key: 'giftId'
                    }
                ]
            }
        ]
    },
    // fix heap limit allocation failed issue with NextJS 12
    // https://github.com/vercel/next.js/issues/30330#issuecomment-952172377
    experimental: {
        esmExternals: false,
    },
    compiler: {
        // ssr and displayName are configured by default
        styledComponents: true,
    },
    reactStrictMode: true,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

module.exports = withNx(withBundleAnalyzer(nextConfig));
