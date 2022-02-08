import {
    HStack,
    Avatar,
    Flex,
    Box,
    Link,
    WrapItem,
    Button,
    Center,
    Wrap,
    useBreakpointValue,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    useColorMode,
    IconButton,
    Heading,
    Image,
    LinkBox,
    LinkOverlay,
    useBreakpoint,
    useDisclosure,
    Text,
    Spacer,
    Tag,
    Stack ,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import React from 'react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAdmin } from '../util/hooks/useAdmin';
import favicon from '@app/public/logo.webp';
import { FaArrowRight, FaDiscord, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { NewsletterModal } from './newsletter/NewsletterModal';
import { trackEvent } from '@app/util/umami/trackEvent';
import { holidayDecor, promo, promoCode } from '@app/util/constants';

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
    const { data: session, status } = useSession({ required: false });
    const loading = status === 'loading';
    const [isAdmin] = useAdmin({ required: false });
    const { colorMode, toggleColorMode } = useColorMode();
    const breakpoint = useBreakpoint();
    const breakpointValue = useBreakpointValue(
        {
            base: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 4,
            },
            sm: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 4,
            },
            md: {
                mobile: true,
                gridColumns: 2,
                gridSpacing: 6,
            },
            lg: {
                mobile: true,
                gridColumns: 3,

                gridSpacing: 6,
            },
            xl: {
                gridColumns: 3,

                gridSpacing: 10,
            },
        },
        'base'
    );

    // for newsletter modal
    const { isOpen, onClose, onToggle } = useDisclosure();

    return (
        <>
            {breakpointValue.mobile && (
                <Center>
                    <Box background={colorMode === 'dark' ? 'gray.700' : 'blackAlpha.200'} w="full" mx="2" py="2" px={['2', '8']} rounded="md">
                        <Center id="nav-links" fontSize={['sm', 'md']} className={`nojs-show ${!session && loading ? styles.loading : styles.loaded}`}>
                            <Wrap spacing={['4', '16', '20', '24']}>
                                <WrapItem>
                                    <NextLink href="/profile" passHref>
                                        <HStack>
                                            <Link>Profile Pic</Link>
                                        </HStack>
                                    </NextLink>
                                </WrapItem>
                                <WrapItem>
                                    <NextLink href="/banner" passHref>
                                        <Link>Banner</Link>
                                    </NextLink>
                                </WrapItem>
                                <WrapItem>
                                    <NextLink href="/name" passHref>
                                        <HStack>
                                            <Link>Name Changer</Link>
                                        </HStack>
                                    </NextLink>
                                </WrapItem>
                                <WrapItem>
                                    <NextLink href="/pricing" passHref>
                                        <Link>Pricing</Link>
                                    </NextLink>
                                </WrapItem>
                            </Wrap>
                        </Center>
                    </Box>
                </Center>
            )}
            {promo && (
                <Center pt={['4', '2']}>
                    <Box px="4" py="2" mx="4" color={colorMode === 'dark' ? 'black' : 'black'} w={['fit-content']} bg="green.200" rounded="lg">
                        <Center h="full">
                            <Stack direction={['column', 'column', 'row']}>
                                <Text textAlign="center" pt="1" fontSize={['sm', 'md']}>
                                    {'Sale! Use code'}{' '}
                                    <Tag color="black" fontWeight="bold" colorScheme="green" bg={colorMode === 'dark' ? 'green.100' : undefined}>
                                        {promoCode}
                                    </Tag>{' '}
                                    {'at checkout to save 10% on your first month!'}
                                </Text>
                                <NextLink href="/pricing" passHref>
                                    <Button rightIcon={<FaArrowRight />} colorScheme="whiteAlpha" bg="green.100" size="sm" color="black">
                                        View pricing
                                    </Button>
                                </NextLink>
                            </Stack>
                        </Center>
                    </Box>
                </Center>
            )}
        </>
    );
}
