import { ColorModeScript, DarkMode, useColorMode, useColorModeValue } from '@chakra-ui/react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import theme from '../definitions/chakra/theme';

export default class Document extends NextDocument {
    render() {
        return (
            <Html lang="en">
                <Head />
                <body>
                    {/* 👇 Here's the script */}

                    <ColorModeScript initialColorMode={'dark'} />
                    <DarkMode>
                        <Main />
                    </DarkMode>

                    <NextScript />
                </body>
            </Html>
        );
    }
}
