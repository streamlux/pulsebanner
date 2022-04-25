import React, { useCallback } from 'react';
import {
    Button,
    ButtonGroup,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverTrigger,
    VStack,
    Text,
    Box,
    HStack,
    Heading,
    Container,
    Flex,
    Spacer,
    Tag,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Stack,
} from '@chakra-ui/react';
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from 'next';
import { getSession, signOut } from 'next-auth/react';
import axios from 'axios';
import { APIPaymentObject, PaymentPlan, productPlan } from '@app/services/payment/paymentHelpers';
import { Card } from '@app/components/Card';
import { NextSeo } from 'next-seo';
import { FeaturesService } from '@app/services/FeaturesService';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { useRouter } from 'next/router';
import { FaTwitch } from 'react-icons/fa';
import prisma from '@app/util/ssr/prisma';
import { GiftSummary } from '@app/components/gifts/GiftSummary';
import { CustomSession } from '@app/services/auth/CustomSession';
import { callWithContext, Context } from '@app/services/Context';

interface Props {
    enabledFeatures: Awaited<ReturnType<typeof FeaturesService.listEnabled>>;
    plan: APIPaymentObject;
    allGiftPurchases: {
        createdAt: Date;
        checkoutSessionId: string;
    }[];
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
    return await callWithContext<Props>(ctx, {
        hasSession: async (context: Context) => {
            const { userId } = context;
            const enabledFeatures = await FeaturesService.listEnabled(context);

            const plan: APIPaymentObject = await productPlan(userId);

            const allGiftPurchases = await prisma.giftPurchase.findMany({
                where: {
                    purchaserUserId: userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    checkoutSessionId: true,
                    createdAt: true,
                },
                distinct: ['checkoutSessionId'],
            });

            return {
                props: {
                    enabledFeatures,
                    plan,
                    allGiftPurchases,
                },
            };
        },
        noSession: () => ({
            redirect: {
                destination: '/',
                permanent: false,
            }
        }),
        error: (error) => ({
            redirect: {
                destination: '/',
                permanent: false,
            },
        })
    });
};

const Page: NextPage<Props> = ({ enabledFeatures, plan, allGiftPurchases }) => {
    const router = useRouter();
    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch('/account');
    const paymentPlan: PaymentPlan = plan === undefined ? 'Free' : plan.plan;

    const hasTwitch = session?.accounts['twitch'];

    const handleCreatePortal = async () => {
        const res = await fetch('/api/stripe/create-portal', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });

        const data = await res.json();
        window.location.assign(data.url);
    };

    // delete the account
    const disconnectTwitch = useCallback(async () => {
        if (enabledFeatures.length === 0) {
            await axios.post(`/api/user/disconnect-twitch`);
            router.reload();
        }
    }, [enabledFeatures, router]);

    // delete the account
    const deleteAccount = useCallback(async () => {
        // call api endpoint here to delete user and erase all data
        axios.delete(`/api/user`).then(() => {
            // sign user out and redirect to home page
            signOut({
                callbackUrl: '/',
            });
        });
    }, []);

    return (
        <>
            <NextSeo title="Account" nofollow noindex />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} callbackUrl="/account" />
            <Container maxW="container.md">
                <VStack>
                    <Heading mb="8">PulseBanner Account</Heading>

                    <VStack alignItems="start" w="full" spacing={12}>
                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                PulseBanner Membership
                            </Heading>
                            <Card props={{ w: 'full' }}>
                                <VStack w="full" align={'left'}>
                                    <Stack justifyContent="space-between" direction={['column', 'row']} spacing={4}>
                                        <HStack justifyContent={'space-between'}>
                                            <Text fontWeight={'bold'}>Membership status</Text>
                                            <Box>
                                                <Tag colorScheme={paymentPlan === 'Free' ? 'gray' : 'blue'}>{paymentPlan === 'Free' ? 'None' : paymentPlan}</Tag>
                                            </Box>
                                        </HStack>
                                        <Button
                                            onClick={async () => {
                                                await handleCreatePortal();
                                            }}
                                            colorScheme={paymentPlan === 'Free' || plan.partner ? 'green' : undefined}
                                        >
                                            {paymentPlan === 'Free' || plan.partner ? 'Become PulseBanner Member' : 'Change/Cancel PulseBanner Membership'}
                                        </Button>
                                    </Stack>
                                </VStack>
                            </Card>
                        </Box>

                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                Accounts
                            </Heading>
                            <Card>
                                <Flex w="full">
                                    <Spacer />
                                    {hasTwitch ? (
                                        <Box experimental_spaceY={2}>
                                            {enabledFeatures.length !== 0 && (
                                                <Alert status="error">
                                                    <AlertIcon />
                                                    <AlertTitle mr={2}>You have features enabled</AlertTitle>
                                                    <AlertDescription>All features must be disabled to disconnect Twitch.</AlertDescription>
                                                </Alert>
                                            )}
                                            <Text>Connect to the wrong Twitch account? Just click Disconnect Twitch Account and then reconnect to the correct account.</Text>
                                            <Button onClick={disconnectTwitch} disabled={enabledFeatures.length !== 0}>
                                                Disconnect Twitch Account
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Button leftIcon={<FaTwitch />} color="white" colorScheme={'twitch'} onClick={ensureSignUp}>
                                            Connect Twitch Account
                                        </Button>
                                    )}
                                </Flex>
                            </Card>
                        </Box>

                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                Gift Purchases
                            </Heading>
                            <GiftSummary allGiftPurchases={allGiftPurchases} hideHeader />
                        </Box>

                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                Danger Area
                            </Heading>
                            <Card props={{ w: 'full' }}>
                                {paymentPlan !== 'Free' && !plan.partner && (
                                    <Alert status="error">
                                        <AlertIcon />
                                        <AlertDescription>You must cancel your subscription before deleting your account.</AlertDescription>
                                    </Alert>
                                )}
                                <Flex justifyContent="space-between">
                                    <Spacer />
                                    <Popover placement="top">
                                        {({ isOpen, onClose }) => (
                                            <>
                                                <PopoverTrigger>
                                                    <Button colorScheme="red" disabled={paymentPlan !== 'Free' && plan.partner !== true}>
                                                        Delete account and erase all data
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody>
                                                        Are you sure you want to delete your account and erase all your data? This is permanent and cannot be undone.
                                                    </PopoverBody>
                                                    <PopoverFooter d="flex" justifyContent="flex-end">
                                                        <ButtonGroup size="sm">
                                                            <Button colorScheme="red" onClick={async () => await deleteAccount()}>
                                                                Confirm
                                                            </Button>
                                                            <Button colorScheme="green" onClick={() => onClose()}>
                                                                Cancel
                                                            </Button>
                                                        </ButtonGroup>
                                                    </PopoverFooter>
                                                </PopoverContent>
                                            </>
                                        )}
                                    </Popover>
                                </Flex>
                            </Card>
                        </Box>
                    </VStack>
                </VStack>
            </Container>
        </>
    );
};

export default Page;
