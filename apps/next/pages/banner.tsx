import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Select,
    Spacer,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useBreakpoint,
    Text,
    useDisclosure,
    VStack,
    Link,
    useToast,
    Stack,
    BoxProps,
    useColorModeValue,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { trackEvent } from '@app/util/umami/trackEvent';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { DisableBannerModal } from '@app/components/banner/DisableBannerModal';
import { getSession, useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { Banner } from '@prisma/client';
import prisma from '@app/util/ssr/prisma';
import { localAxios } from '@app/util/axios';
import router from 'next/router';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { Composer } from '@pulsebanner/remotion/components';
import { NextSeo } from 'next-seo';
import NextLink from 'next/link';
import { ReconnectTwitterModal } from '@app/modules/onboard/ReconnectTwitterModal';

const bannerEndpoint = '/api/features/banner';
const defaultForeground: keyof typeof ForegroundTemplates = 'ImLive';
const defaultBackground: keyof typeof BackgroundTemplates = 'GradientBackground';

// these types are ids of foregrounds or backgrounds
type Foreground = keyof typeof ForegroundTemplates;
type Background = keyof typeof BackgroundTemplates;

interface BannerSettings {
    foregroundId: Foreground;
    backgroundId: Background;
    foregroundProps: any;
    backgroundProps: any;
}

export const defaultBannerSettings: BannerSettings = {
    foregroundId: defaultForeground,
    backgroundId: defaultBackground,
    foregroundProps: ForegroundTemplates[defaultForeground].defaultProps,
    backgroundProps: BackgroundTemplates[defaultBackground].defaultProps,
};

interface Props {
    banner: Banner;
    reAuthRequired?: boolean;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const banner = await prisma.banner.findUnique({
            where: {
                userId: session.userId,
            },
        });

        if (banner) {
            if ((banner.foregroundProps as any).username === 'Username Here!') {
                const usernameInfo = await localAxios.get(`/api/twitch/username/${session.userId as string}`);
                const username = usernameInfo.data.displayName;
                await prisma.banner.update({
                    where: {
                        userId: session.userId,
                    },
                    data: {
                        foregroundProps: {
                            ...(banner.foregroundProps as any),
                            username,
                        },
                    },
                });
                return {
                    props: {
                        banner: {
                            ...defaultBannerSettings,
                            foregroundProps: {
                                ...defaultBannerSettings.foregroundProps,
                                username,
                            },
                        },
                    },
                };
            }
            return {
                props: {
                    banner,
                },
            };
        } else {
            // if they have their twitch account connected, but dont have a banner yet
            if (session.accounts['twitch']) {
                // fetch twitch username, and save a banner for them (this code should run only once for every user after they sign up)
                const usernameInfo = await localAxios.get(`/api/twitch/username/${session.userId as string}`);
                const username = usernameInfo.data.displayName;
                return {
                    props: {
                        banner: {
                            ...defaultBannerSettings,
                            foregroundProps: {
                                ...defaultBannerSettings.foregroundProps,
                                username,
                            },
                        },
                    },
                };
            } else {
                // if they need to still connect their twitch account
                return {
                    props: {
                        banner: {},
                    },
                };
            }
        }
    }
    // if they are not logged in
    return {
        props: {
            banner: {},
        },
    };
};

export default function Page({ banner }: Props) {
    const { data: sessionInfo } = useSession();

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>((banner?.backgroundId as Background) ?? defaultBackground);
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>((banner?.foregroundId as Foreground) ?? defaultForeground);
    const [bgProps, setBgProps] = useState(banner.backgroundProps ?? (BackgroundTemplates[defaultBackground].defaultProps as any));
    const [fgProps, setFgProps] = useState(banner.foregroundProps ?? (ForegroundTemplates[defaultForeground].defaultProps as any));
    const [reAuth, setReAuth] = useState(false);

    const BackgroundTemplate = BackgroundTemplates[bgId];
    const ForegroundTemplate = ForegroundTemplates[fgId];
    const Form = BackgroundTemplate.form;
    const FgForm = ForegroundTemplate.form;

    const toast = useToast();
    const breakpoint = useBreakpoint();

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const styles: BoxProps = useColorModeValue<BoxProps>(
        {
            border: '1px solid',
            borderColor: 'gray.300',
        },
        {
            background: 'whiteAlpha.100',
        }
    );

    const [isToggling, { on, off }] = useBoolean(false);

    useEffect(() => {
        axios.post('/').then(() => {
            console.log('attempt to clear 301 redirect from cache');
        });
    }, []);

    const getUnsavedBanner = () => ({
        foregroundId: fgId,
        backgroundId: bgId,
        backgroundProps: { ...BackgroundTemplate.defaultProps, ...bgProps },
        foregroundProps: { ...ForegroundTemplate.defaultProps, ...fgProps },
    });

    const saveSettings = async () => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const response = await axios.post(bannerEndpoint, getUnsavedBanner());
            if (response.data === 401) {
                setReAuth(true);
            }
        }
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const toggle = async () => {
        // ensure user is signed up before enabling banner
        if (ensureSignUp()) {
            umami(banner && banner.enabled ? 'disable-banner' : 'enable-banner');
            on();
            await saveSettings();
            const response = await axios.put(bannerEndpoint);
            if (response.data === 401) {
                setReAuth(true);
                refreshData();
                off();
                return;
            }
            refreshData();
            off();
            if (banner && banner.enabled) {
                bannerDisabledToggle();
            } else {
                toast({
                    title: 'Banner Activated',
                    description: 'Your banner will be updated automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    };

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();
    const { isOpen: disableBannerIsOpen, onClose: disableBannerOnClose, onToggle: bannerDisabledToggle } = useDisclosure();

    const showPricing: (force?: boolean) => boolean = (force?: boolean) => {
        if (force) {
            umami('show-pricing-modal');
            pricingToggle();
            return false;
        }
        return true;
    };

    const EnableButton = (
        <VStack>
            <Button
                colorScheme={banner && banner.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={banner && banner.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-banner-button')}
                disabled={banner && banner.enabled && streaming}
            >
                {banner && banner.enabled ? 'Turn off live banner' : 'Turn on live banner'}
            </Button>
            <Heading fontSize="md" w="full" textAlign="center">
                {banner && banner.enabled ? 'Your banner is enabled' : 'Live banner not enabled'}
            </Heading>
        </VStack>
    );

    const tweetText = 'I just setup my auto updating Twitter banner for #Twitch using @PulseBanner. Get it for free at pulsebanner.com!\n\n#PulseBanner';

    const TweetPreview = (
        <Text fontSize="lg" as="i">
            I just setup my auto updating Twitter banner for <Link color="twitter.500">#Twitch</Link> using <Link color="twitter.500">@PulseBanner</Link>. Get it for free at{' '}
            <Link color="twitter.500">pulsebanner.com</Link>!
            <br />
            <Link color="twitter.500">#PulseBanner</Link>
        </Text>
    );

    return (
        <>
            <NextSeo
                title="Twitter Live Banner for Twitch"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/banner',
                    title: 'PulseBanner - Twitter Live Banner for Twitch',
                    description: 'Easily attract more viewers to your stream from Twitter',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner automates your Twitter banner for free.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            {/* <Modal isOpen={fgId === 'Emgg'} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Custom Banner</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>You are currently using the EMGG Live Banner. To use a custom banner. Click Use Custom Banner to customize your own banner.</Text>
                        <Button>Use Custom Banner</Button>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            onClick={() => {
                                onClose();
                                setBgId('GradientBackground');
                                setFgId('ImLive');
                            }}
                        >
                            Use Custom Banner
                        </Button>
                        <NextLink passHref href="/emgg">
                            <Button as="a" variant="ghost">
                                Keep using EMGG Banner
                            </Button>
                        </NextLink>
                    </ModalFooter>
                </ModalContent>
            </Modal> */}
            <DisableBannerModal isOpen={disableBannerIsOpen} onClose={disableBannerOnClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} />
            {reAuth ? <ReconnectTwitterModal session={session} isOpen={isOpen} onClose={onClose} /> : <></>}
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']} pb={[0, 2]}>
                            Twitch Live Banner
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Your Twitter banner will update when you start broadcasting on Twitch. Your banner will revert back to your current banner image when your stream ends.
                        </Heading>

                        <HStack pt={['2', '2']} pb={['2', '0']}>
                            <Text textAlign={['center', 'left']} h="full">
                                Need help? 👉{' '}
                            </Text>
                            <Link isExternal href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                    </Box>
                    {EnableButton}
                </Flex>
                <Flex w="full" rounded="md" direction="column">
                    <Center w="full" maxH="320px">
                        <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                            <Composer
                                {...{
                                    backgroundId: bgId,
                                    foregroundId: fgId,
                                    backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                    foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps },
                                }}
                            />
                        </RemotionPreview>
                    </Center>

                    <Flex {...styles} grow={1} p="4" my="4" rounded="md" w="full" direction="column" minH="lg">
                        {fgId === 'Emgg' && (
                            <Box>
                                <Text>You are currently using the EMGG Live Banner. Click Use Custom Banner to customize your own banner.</Text>
                                <Button
                                    onClick={() => {
                                        setBgId('GradientBackground');
                                        setFgId('ImLive');
                                    }}
                                >
                                    Use Custom Banner
                                </Button>
                            </Box>
                        )}

                        {fgId !== 'Emgg' && (
                            <Tabs colorScheme="purple" flexGrow={1}>
                                <TabList>
                                    <Tab className={trackEvent('click', 'banner-tab')}>Banner</Tab>
                                    <Tab className={trackEvent('click', 'background-tab')}>Background</Tab>
                                </TabList>

                                <TabPanels flexGrow={1}>
                                    <TabPanel>
                                        <FgForm
                                            setProps={(s) => {
                                                console.log('set props', s);
                                                setFgProps(s);
                                            }}
                                            props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }}
                                            showPricing={showPricing}
                                            accountLevel={paymentPlan}
                                        />
                                    </TabPanel>
                                    <TabPanel>
                                        <FormControl id="country">
                                            <FormLabel>Background type</FormLabel>
                                            <Select
                                                value={bgId}
                                                w="fit-content"
                                                onChange={(e) => {
                                                    setBgId(e.target.value as keyof typeof BackgroundTemplates);
                                                }}
                                            >
                                                {Object.entries(BackgroundTemplates).map(([key, value]) => (
                                                    <option key={key} value={key}>
                                                        {value.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Box py="4">
                                            <Form
                                                setProps={(p) => {
                                                    setBgProps({ ...BackgroundTemplates[bgId].defaultProps, ...p });
                                                }}
                                                props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }}
                                                showPricing={showPricing}
                                                accountLevel={paymentPlan}
                                            />
                                        </Box>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        )}

                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <HStack>
                                <Button my="2" onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
                                    Save settings
                                </Button>
                            </HStack>
                        </Flex>
                    </Flex>
                    <Flex w="full" flexDirection={['column-reverse', 'row']} justifyContent="space-between">
                        <HStack pt={['2', '2']} pb={['2', '0']} h="full">
                            <Text textAlign={['center', 'left']} h="full">
                                Have feedback? 👉{' '}
                            </Text>
                            <Link isExternal href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                        {EnableButton}
                    </Flex>
                </Flex>
                <Center>
                    <Stack direction={['column', 'row']}>
                        <Text textAlign="center">Like Live Banner? Check out {breakpoint === 'base' ? '👇' : '👉'} </Text>
                        <NextLink passHref href="/name">
                            <Link color="blue.300" fontWeight="bold" fontSize={['md', 'lg']}>
                                PulseBanner Twitter Name Changer ✨
                            </Link>
                        </NextLink>
                    </Stack>
                </Center>
                <Box pt="8">
                    <ShareToTwitter tweetText={tweetText} tweetPreview={TweetPreview} />
                </Box>
            </Container>
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}
