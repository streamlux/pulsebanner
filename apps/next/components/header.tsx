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
    IconButton,
    Heading,
    Image,
    LinkBox,
    LinkOverlay,
    useBreakpoint,
    Text,
    Spacer,
    SimpleGrid,
    useDisclosure,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import styles from './header.module.css';
import React from 'react';
import { ArrowRightIcon, ChevronDownIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useAdmin } from '../util/hooks/useAdmin';
import favicon from '@app/public/logo.webp';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { trackEvent } from '@app/util/umami/trackEvent';
import { discordLink, twitterLink } from '@app/util/constants';
import { HeaderMenuItem } from './header/HeaderMenuItem';
import { MobileHeaderMenuItem } from './header/MobileHeaderMenuItem';
import { Card } from './Card';
import { CustomSession } from '@app/services/auth/CustomSession';
import { useSession } from '@app/util/hooks/useSession';
import { Promotion } from './header/Promotion';

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
    const breakpoint = useBreakpoint();

    const { isOpen: mobileNavIsOpen, onToggle: mobileNavOnToggle, onClose: mobileNavOnClose } = useDisclosure();

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

    const showMobileNav = mobileNavIsOpen && breakpointValue?.mobile;

    const NavLinks = () => (
        <Center id="nav-links" fontSize="lg">
            <Wrap spacing={['2', '4', '6', '6']}>
                <Menu placement="bottom-start">
                    <MenuButton size="md" as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                        Features
                    </MenuButton>
                    <Portal containerRef={headerPortalRef}>
                        <MenuList flexDirection={'row'} h="auto" mx="8" maxW="90vw" bg="gray.800">
                            <SimpleGrid columns={[1, 2, 3]} spacing={[0, 4]} p="4" w='full'>
                                <NextLink href={'/profile'} passHref>
                                    <MenuItem rounded="md" p="0" _hover={{ bg: 'whiteAlpha.100' }} _focus={{ bg: 'whiteAlpha.100' }} w='full'>
                                        <HeaderMenuItem
                                            href="/profile"
                                            description="Update your Twitter profile picture when you go live."
                                            imageSrc={headerImages.profile}
                                            title="Profile Picture"
                                        />
                                    </MenuItem>
                                </NextLink>
                                <NextLink href={'/banner'} passHref>
                                    <MenuItem rounded="md" p="0" _hover={{ bg: 'whiteAlpha.100' }} _focus={{ bg: 'whiteAlpha.100' }}>
                                        <HeaderMenuItem
                                            href="/banner"
                                            description="Update your Twitter profile picture when you go live."
                                            imageSrc={headerImages.banner}
                                            title="Live Banner"
                                        />
                                    </MenuItem>
                                </NextLink>
                                <NextLink href={'/name'} passHref>
                                    <MenuItem rounded="md" p="0" _hover={{ bg: 'whiteAlpha.100' }} _focus={{ bg: 'whiteAlpha.100' }}>
                                        <HeaderMenuItem
                                            href="/name"
                                            description="Update your Twitter profile picture when you go live."
                                            imageSrc={headerImages.nameChangerDark}
                                            title="Name Changer"
                                        />
                                    </MenuItem>
                                </NextLink>
                            </SimpleGrid>
                            <NextLink href="/pricing" passHref>
                                <LinkOverlay onClick={mobileNavOnClose} h="min" w="min" pos={'relative'}>
                                    <Box mx="4" pb="2">
                                        <Card
                                            props={{
                                                color: 'white',
                                                p: '0',
                                                border: 'none',
                                                w: 'full',
                                                h: 'full',
                                                bgGradient: 'linear(to-tr, #9246FF, #2AA9E0)',
                                                transition: 'all 0.1s ease-in-out',
                                                _hover: {
                                                    transform: 'scale(1.005)',
                                                    bgGradient: 'linear(to-tr, #9846FF, #4AA9E0)',
                                                },
                                            }}
                                        >
                                            <Flex direction={'column'} justifyItems="stretch" h="full" rounded="md" w="full">
                                                <Box p="4" px="6" flexGrow={1} w="full">
                                                    <Text fontSize={'2xl'}>Level up with a</Text>
                                                    <Heading>PulseBanner Membership.</Heading>
                                                    {/* <Text my="4">Choose a plan and begin customizing in seconds. Then experience how PulseBanner can help you grow.</Text> */}

                                                    <HStack>
                                                        <Text fontWeight={'bold'} fontSize={'xl'}>
                                                            Learn more
                                                        </Text>
                                                        <ArrowRightIcon />
                                                    </HStack>
                                                </Box>
                                            </Flex>
                                        </Card>
                                    </Box>
                                </LinkOverlay>
                            </NextLink>
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
                <Box bg={mobileNavIsOpen ? 'gray.800' : 'rgba(26, 32, 44, 0.95)'}>
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
                                {!breakpointValue?.mobile && <NavLinks />}
                                <Spacer />
                                <Flex experimental_spaceX="2" alignItems="center" justifySelf="flex-end">
                                    {!breakpointValue?.mobile && (
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

                                    {!session && (
                                        <NextLink href="/api/auth/signin" passHref>
                                            <Button
                                                as="a"
                                                className={styles.buttonPrimary}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    signIn('twitter');
                                                }}
                                                size={breakpoint === 'base' ? 'md' : 'md'}
                                                colorScheme="twitter"
                                                leftIcon={<FaTwitter />}
                                            >
                                                Sign In
                                            </Button>
                                        </NextLink>
                                    )}

                                    {session && (
                                        <Menu>
                                            <Avatar size="sm" as={MenuButton} name={(session as CustomSession).user.name ?? ''} src={(session as CustomSession).user.image ?? ''} />
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

                                    {breakpointValue?.mobile && (
                                        <IconButton
                                            size="md"
                                            onClick={mobileNavOnToggle}
                                            aria-label="Navigation Menu"
                                            title="Navigation Menu"
                                            variant="ghost"
                                            icon={mobileNavIsOpen ? <CloseIcon /> : <HamburgerIcon />}
                                        />
                                    )}
                                </Flex>
                            </Flex>
                        </Flex>
                    </Center>
                </Box>
            </header>
            {showMobileNav && (
                <Box>
                    <Flex
                        direction={'column'}
                        position={'absolute'}
                        w="100vw"
                        overflowY={'scroll'}
                        maxH="100vh"
                        bg="gray.800"
                        alignItems={'center'}
                        experimental_spaceY={4}
                        py="4"
                        pb="48"
                        px="6"
                    >
                        <MobileHeaderMenuItem
                            onNavigate={mobileNavOnClose}
                            href="/profile"
                            description="Update your Twitter profile picture when you go live."
                            imageSrc={headerImages.profile}
                            title="Profile Picture"
                        />

                        <Box>
                            <MobileHeaderMenuItem
                                onNavigate={mobileNavOnClose}
                                href="/banner"
                                description="Update your Twitter profile picture when you go live."
                                imageSrc={headerImages.banner}
                                title="Live Banner"
                            />
                        </Box>
                        <Box>
                            <MobileHeaderMenuItem
                                onNavigate={mobileNavOnClose}
                                href="/name"
                                description="Update your Twitter profile picture when you go live."
                                imageSrc={headerImages.nameChangerDark}
                                title="Name Changer"
                            />
                        </Box>

                        <NextLink href="/pricing">
                            <LinkOverlay onClick={mobileNavOnClose} h="min" w="full" pos={'relative'}>
                                <Card props={{ color: 'white', p: '0', border: 'none', w: 'full', h: 'full', bgGradient: 'linear(to-tr, #9246FF, #2AA9E0)' }}>
                                    <Flex direction={'column'} justifyItems="stretch" h="full" rounded="md" w="full">
                                        <Box p="4" px="6" flexGrow={1} w="full">
                                            <Text fontSize={'2xl'}>Level up with a</Text>
                                            <Heading>PulseBanner Membership.</Heading>
                                            <Text my="4">Choose a plan and begin customizing in seconds. Then experience how PulseBanner can help you grow.</Text>

                                            <HStack>
                                                <Text fontWeight={'bold'} fontSize={'xl'}>
                                                    Learn more
                                                </Text>
                                                <ArrowRightIcon />
                                            </HStack>
                                        </Box>
                                    </Flex>
                                </Card>
                            </LinkOverlay>
                        </NextLink>
                    </Flex>
                </Box>
            )}
            <Promotion />
        </>
    );
}
