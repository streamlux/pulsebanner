import React from 'react';
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
    Center,
    Box,
    HStack,
    Heading,
    Container,
    Flex,
    Spacer,
    Tag,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { getSession, signOut } from 'next-auth/react';
import axios from 'axios';
import useSWR from 'swr';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { Card } from '@app/components/Card';
import { NextSeo } from 'next-seo';

const Page: NextPage = () => {
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

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    // delete the account
    const deleteAccount = async () => {
        const sessionInfo = await getSession();
        if ((sessionInfo?.user as any)?.id) {
            // call api endpoint here to delete user and erase all data
            await axios.delete(`/api/user`);

            // sign user out and redirect to home page
            signOut({
                callbackUrl: '/',
            });
        }
    };

    return (
        <>
            <NextSeo title="Account" nofollow noindex />
            <Container maxW="container.lg">
                <VStack>
                    <Heading mb="8">PulseBanner Account</Heading>

                    <VStack alignItems="start" w="full" spacing={12}>
                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                PulseBanner Membership
                            </Heading>
                            <Card props={{ w: 'full' }}>
                                <Box>
                                    <Flex justifyContent="space-between">
                                        <HStack>
                                            <Text>Current PulseBanner Membership status: </Text>
                                            <Text>{paymentPlan === 'Free' ? 'None' : paymentPlan}</Text>
                                        </HStack>
                                        <Button
                                            onClick={async () => {
                                                await handleCreatePortal();
                                            }}
                                        >
                                            {paymentPlan === 'Free' || paymentPlanResponse.partner ? 'Become PulseBanner Member' : 'Change/Cancel PulseBanner Membership'}
                                        </Button>
                                    </Flex>
                                    {paymentPlanResponse?.partner && (
                                        <Tag variant="solid" colorScheme="teal">
                                            PulseBanner Partner
                                        </Tag>
                                    )}
                                </Box>
                            </Card>
                        </Box>
                        <Box w="full">
                            <Heading as="p" fontSize="xl" mb="2">
                                Danger Area
                            </Heading>
                            <Card props={{ w: 'full' }}>
                                {paymentPlan !== 'Free' && (
                                    <Text fontSize="2xl" fontWeight="bold">
                                        <Center>If you are a paid user, you must cancel your subscription before deleting your account</Center>
                                    </Text>
                                )}
                                <Flex justifyContent="space-between">
                                    <Spacer />
                                    <Popover placement="top">
                                        {({ isOpen, onClose }) => (
                                            <>
                                                <PopoverTrigger>
                                                    <Button colorScheme="red" disabled={paymentPlan !== 'Free' && paymentPlanResponse.partner !== true}>
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
