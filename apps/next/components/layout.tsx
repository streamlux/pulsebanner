import React from 'react';
import { Box, Center, chakra, Container, Flex } from '@chakra-ui/react';
import Header from './header';
import Footer from './footer';

export default function Layout({ children }) {
    return (
        <>
            <Flex direction="column" as={chakra.div} minH="100vh">
                <Box as={chakra.header}>
                    <Header />
                </Box>
                <Flex as={chakra.main} flex="1" px={['2', '8', '16', '36']} w="100vw">
                    <Box w="full" pt="20">
                        {children}
                    </Box>
                </Flex>
                <Box as={chakra.footer}>
                    <Footer />
                </Box>
            </Flex>
        </>
    );
}
