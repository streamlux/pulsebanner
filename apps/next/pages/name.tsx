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
    ColorMode,
    ColorModeContext,
    Container,
    Flex,
    Heading,
    HStack,
    Input,
    Link,
    Spacer,
    Stack,
    Text,
    Textarea,
    useBoolean,
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
import { FaDiscord, FaEdit, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import FakeTweet from 'fake-tweet';
import 'fake-tweet/build/index.css';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';

const nameEndpoint = '/api/features/twitterName';
const maxNameLength = 50;

interface Props {
    twitterName: TwitterName;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = (await getSession({
        ctx: context,
    })) as any;

    if (session) {
        const twitterName = await prisma.twitterName.findUnique({
            where: {
                userId: session.userId,
            },
        });

        if (twitterName) {
            return {
                props: {
                    twitterName,
                },
            };
        } else {
            if (session.accounts['twitter']) {
                // don't think we need this if check, unless we save the twitter name from the very first time they sign up
            } else {
                return {
                    props: {
                        twitterName: {},
                    },
                };
            }
        }
    }
    return {
        props: {
            twitterName: {},
        },
    };
};

// NOTE: We should potentially allow them to change what it is reverted back to. Would make it easier to handle in the UI and passing it around

export default function Page({ twitterName }: Props) {
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const { data: streamingState } = useSWR('streamState', async () => await (await fetch(`/api/twitch/streaming/${session?.user['id']}`)).json());
    const streaming = streamingState ? streamingState.isStreaming : false;

    const defaultMessage = '🔴 Live now | ';
    const [streamName, setStreamName] = useState(twitterName.streamName ?? defaultMessage);

    const toast = useToast();

    const [isToggling, { on, off }] = useBoolean(false);

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const getUnsavedName = () => ({
        streamName: `${streamName}`,
    });

    const { colorMode } = useColorMode();

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

    const PremiumMessage = (
        <VStack>
            <Heading fontSize="xl">Looking to use this feature?</Heading>
            <Text>⭐Unlock today with premium⭐</Text>
            <Button colorScheme="teal" onClick={() => pricingToggle()} className={trackEvent('click', 'premium-watermark-button')}>
                Unlock Now
            </Button>
        </VStack>
    );

    const config = {
        user: {
            nickname: 'PulseBanner',
            name: `${streamName}PulseBanner`,
            avatar: 'https://pulsebanner.com/favicon.png',
            verified: false,
            locked: false,
        },
        display: colorMode === 'dark' ? 'dim' : 'default',
        text: 'Super awesome epic tweet',
        image: '',
        date: '3:32 PM · Feb 14, 2021',
        app: 'Twitter for iPhone',
        retweets: 6,
        quotedTweets: 0,
        likes: 14,
    };

    const tweetText =
        'I just setup my auto updating Twitter name for #Twitch using @PulseBanner. \r\n\r\nIt adds "🔴 Live now" to my name when I go live, then changes back when my stream ends. Get it for free at pulsebanner.com!\n\n#PulseBanner #NameChanger';

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
            <Heading fontSize="lg" w="full" textAlign="center">
                {twitterName && twitterName.enabled ? 'Name Changer is enabled.' : 'Name Changer not enabled.'}
            </Heading>
        </VStack>
    );

    return (
        <>
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} />
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
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                    </Box>
                    {EnableButton}
                </Flex>
                <Center w="full" pt="4">
                    <FakeTweet config={config} />
                </Center>
                <Flex rounded="md" direction="column">
                    <Flex grow={1} p="4" my="4" mb="8" rounded="md" bg="whiteAlpha.100" w="full" direction="column" maxW="container.md">
                        {/* {availableForAccount() ? <></> : PremiumMessage} */}

                        <Flex justifyContent="space-between" direction={['column', 'row']} experimental_spaceY={[4, 0]} experimental_spaceX={[0, 4]}>
                            <Box>
                                <HStack w="full">
                                    <Input
                                        w="fit-content"
                                        disabled
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
                                    <Button
                                        leftIcon={<EditIcon />}
                                        onClick={() => {
                                            if (showPricing()) {
                                                //
                                            }
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </HStack>
                            </Box>
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
                                <Button
                                    my="2"
                                    onClick={() => {
                                        if (showPricing()) {
                                            saveSettings();
                                        }
                                    }}
                                    className={trackEvent('click', 'save-settings-button')}
                                >
                                    Save settings
                                </Button>
                            </HStack>
                        </Flex>
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
                <Box pt="8">
                    <ShareToTwitter tweetText={tweetText} tweetPreview={TweetPreview} />
                </Box>
            </Container>
        </>
    );
}
