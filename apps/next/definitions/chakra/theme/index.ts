import { ChakraTheme, extendTheme, ThemeConfig, ThemeOverride } from '@chakra-ui/react';

import styles from './styles';

import colors from './foundations/colors';

import fontSizes from './foundations/fontSizes';
import components from './components';

/**
 * This file is generated for providing a custom theme to Chakra UI
 *
 * To learn more about custom themes
 * please visit https://chakra-ui.com/docs/getting-started#add-custom-theme-optional
 */

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};



const overrides: ThemeOverride = {
    ...styles,
    ...components,
    colors,
    fontSizes,
};

const theme = extendTheme(overrides, { config }, {
    colors: {
        twitch: {
            50: '#9146FF',
            100: '#9146FF',
            200: '#9146FF',
            300: '#9146FF',
            400: '#9146FF',
            500: '#9146FF',
            600: '#9146FF',
            700: '#9146FF',
            800: '#9146FF',
            900: '#9146FF',
        }
    }
});

export default theme;
