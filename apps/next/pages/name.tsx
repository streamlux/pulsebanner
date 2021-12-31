import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { trackEvent } from '@app/util/umami/trackEvent';
import { EditIcon, StarIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Input,
    Link,
    Spacer,
    Stack,
    Text,
    useBoolean,
    useBreakpoint,
    useColorMode,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { TwitterName } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import router from 'next/router';
import { useState } from 'react';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import FakeTweet from 'fake-tweet';
import 'fake-tweet/build/index.css';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { createTwitterClient } from '@app/util/twitter/twitterHelpers';
import { getTwitterInfo } from '@app/util/database/postgresHelpers';
import { format } from 'date-fns';
import { NextSeo } from 'next-seo';
const nameEndpoint = '/api/features/twitterName';
const maxNameLength = 50;
import NextLink from 'next/link';

interface Props {
    twitterName: TwitterName;
    twitterProfile: any;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        console.log('we have a session');
        const twitterName = await prisma.twitterName.findUnique({
            where: {
                userId: session.userId,
            },
        });
        console.log('twtier Name : ', twitterName);

        const twitterInfo = await getTwitterInfo(session.userId, true);
        console.log('twtier: ', twitterInfo);
        const client = createTwitterClient(twitterInfo.oauth_token, twitterInfo.oauth_token_secret);

        const response = await client.accountsAndUsers.accountVerifyCredentials();
        console.log('response: ', response); // not getting here

        const twitterProfile = (
            await client.accountsAndUsers.usersLookup({
                user_id: twitterInfo.providerAccountId,
            })
        )?.[0];

        console.log('twitterProfile: ', twitterProfile);

        if (twitterName) {
            return {
                props: {
                    twitterName,
                    twitterProfile,
                },
            };
        } else {
            if (session.accounts['twitter']) {
                // don't think we need this if check, unless we save the twitter name from the very first time they sign up
                return {
                    props: {
                        twitterName: {},
                        twitterProfile,
                    },
                };
            } else {
                return {
                    props: {
                        twitterName: {},
                        twitterProfile: {},
                    },
                };
            }
        }
    }
    return {
        props: {
            twitterName: {},
            twitterProfile: {},
        },
    };
};

// NOTE: We should potentially allow them to change what it is reverted back to. Would make it easier to handle in the UI and passing it around

export default function Page({ twitterName, twitterProfile }: Props) {
    console.log('heeere');
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/name');

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const defaultMessage = `🔴 Live now | ${twitterProfile.name ?? 'PulseBanner'}`;
    const [streamName, setStreamName] = useState(twitterName.streamName ?? defaultMessage);

    const toast = useToast();

    const [isToggling, { on, off }] = useBoolean(false);

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const getUnsavedName = () => ({
        streamName: `${streamName}`,
    });

    const { colorMode } = useColorMode();
    const breakpoint = useBreakpoint();

    const availableForAccount = (): boolean => {
        if (paymentPlan === 'Free' && !paymentPlanResponse?.partner) {
            return false;
        }
        return true;
    };

    const saveSettings = async () => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const response = await axios.post(nameEndpoint, getUnsavedName());
        }
    };

    const showPricing: (force?: boolean) => boolean = (force?: boolean) => {
        if (!availableForAccount() || force) {
            umami('show-pricing-modal');
            pricingToggle();
            return false;
        }
        return true;
    };

    const refreshData = () => {
        router.replace(router.asPath);
    };

    const toggle = async () => {
        // ensure user is signed up before enabling banner
        if (ensureSignUp()) {
            umami(twitterName && twitterName.enabled ? 'disable-name' : 'enable-name');
            on();
            await saveSettings();
            await axios.put(nameEndpoint);
            refreshData();
            off();
            if (twitterName && twitterName.enabled) {
                // we need to add the disablebanner modal here (breaking off into separate PR as it is not high pri)
            } else {
                toast({
                    title: 'Twitter Name Activated',
                    description: 'Your twitter name will be updated automatically next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
        }
    };

    const config = {
        user: {
            nickname: twitterProfile?.screen_name ?? 'PulseBanner',
            name: streamName,
            avatar: twitterProfile?.profile_image_url_https ?? 'https://pulsebanner.com/favicon.png',
            verified: false,
            locked: false,
        },
        display: colorMode === 'dark' ? 'dim' : 'default',
        text: 'I ❤️ PulseBanner!',
        image: '',
        date: `${format(new Date(), 'MMM d, u')}`,
        app: 'Twitter for iPhone',
        retweets: 6,
        quotedTweets: 0,
        likes: 14,
    };

    const tweetText =
        'I just setup my auto updating Twitter name for #Twitch using @PulseBanner. \r\n\r\nIt adds "🔴 Live now" to my name when I go live, then changes back when my stream ends. Get it for free at pulsebanner.com/name!\n\n#PulseBanner #NameChanger';

    const TweetPreview = (
        <Text fontSize="lg" as="i">
            I just setup my auto updating Twitter name for <Link color="twitter.500">#Twitch</Link> using <Link color="twitter.500">@PulseBanner</Link>. It adds &rdquo;🔴 Live
            now&rdquo; to my name when I go live, then changes back when my stream ends. Get it for free at <Link color="twitter.500">pulsebanner.com</Link>!
            <br />
            <Link color="twitter.500">#PulseBanner</Link>
        </Text>
    );

    const EnableButton = (
        <VStack>
            <Button
                colorScheme={twitterName && twitterName.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={twitterName && twitterName.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-name-button')}
                disabled={twitterName && twitterName.enabled && streaming}
            >
                {twitterName && twitterName.enabled ? 'Turn off Name Changer' : 'Turn on Name Changer'}
            </Button>
            <Heading fontSize="md" w="full" textAlign="center">
                {twitterName && twitterName.enabled ? 'Name Changer is enabled' : 'Name Changer not enabled'}
            </Heading>
        </VStack>
    );

    return (
        <>
            <NextSeo
                title="Twitter Name Changer"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/name',
                    title: 'PulseBanner - Twitter Name Changer',
                    description: 'Easily attract more viewers to your stream from Twitter',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/pulsebanner_name_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner automates your Twitter Name for free.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal callbackUrl="/name" session={session} isOpen={isOpen} onClose={onClose} />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']} pb={2}>
                            Twitter Name Changer
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Your Twitter name will update when you start broadcasting on Twitch. Your name will revert back to your current name when your stream ends.
                        </Heading>

                        <HStack pt={['2', '2']} pb={['2', '0']}>
                            <Text textAlign={['center', 'left']} h="full">
                                Need help? 👉{' '}
                            </Text>
                            <Link isExternal href={discordLink}>
                                <Button as="a" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                    </Box>
                    {EnableButton}
                </Flex>

                <Center pt="4">
                    <Heading as="p" fontSize="lg">
                        Preview your name 👇
                    </Heading>
                </Center>

                <Center w="full" fontSize={[14, 15]}>
                    <Box px={['0', '24']} w="container.sm">
                        <FakeTweet config={config} />
                    </Box>
                </Center>
                <Flex rounded="md" direction="column" w="full">
                    <Center w="full">
                        <Flex grow={1} p="4" mb="8" rounded="md" bg="whiteAlpha.100" direction="column" maxW="container.sm" experimental_spaceY={4}>
                            <HStack w="full">
                                <FormControl id="name">
                                    <FormLabel>Live name</FormLabel>
                                    <HStack>
                                        <Input
                                            w="full"
                                            disabled={!availableForAccount()}
                                            _disabled={{}}
                                            maxLength={maxNameLength}
                                            placeholder="Live name"
                                            defaultValue={streamName}
                                            onChange={(val) => {
                                                const text = val.target.value;
                                                if (text.length >= maxNameLength) {
                                                    return;
                                                }
                                                setStreamName(text);
                                            }}
                                        />
                                        {!availableForAccount() &&
                                            (breakpoint === 'base' ? (
                                                <IconButton
                                                    aria-label="Edit"
                                                    icon={<EditIcon />}
                                                    onClick={() => {
                                                        showPricing();
                                                    }}
                                                />
                                            ) : (
                                                <Button
                                                    aria-label="Edit"
                                                    leftIcon={<EditIcon />}
                                                    onClick={() => {
                                                        trackEvent('click', 'edit-name');
                                                        showPricing();
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            ))}
                                    </HStack>
                                    <FormHelperText>
                                        Your Twitter name will change to this when you go live.{' '}
                                        {!availableForAccount() && ' Become a PulseBanner Member to customize your Twitter Live Name.'}
                                    </FormHelperText>
                                </FormControl>
                            </HStack>
                            <Flex justifyContent="space-between" direction="row">
                                <Spacer />
                                <HStack>
                                    <Button
                                        leftIcon={<StarIcon />}
                                        colorScheme="teal"
                                        variant="ghost"
                                        onClick={() => pricingToggle()}
                                        className={trackEvent('click', 'premium-watermark-button')}
                                    >
                                        Premium
                                    </Button>
                                    <Button my="2" onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
                                        Save settings
                                    </Button>
                                </HStack>
                            </Flex>
                        </Flex>
                    </Center>
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
                        <Text textAlign="center">Like Name Changer? Check out {breakpoint === 'base' ? '👇' : '👉'} </Text>
                        <NextLink passHref href="/banner">
                            <Link color="blue.300" fontWeight="bold" fontSize={['md', 'lg']}>
                                PulseBanner Automatic Twitter Banner ✨
                            </Link>
                        </NextLink>
                    </Stack>
                </Center>
                <Box pt="8">
                    <ShareToTwitter tweetText={tweetText} tweetPreview={TweetPreview} />
                </Box>
            </Container>
        </>
    );
}
