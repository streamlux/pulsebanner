import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Heading,
    HStack,
    Spacer,
    useBoolean,
    useBreakpoint,
    Text,
    useDisclosure,
    VStack,
    Link,
    useToast,
    Stack,
    Image,
    BoxProps,
    useColorMode,
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
import { discordLink, emggLogoSrc } from '@app/util/constants';
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
import { CheckIcon } from '@chakra-ui/icons';
import { emggBannerSettings } from './banner';

const bannerEndpoint = '/api/features/banner';
const defaultForeground: keyof typeof ForegroundTemplates = 'Emgg';
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

const defaultBannerSettings: BannerSettings = {
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
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === 'dark') return;
        toggleColorMode();
    });
    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const bgId = 'ImageBackground';
    const fgId = 'Emgg';
    const bgProps = emggBannerSettings.backgroundProps;
    const [fgProps, setFgProps] = useState(banner.foregroundProps ?? (ForegroundTemplates[defaultForeground].defaultProps as any));
    const [reAuth, setReAuth] = useState(false);

    const BackgroundTemplate = BackgroundTemplates[bgId];
    const ForegroundTemplate = ForegroundTemplates[fgId];

    const toast = useToast();
    const breakpoint = useBreakpoint();

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/emgg');

    const styles: BoxProps = {
        background: 'whiteAlpha.100',
    };

    const [isToggling, { on, off }] = useBoolean(false);

    const getUnsavedBanner: () => BannerSettings = () => ({
        foregroundId: fgId,
        backgroundId: bgId,
        backgroundProps: { ...BackgroundTemplate.defaultProps, ...bgProps },
        foregroundProps: { ...ForegroundTemplate.defaultProps, ...fgProps },
    });

    const saveEmggBanner: () => Promise<void> = async (): Promise<void> => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const bannerSettings: BannerSettings = {
                ...emggBannerSettings,
                foregroundProps: {
                    ...(banner.foregroundProps as any),
                },
            };

            const response = await axios.post(bannerEndpoint, bannerSettings);
            refreshData();
            if (response.data === 401) {
                setReAuth(true);
            }
        }
    };

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
            await saveEmggBanner();
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
                    title: 'Live Banner Enabled',
                    description: 'Your banner will update automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    };

    const FgForm = ForegroundTemplate.form;

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
                colorScheme={banner && banner.enabled ? 'pink' : 'green'}
                bg={banner && banner.enabled ? '#DC0963' : 'green.200'}
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

    const tweetText = 'I just setup my auto updating @PulseBanner x @EasternMediaGG Twitter banner for #Twitch. Get it for free at pulsebanner.com/emgg!\n\n#PulseBanner';

    const TweetPreview = (
        <Text fontSize="lg" as="i">
            I just setup my auto updating <Link color="twitter.500">@PulseBanner</Link> x <Link color="twitter.500">@EasternMediaGG</Link> Twitter banner for{' '}
            <Link color="twitter.500">#Twitch</Link>. Get it for free at <Link color="twitter.500">pulsebanner.com/emgg</Link>!
            <br />
            <Link color="twitter.500">#PulseBanner</Link>
        </Text>
    );

    return (
        <>
            <NextSeo
                title="Twitter Live Banner for Twitch"
                noindex
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/emgg',
                    title: 'PulseBanner - EMGG Special Edition Live Banner',
                    description: 'Rep your favorite org with this special edition Live Banner',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/emgg_og.webp',
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
            <DisableBannerModal isOpen={disableBannerIsOpen} onClose={disableBannerOnClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/emgg" />
            {reAuth && <ReconnectTwitterModal session={session} isOpen={isOpen} onClose={onClose} />}
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" rounded="md" direction="column" bg="gray.800" p="4">
                    <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                        <Box maxW="xl" experimental_spaceY={2}>
                            <HStack>
                                <Image height="12" src={emggLogoSrc} alt="EMGG logo" />
                                <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']} pb={[0, 2]}>
                                    EMGG Live Banner
                                </Heading>
                            </HStack>
                            <Heading fontSize="md" fontWeight="normal" as="h2">
                                Your Twitter banner will update when you start broadcasting on Twitch. Your banner will revert back to your current banner image when your stream
                                ends.
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
                    <Box p="4">
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
                    </Box>

                    <Flex {...styles} grow={1} p="4" my="4" rounded="md" w="full" direction="column">
                        <Flex experimental_spaceX={2} direction={['column', 'row']}>
                            <Text fontSize={['sm', 'md']}>This banner type cannot be customized.</Text>
                            <NextLink passHref href="/banner">
                                <Button as="a" variant="link">
                                    Create Custom Banner
                                </Button>
                            </NextLink>
                        </Flex>
                        <FgForm props={fgProps} setProps={setFgProps} showPricing={showPricing} accountLevel={paymentPlan} />
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <HStack>
                                {banner.enabled && banner.foregroundId === 'Emgg' && (
                                    <Text>
                                        <CheckIcon color="green.300" /> You are currently using the EMGG banner.{' '}
                                    </Text>
                                )}
                                {banner.enabled && banner.foregroundId !== 'Emgg' && <Text>Your banner is already enabled, click Save settings to use the EMGG banner. 👉</Text>}
                                <Button my="2" onClick={saveEmggBanner} className={trackEvent('click', 'save-settings-button')}>
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
                    <Center>
                        <Stack direction={['column', 'row']}>
                            <Text textAlign="center">Like Live Banner? Check out {breakpoint === 'base' ? '👇' : '👉'} </Text>
                            <NextLink passHref href="/profile">
                                <Button as="a" variant="link" color="blue.300" fontWeight="bold" fontSize={['md', 'lg']}>
                                    Twitter Live Profile Picture ✨
                                </Button>
                            </NextLink>
                        </Stack>
                    </Center>
                </Flex>

                <Box pt="8">
                    <ShareToTwitter tweetText={tweetText} tweetPreview={TweetPreview} />
                </Box>
            </Container>
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}
