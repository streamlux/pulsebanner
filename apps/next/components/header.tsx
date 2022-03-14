import {
    HStack,
    Avatar,
    Flex,
    Box,
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
    Text,
    Spacer,
    Tag,
    Stack,
    SimpleGrid,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import React from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAdmin } from '../util/hooks/useAdmin';
import favicon from '@app/public/logo.webp';
import { FaArrowRight, FaDiscord, FaTwitter } from 'react-icons/fa';
import { trackEvent } from '@app/util/umami/trackEvent';
import { discordLink, promo, promoCode, twitterLink } from '@app/util/constants';
import { HeaderMenuItem } from './header/HeaderMenuItem';

const headerImages = {
    profile: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/assets/feature-nav/header_profile.svg',
    banner: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/assets/feature-nav/header_banner.svg',
    nameChangerDark: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/assets/feature-nav/namechanger.svg',
    nameChangerLight: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/assets/feature-nav/namechanger_light.svg',
};

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header({ headerPortalRef }: { headerPortalRef: React.MutableRefObject<any> }) {
    const { data: session, status } = useSession({ required: false });
    const loading = status === 'loading';
    const [isAdmin] = useAdmin({ required: false });
    const { colorMode, toggleColorMode } = useColorMode();
    const breakpoint = useBreakpoint();
    const nameChangerLogo = colorMode === 'dark' ? headerImages.nameChangerDark : headerImages.nameChangerLight;
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
                gridColumns: 2,
                gridSpacing: 6,
            },
            lg: {
                gridColumns: 3,
                gridSpacing: 6,
            },
            xl: {
                mobile: false,
                gridColumns: 3,
                gridSpacing: 10,
            },
        },
        'base'
    );

    const NavLinks = () => (
        <Center id="nav-links" fontSize="lg">
            <Wrap spacing={['2', '4', '6', '6']}>
                <Menu>
                    <MenuButton size="md" as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                        Features
                    </MenuButton>
                    <Portal containerRef={headerPortalRef}>
                        <MenuList flexDirection={'row'} h="auto" mx="8" maxW="90vw" bg="gray.800">
                            <SimpleGrid columns={[1, 2, 3]} spacing={[0, 4]} p="4">
                                <HeaderMenuItem
                                    href="/profile"
                                    colorMode={colorMode}
                                    description="Update your Twitter profile picture when you go live."
                                    imageSrc={headerImages.profile}
                                    title="Profile Picture"
                                />
                                <HeaderMenuItem
                                    href="/banner"
                                    colorMode={colorMode}
                                    description="Update your Twitter profile picture when you go live."
                                    imageSrc={headerImages.banner}
                                    title="Live Banner"
                                />
                                <HeaderMenuItem
                                    href="/name"
                                    colorMode={colorMode}
                                    description="Update your Twitter profile picture when you go live."
                                    imageSrc={nameChangerLogo}
                                    title="Name Changer"
                                />
                            </SimpleGrid>
                        </MenuList>
                    </Portal>
                </Menu>

                <NextLink href="/pricing" passHref>
                    <Button as="a" size="md" variant={'ghost'}>
                        Pricing
                    </Button>
                </NextLink>
            </Wrap>
        </Center>
    );

    return (
        <>
            <header>
                <noscript>
                    <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
                </noscript>
                <Box>
                    <Center w="full" className={styles.signedInStatus}>
                        <Flex
                            overflow={'visible'}
                            h="16"
                            maxH="16"
                            className={`nojs-show ${!session && loading ? styles.loading : styles.loaded}`}
                            p={['2', '2', '4', '4']}
                            px={['2', '2', '4', '4']}
                            alignItems="center"
                            justify="space-evenly"
                            w={['full', 'full', 'full', 'full', 'container.lg', 'container.xl']}
                        >
                            <Flex h="100%" maxH="100%" w="full">
                                <HStack maxH="10" w="200px">
                                    <LinkBox h="full" w="min">
                                        <HStack height="100%">
                                            <Image alt="PulseBanner logo" src={favicon.src} height="40px" width="40px" />
                                            <NextLink href="/" passHref>
                                                <LinkOverlay>
                                                    <Heading size="md" as="h1">
                                                        PulseBanner
                                                    </Heading>
                                                </LinkOverlay>
                                            </NextLink>
                                        </HStack>
                                    </LinkBox>
                                </HStack>
                                {!breakpointValue.mobile && <NavLinks />}
                                <Spacer />
                                <Flex experimental_spaceX="2" alignItems="center" justifySelf="flex-end">
                                    {breakpointValue.mobile && (
                                        <>
                                            <IconButton
                                                aria-label="Twitter"
                                                variant={'ghost'}
                                                size="sm"
                                                onClick={() => window.open('https://twitter.com/pulsebanner', '_blank')}
                                                icon={<FaTwitter />}
                                                className={trackEvent('click', 'discord-button')}
                                            />
                                            <IconButton
                                                size="sm"
                                                onClick={() => window.open('/discord', '_blank')}
                                                aria-label="Discord"
                                                title="Discord"
                                                variant="ghost"
                                                icon={<FaDiscord />}
                                                className={trackEvent('click', 'discord-button')}
                                            />
                                        </>
                                    )}
                                    {!breakpointValue.mobile && (
                                        <>
                                            <NextLink href={twitterLink} passHref>
                                                <IconButton
                                                    aria-label="Twitter"
                                                    target={'_blank'}
                                                    variant={'ghost'}
                                                    size="sm"
                                                    as="a"
                                                    icon={<FaTwitter />}
                                                    className={trackEvent('click', 'discord-button')}
                                                />
                                            </NextLink>

                                            <NextLink href={discordLink} passHref>
                                                <Button
                                                    as="a"
                                                    target={'_blank'}
                                                    variant={'ghost'}
                                                    size="sm"
                                                    leftIcon={<FaDiscord />}
                                                    className={trackEvent('click', 'discord-button')}
                                                >
                                                    Join our Discord
                                                </Button>
                                            </NextLink>
                                        </>
                                    )}
                                    {/*
                                    <IconButton
                                        size={'sm'}
                                        aria-label="Toggle theme"
                                        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                                        onClick={toggleColorMode}
                                        className={trackEvent('click', 'color-theme-button')}
                                    >
                                        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                                    </IconButton> */}

                                    {!session && (
                                        <NextLink href="/api/auth/signin" passHref>
                                            <Button
                                                as="a"
                                                className={styles.buttonPrimary}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    signIn('twitter');
                                                }}
                                                size={breakpoint === 'base' ? 'sm' : 'md'}
                                                colorScheme="twitter"
                                                leftIcon={<FaTwitter />}
                                            >
                                                Sign in
                                            </Button>
                                        </NextLink>
                                    )}
                                    {session && (
                                        <Menu>
                                            <Avatar size="sm" as={MenuButton} name={session.user.name} src={session.user.image} />
                                            <Portal>
                                                <MenuList zIndex={11} bg="gray.800">
                                                    <NextLink href="/account" passHref>
                                                        <MenuItem as="a">Account</MenuItem>
                                                    </NextLink>
                                                    <MenuItem onClick={() => signOut({ redirect: false })}>Sign out</MenuItem>
                                                    {isAdmin && (
                                                        <NextLink href="/admin" passHref>
                                                            <MenuItem as="a">Admin</MenuItem>
                                                        </NextLink>
                                                    )}
                                                </MenuList>
                                            </Portal>
                                        </Menu>
                                    )}
                                </Flex>
                            </Flex>
                        </Flex>
                    </Center>
                </Box>
            </header>
            {breakpointValue.mobile && <NavLinks />}
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
