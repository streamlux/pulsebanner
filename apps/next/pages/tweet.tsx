import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Link,
    Progress,
    Spacer,
    Stack,
    Tag,
    Text,
    Textarea,
    useBoolean,
    useToast,
    VStack,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import { discordLink } from '@app/util/constants';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import { TwitchTweet } from '.prisma/client';
import { trackEvent } from '@app/util/umami/trackEvent';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';

const tweetEndpoint = '/api/features/tweet';
const maxTweetLength = 280;

const Page: NextPage = () => {
    const { data, mutate } = useSWR<TwitchTweet>('tweet', async () => (await fetch(tweetEndpoint)).json());

    const [streamLink, setStreamLink] = useState(data?.streamUrl ?? '');

    const defaultTweetMessage = `Come join me on Twitch! I am live!`;
    const [tweetText, setTweetText] = useState(data?.tweetInfo ?? defaultTweetMessage);
    const remainingChars = maxTweetLength - tweetText.length;

    const sessionInfo = useSession();
    const userId = sessionInfo.data?.userId;

    const toast = useToast();
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('tweet');
    const [isToggling, { on, off }] = useBoolean(false);

    const [urlSelected, setUrlSelected] = useState(data?.streamUrl ? true : false);

    const saveSettings = async () => {
        if (ensureSignUp()) {
            const response = await axios.post(tweetEndpoint, {
                tweetInfo: tweetText,
                streamUrl: streamLink,
            });
            mutate();
        }
    };

    const getStreamLink = async () => {
        if (!ensureSignUp()) {
            console.log('sign into twitch');
            return;
        }
        // if we already have the stream link we do not need to make the api request
        if (streamLink !== '' && userId !== undefined) {
            return;
        }

        const response = await axios.get(`/api/twitch/username/${userId}`);
        if (response.data.login) {
            setStreamLink(`twitch.tv/${response.data.login}`);
        }
    };

    const toggle = async () => {
        // ensure user is signed up before enabling tweet
        if (ensureSignUp()) {
            umami(data && data.enabled ? 'disable-tweet' : 'enable-tweet');
            on();
            await saveSettings();
            await axios.put(tweetEndpoint);
            off();
            if (data && data.enabled) {
                console.log('tweet feature disabled');
            } else {
                toast({
                    title: 'Automated Tweet Activated',
                    description: 'You will automatically tweet next time you stream!',
                    status: 'success',
                    duration: 7000,
                    isClosable: true,
                    position: 'top',
                });
            }
            mutate({
                ...data,
                enabled: data === undefined ? false : !data.enabled,
            });
        }
    };

    const TwitchLinkComponent = () => {
        if (streamLink === '' || urlSelected === false) {
            return <></>;
        }
        return (
            <>
                <Link color="twitter.500">{streamLink}</Link>{' '}
            </>
        );
    };

    const EnableButton = (
        <VStack>
            <Button
                colorScheme={data && data.enabled ? 'red' : 'green'}
                justifySelf="flex-end"
                isLoading={isToggling}
                leftIcon={data && data.enabled ? <FaStop /> : <FaPlay />}
                px="8"
                onClick={toggle}
                className={trackEvent('click', 'toggle-tweet-button')}
            >
                {data && data.enabled ? 'Turn off live tweet' : 'Turn on live tweet'}
            </Button>
            <Heading fontSize="lg" w="full" textAlign="center">
                {data && data.enabled ? 'Your tweet is enabled.' : 'Live tweet not enabled.'}
            </Heading>
        </VStack>
    );

    return (
        <>
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} currentPage="tweet" />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="2xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']}>
                            Automated Tweets
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            You can now automatically send a tweet when you go live on Twitch! Enable now!
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
                    <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full" direction="column" minH="sm">
                        <Stack direction={['column', 'row']} w="full" spacing={6}>
                            <VStack minW="50%">
                                <HStack w="full">
                                    <Heading fontSize="lg">Tweet message</Heading>
                                </HStack>
                                <Textarea
                                    minH="32"
                                    resize="none"
                                    maxLength={280}
                                    placeholder="Tweet message here"
                                    defaultValue={tweetText}
                                    onChange={(val) => {
                                        const text = val.target.value;
                                        if (text.length >= maxTweetLength) {
                                            return;
                                        }
                                        setTweetText(val.target.value);
                                    }}
                                />
                            </VStack>

                            <VStack minW={['full', '50%']}>
                                <Heading as="p" w="full" fontSize="lg">
                                    Preview
                                </Heading>
                                <Box maxW="full" minH="32" h="full" p="3" border="1px" borderColor="gray.200" rounded="md" w="full" textAlign="center">
                                    <Text as="i">
                                        {`${tweetText}`}
                                        <br /> <TwitchLinkComponent />
                                    </Text>
                                </Box>
                            </VStack>
                        </Stack>
                        <Text w="full" textAlign="left">{`${remainingChars} characters left`}</Text>

                        <Box w="full" experimental_spaceY={2}>
                            <Wrap align={'start'} spacing={[-2, 8]}>
                                <WrapItem>
                                    <Checkbox
                                        p="2"
                                        colorScheme="purple"
                                        isDisabled={false}
                                        checked={urlSelected}
                                        onChange={async (e) => {
                                            e.preventDefault();
                                            setUrlSelected(!urlSelected);
                                            await getStreamLink();
                                        }}
                                        size="lg"
                                    >
                                        <Wrap spacing={[0, 4]}>
                                            <WrapItem>
                                                <Text>Include stream link</Text>
                                            </WrapItem>
                                            <WrapItem>
                                                <Text as="i">({streamLink})</Text>
                                            </WrapItem>
                                        </Wrap>
                                    </Checkbox>
                                </WrapItem>
                                <WrapItem>
                                    <HStack spacing={0}>
                                        <Checkbox isDisabled p="2" colorScheme="purple" checked={false} size="lg">
                                            {' '}
                                            {/* Make this not a checkbox */}
                                            Post Image
                                        </Checkbox>
                                        <Tag colorScheme="cyan">Coming Soon!</Tag>
                                    </HStack>
                                </WrapItem>
                            </Wrap>
                        </Box>
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <Button my="2" onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
                                Save settings
                            </Button>
                        </Flex>
                    </Flex>
                    <Flex w="full" flexDirection="row" justifyContent="space-between">
                        <Spacer />
                        {EnableButton}
                    </Flex>
                </Flex>
            </Container>
        </>
    );
};

export default Page;
