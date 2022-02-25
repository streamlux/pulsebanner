import { Price, PriceInterval, Product } from '.prisma/client';
import { holidayDecor, promoCode } from '@app/util/constants';
import { PaymentPlan, APIPaymentObject } from '@app/util/database/paymentHelpers';
import getStripe from '@app/util/getStripe';
import { trackEvent } from '@app/util/umami/trackEvent';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { HStack, SimpleGrid, Stack, VStack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Box, Center, chakra, Flex, Heading, List, ListIcon, ListItem, Switch, Tag, Text, useColorMode, useDisclosure, WrapItem } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import router, { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card } from '../Card';
import { ProductCard } from './ProductCard';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { data } = useSWR<any>('pricing', async () => (await fetch('/api/pricing/plans')).json());
    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');
    const { colorMode } = useColorMode();

    const sortProductsByPrice = (
        products: (Product & {
            prices: Price[];
        })[]
    ) => products.sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

    const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { status, data: session } = useSession({ required: false }) as any;

    const router = useRouter();

    const ensureSignUp = useCallback(() => {
        if (session?.accounts?.twitter) {
            return true;
        }
        open();
        return false;
    }, [session]);

    useEffect(() => {
        (async () => {
            if (status === 'authenticated') {
                const res = await fetch('/api/user/subscription');

                const data: APIPaymentObject = await res.json();

                if (data) {
                    setPaymentPlan(data.plan);
                }
            }
        })();
    }, [status]);

    const handlePricingClick = useCallback(
        async (priceId: string) => {
            router.push({
                query: {
                    priceId,
                },
            });
            if (ensureSignUp()) {
                if (paymentPlan === 'Professional') {
                    return router.push('/account');
                }

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        price: priceId,
                        cancel_path: router.asPath,
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp]
    );

    if (data === undefined) {
        return <></>;
    }

    const AnnualBillingControl = (
        <HStack display="flex" alignItems="center" spacing={4} fontSize="lg">
            <Switch
                id="billingInterval"
                size="lg"
                colorScheme="green"
                className={trackEvent('click', 'billing-interval-switch')}
                isChecked={billingInterval === 'year'}
                onChange={(v) => {
                    setBillingInterval(billingInterval === 'year' ? 'month' : 'year');
                }}
            />

            <Text style={{ WebkitTextStrokeWidth: billingInterval === 'year' ? '0.75px' : '0.25px' }} as={chakra.span}>
                Yearly billing
            </Text>
            <Tag size="md" variant="solid" background="green.200" color="black">
                Two months free!
            </Tag>
        </HStack>
    );

    return (
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay />
            <ModalContent alignContent="center" pb="6" rounded="md">
                <ModalHeader pb="0">
                    <Text>PulseBanner Membership</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} w="full">
                        {holidayDecor && (
                            <Center pt={['4', '2']}>
                                <Box px="4" py="2" mx="4" color={colorMode === 'dark' ? 'black' : 'black'} w={['fit-content']} bg="green.200" rounded="lg">
                                    <Center h="full">
                                        <Stack direction={['column', 'row']}>
                                            <Text textAlign="center" fontSize={['sm', 'md']}>
                                                {'Holiday sale! Use code'}{' '}
                                                <Tag color="black" fontWeight="bold" colorScheme="green" bg={colorMode === 'dark' ? 'green.100' : undefined}>
                                                    {promoCode}
                                                </Tag>{' '}
                                                {'at checkout to save 25% on your first 3 months!'}
                                            </Text>
                                        </Stack>
                                    </Center>
                                </Box>
                            </Center>
                        )}
                        <Center>
                            <Text textAlign="center" fontSize="xl" maxW="container.sm">
                                You can use PulseBanner for free forever 🎉 OR you can unlock even more awesome features and kindly support the creators with a PulseBanner
                                Membership.
                            </Text>
                        </Center>
                        <Center>{AnnualBillingControl}</Center>
                        <Center w="full">
                            <SimpleGrid columns={[1, 3]} spacing="4" w="full">
                                <WrapItem key="free" w="full" h="full">
                                    <Card props={{ w: 'full', h: 'full' }}>
                                        <Box w="full" experimental_spaceY={4}>
                                            <Flex direction="row" justify="space-between" alignItems="center">
                                                <VStack alignItems="start" spacing={0}>
                                                    <Heading size="lg">Free</Heading>
                                                    <Text>Features with limited customization</Text>
                                                </VStack>
                                            </Flex>
                                        </Box>
                                        <Flex direction="row" justify="space-between" alignItems="center" justifyContent="center">
                                            <VStack spacing={0} cursor="pointer">
                                                <Stack direction={['column', 'row']} alignItems={['center', 'center']} w="full" spacing={[0, 2]}>
                                                    <Text
                                                        fontSize="2xl"
                                                        fontWeight="extrabold"
                                                        lineHeight="tight"
                                                        as={chakra.span}
                                                        bg="green.200"
                                                        px="1"
                                                        py="0.5"
                                                        mb="4"
                                                        rounded="md"
                                                        color="black"
                                                    >
                                                        Free
                                                    </Text>
                                                </Stack>
                                            </VStack>
                                        </Flex>

                                        <Box flexGrow={2} experimental_spaceY={2}>
                                            <Heading size="md">{"What's included"}</Heading>
                                            <List>
                                                {['Twitter Live Banner', 'Twitter Name Changer'].map((feature) => (
                                                    <ListItem key={feature}>
                                                        <ListIcon color="green.300" as={CheckIcon} />
                                                        {feature}
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Heading size="md">{'What am I missing?'}</Heading>
                                            <List>
                                                <ListItem key="profile image">
                                                    <ListIcon color="red.400" as={CloseIcon} />
                                                    Live Twitter Profile Picture
                                                </ListItem>
                                                <ListItem key="profile image">
                                                    <ListIcon color="red.400" as={CloseIcon} />
                                                    Banner refreshing
                                                </ListItem>
                                                <ListItem key="profile image">
                                                    <ListIcon color="red.400" as={CloseIcon} />
                                                    Custom banner background image
                                                </ListItem>
                                            </List>
                                        </Box>

                                        {/* <Box justifySelf="flex-end">
                                    <Flex w="full" justifyContent="space-between">
                                        <Spacer />
                                        <Button fontWeight="bold" colorScheme="green" rightIcon={<FaArrowRight />}>
                                            Sign up
                                        </Button>
                                    </Flex>
                                </Box> */}
                                    </Card>
                                </WrapItem>
                                {sortProductsByPrice(data).map((product) => (
                                    <Box key={product.id} w="full">
                                        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
                                        <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={handlePricingClick} />
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Center>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
