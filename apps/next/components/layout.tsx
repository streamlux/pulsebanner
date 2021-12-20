import React, { useEffect } from 'react';
import {
    Box,
    Button,
    chakra,
    Flex,
    Stack,
    Tag,
    useToast,
    Text,
    useColorMode,
    Link,
    Portal,
    useDisclosure,
    CloseButton,
    Spacer,
    Center,
    useBreakpoint,
    HStack,
} from '@chakra-ui/react';
import Header from './header';
import Footer from './footer';
import { FaArrowRight } from 'react-icons/fa';
import NextLink from 'next/link';
import { holidayDecor } from '@app/util/constants';

export default function Layout({ children }) {
    const { colorMode } = useColorMode();
    const { onClose, isOpen } = useDisclosure({
        defaultIsOpen: true,
    });
    const breakpoint = useBreakpoint();
    return (
        <>
            <Flex direction="column" as={chakra.div} minH="100vh">
                <Box as={chakra.header}>
                    <Header />
                </Box>
                <Flex as={chakra.main} flex="1" px={['2', '8', '16', '36']} flexDirection="column">
                    <Box w="full" pt={['10', '20']}>
                        {children}
                    </Box>
                </Flex>
                {holidayDecor && isOpen && (
                    <Portal>
                        <Box
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
                                        {'Holiday sale! Use code'}{' '}
                                        <Tag color="black" fontWeight="bold" colorScheme="green" bg={colorMode === 'dark' ? 'green.100' : undefined}>
                                            HAPPY25
                                        </Tag>{' '}
                                        {'at checkout to save 25% on your first 3 months!'}
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

                <Box as={chakra.footer}>
                    <Footer />
                </Box>
            </Flex>
        </>
    );
}
