import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { trackEvent } from '@app/util/umami/trackEvent';
import { Button, Heading, useBoolean, useBreakpoint, HStack, Flex, Box, useDisclosure, Text, useToast, VStack, Link, Container, Center, Stack, Spacer } from '@chakra-ui/react';
import { ProfileImage } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import router from 'next/router';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import NextLink from 'next/link';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { RemotionProfilePreview } from '@pulsebanner/remotion/preview';
import { Composer } from '@pulsebanner/remotion/components';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { useState } from 'react';

interface Props {
    profilePic: ProfileImage;
}

const profileEndpoint = '/api/features/profileImage';
const defaultForeground: keyof typeof ForegroundTemplates = 'ProfilePic';
const defaultBackground: keyof typeof BackgroundTemplates = 'ColorBackground';

// these types are ids of foregrounds or backgrounds
type Foreground = keyof typeof ForegroundTemplates;
type Background = keyof typeof BackgroundTemplates;

interface ProfilePicSettings {
    foregroundId: Foreground;
    backgroundId: Background;
    foregroundProps: any;
    backgroundProps: any;
}

const defaultProfilePicSettings: ProfilePicSettings = {
    foregroundId: defaultForeground,
    backgroundId: defaultBackground,
    foregroundProps: ForegroundTemplates[defaultForeground].defaultProps,
    backgroundProps: BackgroundTemplates[defaultBackground].defaultProps,
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const profilePic = await prisma.profileImage.findUnique({
            where: {
                userId: session.userId,
            },
        });

        if (profilePic) {
            return {
                props: {
                    profilePic,
                },
            };
        }
    }
    return {
        props: {
            profilePic: {},
        },
    };
};

export default function Page({ profilePic }: Props) {
    // this feature is paid only...we should lock down entire page
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>(defaultBackground);
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>((profilePic?.foregroundId as Foreground) ?? defaultForeground);
    const [bgProps, setBgProps] = useState({ color: 'transparent' });
    const [fgProps, setFgProps] = useState(profilePic?.foregroundProps ?? (ForegroundTemplates[defaultForeground].defaultProps as any));

    const BackgroundTemplate = BackgroundTemplates[bgId];
    const ForegroundTemplate = ForegroundTemplates[fgId];
    const Form = BackgroundTemplate.form;
    const FgForm = ForegroundTemplate.form;

    const toast = useToast();
    const breakpoint = useBreakpoint();

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const [isToggling, { on, off }] = useBoolean(false);

    // property ideas: border color, background color
    const getUnsavedProfilePic = () => ({
        foregroundId: fgId,
        backgroundId: bgId,
        backgroundProps: { ...BackgroundTemplate.defaultProps, ...bgProps },
        foregroundProps: { ...ForegroundTemplate.defaultProps, ...fgProps },
    });

    const saveSettings = async () => {
        if (ensureSignUp()) {
            const response = await axios.post(profileEndpoint, getUnsavedProfilePic());
        }
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const toggle = async () => {
        if (ensureSignUp()) {
            umami(profilePic && profilePic.enabled ? 'disable-profile' : 'enable-profile');
            on();
            await saveSettings();
            await axios.put(profileEndpoint);
            refreshData();
            off();
            if (profilePic && profilePic.enabled) {
                // profilePicDisabledToggle();
            } else {
                toast({
                    title: 'Profile Picture Activated',
                    description: 'Your profile picture will be updated automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    };

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();
    // const { isOpen: disableProfilePicIsOpen, onClose: disableProfilePicOnClose, onToggle: profilePicDisabledToggle } = useDisclosure();

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
                colorScheme={profilePic && profilePic.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={profilePic && profilePic.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-profile-button')}
                disabled={profilePic && profilePic.enabled && streaming}
            >
                {profilePic && profilePic.enabled ? 'Turn off live profile' : 'Turn on live profile'}
            </Button>
            <Heading fontSize="md" w="full" textAlign="center">
                {profilePic && profilePic.enabled ? 'Your profile is enabled' : 'Live profile not enabled'}
            </Heading>
        </VStack>
    );

    const tweetText = 'I just setup my auto updating Twitter banner for #Twitch using @PulseBanner. Get it for free at pulsebanner.com!\n\n#PulseBanner';

    const TweetPreview = (
        <Text fontSize="lg" as="i">
            I just setup my auto updating Twitter profile picture for <Link color="twitter.500">#Twitch</Link> using <Link color="twitter.500">@PulseBanner</Link>. Get it at{' '}
            <Link color="twitter.500">pulsebanner.com</Link>!
            <br />
            <Link color="twitter.500">#PulseBanner</Link>
        </Text>
    );

    return (
        <>
            <NextSeo
                title="Twitter Live Profile Picture for Twitch"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/profile',
                    title: 'PulseBanner - Twitter Live Profile Picture for Twitch',
                    description: 'Easily attract more viewers to your stream from Twitter',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner automates your Twitter profile picture.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']} pb={[0, 2]}>
                            Twitch Profile Picture
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Your Twitter profile picture will update when you start broadcasting on Twitch. Your profile picture will revert back to your current profile image when
                            your stream ends.
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
                    <Center>
                        <Box w="30%" minW="150px">
                            <RemotionProfilePreview compositionHeight={400} compositionWidth={400}>
                                {' '}
                                {/* Change this to be something different dimensions */}
                                <Composer
                                    {...{
                                        backgroundId: bgId,
                                        foregroundId: fgId,
                                        backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                        foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps },
                                    }}
                                />
                            </RemotionProfilePreview>
                        </Box>
                    </Center>

                    <Center>
                        <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="fit-content" direction="column">
                            <FgForm
                                setProps={(s) => {
                                    console.log('set props', s);
                                    setFgProps(s);
                                }}
                                props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }}
                                showPricing={showPricing}
                                accountLevel={paymentPlan}
                            />
                            <Flex justifyContent="space-between" direction={['column', 'row']}>
                                <Spacer />
                                <HStack>
                                    <Button my="2" onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
                                        Save settings
                                    </Button>
                                </HStack>
                            </Flex>
                        </Flex>
                    </Center>
                </Flex>

                <Center>
                    <Stack direction={['column', 'row']}>
                        <Text textAlign="center">Like Live Profile? Check out {breakpoint === 'base' ? '👇' : '👉'} </Text>
                        <NextLink passHref href="/banner">
                            <Link color="blue.300" fontWeight="bold" fontSize={['md', 'lg']}>
                                PulseBanner Twitter Live Banner ✨
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
