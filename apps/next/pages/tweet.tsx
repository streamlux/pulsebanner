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
    Spacer,
    Text,
    Textarea,
    useBoolean,
    useToast,
    VStack,
    Wrap,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import { discordLink } from '@app/util/constants';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';
import { Tweet } from '.prisma/client';
import { trackEvent } from '@app/util/umami/trackEvent';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';

const Page: NextPage = () => {
    const { data, mutate } = useSWR<Tweet>('tweet', async () => (await fetch('/api/features/tweet')).json());

    const defaultTweetMessage = 'Come join me on Twitch! I am live!\nStream link:';
    const [tweetText, setTweetText] = useState(defaultTweetMessage);

    const toast = useToast();
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();
    const [isToggling, { on, off }] = useBoolean(false);

    const toggle = async () => {
        // ensure user is signed up before enabling tweet
        if (ensureSignUp()) {
            umami(data && data.enabled ? 'disable-tweet' : 'enable-tweet');
            on();
            // await saveSettings();
            // await axios.put(bannerEndpoint);
            off();
            if (data && data.enabled) {
                // bannerDisabledToggle();
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
            mutate({
                ...data,
                enabled: data === undefined ? false : !data.enabled,
            });
        }
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
                    <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full" direction="column" minH="lg">
                        <Box w="full" experimental_spaceY={2}>
                            <HStack>
                                <Checkbox p="2" colorScheme="purple" defaultChecked={false} size="lg">
                                    Post Banner
                                </Checkbox>
                                <Checkbox p="2" colorScheme="purple" defaultChecked={true} size="lg">
                                    Post Twitch URL
                                </Checkbox>
                            </HStack>
                        </Box>
                        <Text p="2">Tweet message</Text>
                        <Textarea placeholder="Tweet message here" defaultValue={tweetText} onChange={(val) => setTweetText(val.target.value)} />
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <Button my="2" className={trackEvent('click', 'save-settings-button')}>
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
