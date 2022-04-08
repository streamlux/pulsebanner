import React, { useRef } from 'react';
import { Box, Button, chakra, Flex, Stack, Tag, Text, useColorMode, Portal, useDisclosure, CloseButton, Center, useBreakpoint, HStack } from '@chakra-ui/react';
import Header from './header';
import Footer from './footer';
import { FaArrowRight } from 'react-icons/fa';
import NextLink from 'next/link';
import { emggLogoSrc, promo, promoCode } from '@app/util/constants';
import { useRouter } from 'next/router';
import { Promotion } from './header/Promotion';

export default function Layout({ children }: any) {
    const { colorMode, setColorMode } = useColorMode();
    if (colorMode === 'light') {
        setColorMode('dark');
    }
    const { onClose, isOpen } = useDisclosure({
        defaultIsOpen: true,
    });
    const breakpoint = useBreakpoint();
    const router = useRouter();
    const emgg = router.asPath === '/emgg';

    const pagesWithoutPromo = ['/admin', '/admin/banner'];
    const showPromo = promo && isOpen && breakpoint !== 'base' && !pagesWithoutPromo.includes(router.asPath);
    const headerPortalRef = useRef();

    return (
        <Flex direction="column" as={chakra.div} maxH="100%" overflow="hidden" minH="100vh" bg={emgg ? 'black' : 'transparent'}>
            <Box as={chakra.header} zIndex={10} position={breakpoint !== undefined ? 'fixed' : undefined} w="full">
                <Header headerPortalRef={headerPortalRef} />
                <Box ref={headerPortalRef as any} />
            </Box>
            {emgg && (
                <Box
                    pos="absolute"
                    zIndex={1}
                    top="7%"
                    h="93%"
                    opacity={0.5}
                    backgroundBlendMode="darken"
                    w="full"
                    bgPosition="center"
                    bgRepeat="no-repeat"
                    bgSize="contain"
                    bgImg={emggLogoSrc}
                />
            )}
            <Flex zIndex={1} as={chakra.main} flex="1" px={['2', '8', '16', '36']} flexDirection="column" pt="64px">
                <Promotion />
                <Box w="full" pt={['10', '20']}>
                    {children}
                </Box>
            </Flex>
            {showPromo && false && (
                <Portal>
                    <Box
                        zIndex={1}
                        sx={{ position: 'fixed', bottom: '0', right: '0' }}
                        mb="4"
                        px="4"
                        py="2"
                        mx="4"
                        color={colorMode === 'dark' ? 'black' : 'black'}
                        bg="green.200"
                        rounded="lg"
                    >
                        <Stack direction={['column', 'row']}>
                            <HStack>
                                <Text textAlign="center" fontSize={['sm', 'md']}>
                                    {'Code'}{' '}
                                    <Tag color="black" fontWeight="bold" colorScheme="green" bg={colorMode === 'dark' ? 'green.100' : undefined}>
                                        {promoCode}
                                    </Tag>{' '}
                                    {'at checkout to save 10% on your first month! Ends 11:59 PT Jan 30'}
                                </Text>
                                {breakpoint === 'base' && (
                                    <Center>
                                        <CloseButton onClick={onClose} />
                                    </Center>
                                )}
                            </HStack>
                            <NextLink href="/pricing" passHref>
                                <Button rightIcon={<FaArrowRight />} colorScheme="whiteAlpha" bg="green.100" size="sm" color="black">
                                    View pricing
                                </Button>
                            </NextLink>
                            {breakpoint !== 'base' && (
                                <Center>
                                    <CloseButton onClick={onClose} />
                                </Center>
                            )}
                        </Stack>
                    </Box>
                </Portal>
            )}

            <Box zIndex={1} as={chakra.footer}>
                <Footer />
            </Box>
        </Flex>
    );
}
