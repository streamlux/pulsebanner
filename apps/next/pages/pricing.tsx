import { Price, PriceInterval, Product, Subscription } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Heading,
    List,
    Text,
    WrapItem,
    ListItem,
    ListIcon,
    Center,
    chakra,
    Container,
    VStack,
    SimpleGrid,
    Flex,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Switch,
    FormControl,
    FormLabel,
    ScaleFade,
    HStack,
    Img,
} from '@chakra-ui/react';
import { ArrowRightIcon, CheckIcon } from '@chakra-ui/icons';

import favicon from '@app/public/favicon.webp';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaTwitch, FaArrowRight } from 'react-icons/fa';

type Props = {
    products: (Product & { prices: Price[] })[];
};

const Page: NextPage<Props> = ({ products }) => {
    const [subscription, setSubscription] = useState<Subscription>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { status, data: session } = useSession({ required: false }) as any;

    const router = useRouter();
    const { modal } = router.query;

    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (modal === 'true') {
            if (session && (!session?.accounts?.twitch || !session?.accounts?.twitter)) {
                onOpen();
            }
            router.replace(router.pathname);
        }
    }, [modal, router, onOpen, session, onClose]);

    const ensureSignUp = useCallback(() => {
        if (session?.accounts?.twitch && session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    }, [session, onOpen]);

    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');

    const sortProductsByPrice = (
        products: (Product & {
            prices: Price[];
        })[]
    ) => products.sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

    useEffect(() => {
        (async () => {
            if (status === 'authenticated') {
                const res = await fetch('/api/user/subscription');

                const data = await res.json();

                if (data.subscription) {
                    setSubscription(data.subscription);
                }
            }
        })();
    }, [status]);

    const handlePricingClick = useCallback(
        async (priceId: string) => {
            if (ensureSignUp()) {
                if (subscription) {
                    return router.push('/account');
                }

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        price: priceId,
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, subscription, ensureSignUp]
    );

    const AnnualBillingControl = (
        <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="billingInterval" my="0" experimental_spaceX={4}>
                <Text as={chakra.span}>Annual billing</Text>
                <Text as={chakra.span} color="black" fontWeight="semibold" bg="green.200" p="1" px="2" rounded="md">
                    Two months free!
                </Text>
            </FormLabel>
            <Switch
                id="billingInterval"
                size="lg"
                colorScheme="green"
                isChecked={billingInterval === 'year'}
                onChange={(v) => {
                    setBillingInterval(billingInterval === 'year' ? 'month' : 'year');
                }}
            />
        </FormControl>
    );

    return (
        <>
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Sign up</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb="12">
                        <VStack>
                            <Button
                                onClick={
                                    session?.accounts?.twitter
                                        ? undefined
                                        : () =>
                                              signIn('twitter', {
                                                  callbackUrl: router.pathname + '?modal=true',
                                              })
                                }
                                colorScheme="twitter"
                                leftIcon={<FaTwitter />}
                                rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
                            >
                                Connect to Twitter
                            </Button>
                            {session && (
                                <Button
                                    onClick={() =>
                                        signIn('twitch', {
                                            callbackUrl: router.pathname,
                                        })
                                    }
                                    colorScheme="twitch"
                                    leftIcon={<FaTwitch />}
                                    rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitch
                                </Button>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <VStack spacing="16">
                <Container centerContent maxW="container.lg" experimental_spaceY="6">
                    <Heading size="2xl" textAlign="center">
                        Easily get more stream views with
                    </Heading>
                    <Box maxH="10">
                        <HStack height="100%">
                            <Img alt="PulseBanner logo" src={favicon.src} height="64px" width="64px" />
                            <Heading size="2xl" as={chakra.p}>
                                PulseBanner
                            </Heading>
                        </HStack>
                    </Box>
                </Container>
                <Center>{AnnualBillingControl}</Center>
                <Center>
                    <SimpleGrid columns={[1, 2]} spacing="4">
                        {sortProductsByPrice(products).map((product) => {
                            const price: Price = product?.prices?.find((one: Price) => one.interval === billingInterval);
                            const monthlyPrice: Price = product?.prices.find((one: Price) => one.interval === 'month');
                            if (!price || !monthlyPrice) {
                                return null;
                            }

                            return (
                                <WrapItem key={product.name}>
                                    <Box rounded="md" p="4" experimental_spaceY="8">
                                        <Box>
                                            <Flex direction="row" justify="space-between" alignItems="center">
                                                <VStack alignItems="start" spacing={0}>
                                                    <Heading size="md">{product.name}</Heading>
                                                    <Text>{product.description ?? 'Missing description'}</Text>
                                                </VStack>

                                                <VStack spacing={0}>
                                                    <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight">
                                                        <HStack>
                                                            {billingInterval === 'month' && (
                                                                <Text as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                                                    {`$${(price.unitAmount / 100).toFixed(2)}`}
                                                                </Text>
                                                            )}
                                                            {billingInterval === 'year' && (
                                                                <>
                                                                    <Text as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                                                        {`$${(price.unitAmount / 100 / (billingInterval === 'year' ? 12 : 1)).toFixed(2)}`}
                                                                    </Text>
                                                                    <Text as="s">{`$${monthlyPrice.unitAmount / 100}`}</Text>
                                                                </>
                                                            )}
                                                        </HStack>
                                                    </Text>
                                                    {billingInterval === 'year' && (
                                                        <ScaleFade initialScale={0.9} in={billingInterval === 'year'}>
                                                            <Text fontSize="xs">per month{billingInterval === 'year' ? ', billed annually' : ''}</Text>
                                                        </ScaleFade>
                                                    )}
                                                    {billingInterval === 'month' && (
                                                        <ScaleFade initialScale={0.9} in={billingInterval === 'month'}>
                                                            <Text fontSize="xs">per month</Text>
                                                        </ScaleFade>
                                                    )}
                                                </VStack>
                                            </Flex>
                                        </Box>

                                        <Box>
                                            <Button fontWeight="bold" onClick={() => handlePricingClick(price.id)} colorScheme="green" rightIcon={<FaArrowRight />}>
                                                Buy {product.name}
                                            </Button>
                                        </Box>

                                        <Box>
                                            <Heading size="md">{"What's included"}</Heading>
                                            <List>
                                                {[
                                                    'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
                                                    'Cum repellendus libero non expedita quam eligendi',
                                                    'a deserunt beatae debitis culpa asperiores ipsum facilis,',
                                                    'excepturi reiciendis accusantium nemo quos id facere!',
                                                ].map((feature) => (
                                                    <ListItem key={feature}>
                                                        <ListIcon color="green.200" as={CheckIcon} />
                                                        {feature}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Box>
                                </WrapItem>
                            );
                        })}
                    </SimpleGrid>
                </Center>
                <Center>{AnnualBillingControl}</Center>
                <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
            </VStack>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    const products = await prisma.product.findMany({
        where: {
            active: true,
        },
        include: {
            prices: {
                where: {
                    active: true,
                },
            },
        },
    });

    return {
        props: {
            products,
        },
    };
};

export default Page;
