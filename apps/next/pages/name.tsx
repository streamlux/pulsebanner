import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import prisma from '@app/util/ssr/prisma';
import { trackEvent } from '@app/util/umami/trackEvent';
import { StarIcon } from '@chakra-ui/icons';
import { Box, Button, Container, Flex, Heading, HStack, Link, Spacer, Stack, Text, Textarea, useBoolean, useDisclosure, useToast, VStack } from '@chakra-ui/react';
import { TwitterName } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import router from 'next/router';
import { useState } from 'react';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import useSWR from 'swr';

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

    const defaultMessage = "🔴I'm live!🔴";
    const [streamName, setStreamName] = useState(twitterName.streamName ?? defaultMessage);

    const toast = useToast();

    const [isToggling, { on, off }] = useBoolean(false);

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    const getUnsavedName = () => ({
        streamName: `${streamName}`,
    });

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
                disabled={(twitterName && twitterName.enabled && streaming) || !availableForAccount()}
            >
                {twitterName && twitterName.enabled ? 'Turn off live name' : 'Turn on live name'}
            </Button>
            <Heading fontSize="lg" w="full" textAlign="center">
                {twitterName && twitterName.enabled ? 'Your name is enabled.' : 'Live name not enabled.'}
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
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']}>
                            Twitter username
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Your Twitter name will update when you start broadcasting on Twitch. Your name will revert back to your current username when your stream ends.
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
                        {availableForAccount() ? <></> : PremiumMessage}
                        <VStack align="start">
                            <Heading fontSize="lg">Streaming name</Heading>
                            <Textarea
                                minH="32"
                                resize="none"
                                maxLength={maxNameLength}
                                placeholder="Name message here"
                                defaultValue={streamName}
                                onChange={(val) => {
                                    const text = val.target.value;
                                    if (text.length >= maxNameLength) {
                                        return;
                                    }
                                    setStreamName(text);
                                }}
                            />
                        </VStack>
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
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
                                <Button my="2" disabled={!availableForAccount()} onClick={saveSettings} className={trackEvent('click', 'save-settings-button')}>
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
            </Container>
        </>
    );
}
