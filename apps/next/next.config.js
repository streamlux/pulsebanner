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
                source: '/',
                destination: '/banner',
                permanent: true,
            },
        ]
    }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

module.exports = withNx(withBundleAnalyzer(nextConfig));
