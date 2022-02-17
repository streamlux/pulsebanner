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
    Fade,
    Spacer,
    Tag,
    Stack,
    useOutsideClick,
    Popover,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    SimpleGrid,
    VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import React, { Ref, useRef } from 'react';
import { ChevronDownIcon, EditIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAdmin } from '../util/hooks/useAdmin';
import favicon from '@app/public/logo.webp';
import { FaArrowRight, FaDiscord, FaPersonBooth, FaRegImage, FaTwitter, FaUserCircle, FaUserTag } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { NewsletterModal } from './newsletter/NewsletterModal';
import { trackEvent } from '@app/util/umami/trackEvent';
import { holidayDecor, promo, promoCode } from '@app/util/constants';
import { landingPageAsset } from '@app/pages';
import { HeaderMenuItem } from './header/HeaderMenuItem';
import nameChangerLogo from '@app/public/header/namechanger.png';
import headerBanner from '@app/public/header/header_banner.png';
import headerProfile from '@app/public/header/header_profile.png';

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header({ headerPortalRef }: { headerPortalRef: React.MutableRefObject<any> }) {
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
                gridColumns: 2,
                gridSpacing: 6,
            },
            lg: {
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
    const { isOpen: featuresOpen, onClose: onFeaturesClose, onToggle: onFeaturesToggle, onOpen: onFeaturesOpen } = useDisclosure();
    const featuresRef = useRef();

    const firstFieldRef = React.useRef<HTMLDivElement>(null);

    return (
        <>
            <NewsletterModal isOpen={isOpen} onClose={onClose} />
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
                            w={['full', 'full', 'full', 'full', '70vw']}
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
                                {!breakpointValue.mobile && (
                                    <Center id="nav-links" fontSize="lg">
                                        <Wrap spacing={['2', '4', '6', '6']}>
                                            <Menu>
                                                <MenuButton size="md" as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                                                    Features
                                                </MenuButton>
                                                <Portal containerRef={headerPortalRef}>
                                                    <MenuList flexDirection={'row'} h="auto" mx="8" maxW="90vw">
                                                        <SimpleGrid columns={[1, 2, 3]} spacing={[0, 4]} p="4">
                                                            <HeaderMenuItem
                                                                href="/profile"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={typeof headerProfile === 'string' ? headerProfile : headerProfile.src}
                                                                title="Profile Picture"
                                                            />
                                                            <HeaderMenuItem
                                                                href="/banner"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={typeof headerBanner === 'string' ? headerBanner : headerBanner.src}
                                                                title="Live Banner"
                                                            />
                                                            <HeaderMenuItem
                                                                href="/name"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={typeof nameChangerLogo === 'string' ? nameChangerLogo : nameChangerLogo.src}
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
                                )}

                                <Spacer />
                                <Flex experimental_spaceX="2" alignItems="center" justifySelf="flex-end">
                                    {/* {breakpointValue.mobile && (
                                    <IconButton
                                        size="sm"
                                        onClick={() => onToggle()}
                                        aria-label="Newsletter"
                                        title="Newsletter"
                                        icon={<MdEmail />}
                                        className={trackEvent('click', 'newsletter-button')}
                                    />
                                )}
                                {!breakpointValue.mobile && (
                                    <Button onClick={() => onToggle()} leftIcon={<MdEmail />} className={trackEvent('click', 'newsletter-button')}>
                                        Subscribe for updates
                                    </Button>
                                )} */}
                                    {breakpointValue.mobile && (
                                        <IconButton
                                            size="sm"
                                            onClick={() => window.open('/discord', '_blank')}
                                            aria-label="Discord"
                                            title="Discord"
                                            icon={<FaDiscord />}
                                            className={trackEvent('click', 'discord-button')}
                                        />
                                    )}
                                    {!breakpointValue.mobile && (
                                        <Button onClick={() => window.open('/discord', '_blank')} leftIcon={<FaDiscord />} className={trackEvent('click', 'discord-button')}>
                                            Join our Discord
                                        </Button>
                                    )}

                                    <IconButton
                                        size={breakpoint === 'base' ? 'sm' : 'md'}
                                        aria-label="Toggle theme"
                                        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                                        onClick={toggleColorMode}
                                        className={trackEvent('click', 'color-theme-button')}
                                    >
                                        Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                                    </IconButton>

                                    {!session && (
                                        <Button
                                            as={Link}
                                            href={`/api/auth/signin`}
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
                                    )}
                                    {session && (
                                        <Menu>
                                            <Avatar as={MenuButton} name={session.user.name} src={session.user.image} />
                                            <Portal>
                                                <MenuList>
                                                    <NextLink href="/account" passHref>
                                                        <MenuItem>Account</MenuItem>
                                                    </NextLink>
                                                    <MenuItem onClick={() => signOut({ redirect: false })}>Sign out</MenuItem>
                                                    {isAdmin && (
                                                        <NextLink href="/admin" passHref>
                                                            <MenuItem>Admin</MenuItem>
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
            {breakpointValue.mobile && (
                <Center id="nav-links" fontSize="lg">
                    <Wrap spacing={['2', '4', '8', '10']}>
                        <Menu autoSelect={false}>
                            <MenuButton size="sm" as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                                Features
                            </MenuButton>
                            <Portal containerRef={headerPortalRef}>
                                <MenuList flexDirection={'row'} h="auto" mx="8" maxW="90vw">
                                    <SimpleGrid columns={[1, 2, 3]} spacing={[0, 4]} p="4">
                                    <HeaderMenuItem
                                                                href="/profile"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={landingPageAsset('profileimage')}
                                                                title="Profile Picture"
                                                            />
                                                            <HeaderMenuItem
                                                                href="/banner"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={typeof headerBanner === 'string' ? headerBanner : headerBanner.src}
                                                                title="Live Banner"
                                                            />
                                                            <HeaderMenuItem
                                                                href="/name"
                                                                colorMode={colorMode}
                                                                description="Update your Twitter profile picture when you go live."
                                                                imageSrc={typeof nameChangerLogo === 'string' ? nameChangerLogo : nameChangerLogo.src}
                                                                title="Name Changer"
                                                            />
                                    </SimpleGrid>
                                </MenuList>
                            </Portal>
                        </Menu>

                        <NextLink href="/pricing" passHref>
                            <Button as="a" size="sm" variant={'ghost'}>
                                Pricing
                            </Button>
                        </NextLink>
                    </Wrap>
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
