import { Price, PriceInterval, Product } from '@prisma/client';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useRef, useState } from 'react';
import {
    Button,
    Heading,
    Text,
    Center,
    Container,
    VStack,
    HStack,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Tag,
    Flex,
    Link,
    Box,
    useBreakpoint,
    LightMode,
    Grid,
    GridItem,
    Tooltip,
} from '@chakra-ui/react';

import { FaTwitter, FaCheck } from 'react-icons/fa';
import { PaymentPlan } from '@app/services/payment/paymentHelpers';
import { NextSeo } from 'next-seo';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { Card } from '@app/components/Card';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { GiftCard } from '@app/components/pricing/GiftCard';
import { ButtonSwitch } from '@app/components/buttonSwitch/ButtonSwitch';
import ReactCanvasConfetti from 'react-canvas-confetti';
import getStripe from '@app/util/getStripe';
import { GiftPriceMap } from '@app/services/stripe/gift/constants';

type Props = {
    priceMap: Record<string, { unitAmount: number } & Price & { product: Product }>;
    cancel_path?: string;
    giftPriceIds: GiftPriceMap;
};

export const GiftPricing: React.FC<Props> = ({ priceMap, cancel_path, giftPriceIds }) => {
    const [paymentPlan, paymentPlanResponse] = usePaymentPlan();
    const { data: session } = useSession({ required: false }) as any;

    const router = useRouter();

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [giftProduct, setGiftProduct] = useState<Exclude<PaymentPlan, 'Free'>>('Personal');

    const breakpoint = useBreakpoint('sm');

    const canvasStyles: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: breakpoint === 'base' ? 100 : 500,
        right: 0,
    };

    const ensureSignUp = useCallback(() => {
        if (session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    }, [session, onOpen]);

    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');

    const handlePricingClick = useCallback(
        async (priceId: string, isSubscription: boolean, quantity?: number) => {
            router.push(
                {
                    query: {
                        priceId,
                    },
                },
                undefined,
                { shallow: true }
            );
            if (ensureSignUp()) {
                if (isSubscription && (paymentPlan === 'Professional' || paymentPlan === 'Personal')) {
                    const res = await fetch('/api/stripe/create-portal', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                    });

                    const data = await res.json();
                    router.push(data.subscriptionUrl);
                }

                const res = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        price: priceId,
                        isSubscription,
                        quantity: quantity ?? 1,
                        cancel_path: cancel_path ?? '/pricing',
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp, cancel_path]
    );

    const refAnimationInstance = useRef(null as any);

    const getInstance = useCallback((instance) => {
        refAnimationInstance.current = instance;
    }, []);

    const makeShot = useCallback((particleRatio, opts) => {
        refAnimationInstance.current &&
            refAnimationInstance.current({
                ...opts,
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * particleRatio),
            });
    }, []);

    const fire = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, [makeShot]);

    const AnnualBillingControl = (
        <VStack spacing={1}>
            <ButtonSwitch
                defaultIndex={1}
                onChange={(index) => {
                    if (index === 0) {
                        setBillingInterval('month');
                    } else {
                        setBillingInterval('year');
                    }
                }}
            >
                <Text>Monthly billing</Text>
                <VStack spacing={0}>
                    <Text>Yearly billing</Text>
                    <LightMode>
                        <Tag size="sm" colorScheme={'green'} fontSize={'xs'}>
                            Save 15%
                        </Tag>
                    </LightMode>
                </VStack>
            </ButtonSwitch>
            <Center>
                <Text fontSize="xs">Choose between monthly or annual pricing</Text>
            </Center>
        </VStack>
    );

    const GiftProductSwitch = (
        <VStack mb="4">
            <Center>
                <ButtonSwitch
                    defaultIndex={0}
                    onChange={(index) => {
                        setGiftProduct(index ? 'Professional' : 'Personal');
                    }}
                >
                    <Text>Personal</Text>
                    <Text>Professional</Text>
                </ButtonSwitch>
            </Center>
            <Center>
                <Text fontSize="xs" whiteSpace={'pre-wrap'} mx="4" textAlign={'center'}>
                    Choose between Personal or Professional gifts
                </Text>
            </Center>
        </VStack>
    );

    const giftIds = giftPriceIds[giftProduct];
    const gift = (duration: keyof typeof giftIds) => {
        if (!priceMap[giftIds[duration]]) {
            console.log('Error getting gift for duration: ', duration, giftIds[duration], priceMap[giftIds[duration]]);
            return undefined as unknown as ({
                unitAmount: number;
            } & Price & {
                product: Product;
            });
        } else {
            return priceMap[giftIds[duration]];
        }
    };
    return (
        <>
            <NextSeo title="Pricing" />
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Center>Almost there!</Center>
                        <Center>Connect to Twitter to continue.</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody minH="32" h="32" pb="4">
                        <Flex h="full" direction="column" justifyContent="space-between">
                            <VStack grow={1}>
                                <Button
                                    onClick={() => {
                                        if (session?.accounts?.twitter) {
                                            return;
                                        }

                                        const url = new window.URL(window.location.href);
                                        url.searchParams.append('modal', 'true');

                                        signIn('twitter', {
                                            callbackUrl: url.pathname + url.search,
                                        });
                                    }}
                                    colorScheme="twitter"
                                    leftIcon={<FaTwitter />}
                                    rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitter
                                </Button>
                            </VStack>
                            <Center>
                                <Text fontSize="sm">
                                    {'By signing up, you agree to our'}{' '}
                                    <Link as={NextLink} href="/terms" passHref>
                                        Terms
                                    </Link>{' '}
                                    and{' '}
                                    <Link as={NextLink} href="/privacy" passHref>
                                        Privacy Policy
                                    </Link>
                                </Text>
                            </Center>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <VStack w="full">
                <Container maxW="container.xl" experimental_spaceY={24}>
                    <Container w="full" maxW={['unset', 'container.xl']} px="0">
                        <Grid templateRows={['repeat(1, 1fr)', 'repeat(3, 1fr)']} templateColumns={['repeat(1, 1fr)', 'repeat(3, 1fr)']} gap={4} w="full">
                            <GridItem rowSpan={[1, 3]} colSpan={1} w="full">
                                <Card props={{ color: 'white', p: '0', border: 'none', w: 'full', h: 'full', bgGradient: 'linear(to-tr, #9246FF, #2AA9E0)' }}>
                                    <Flex direction={'column'} justifyItems="stretch" h="full" rounded="md">
                                        <Box p="4" px="6" flexGrow={1} w="full">
                                            <Text fontSize={'2xl'}>Feeling generous?</Text>
                                            <HStack>
                                                <Heading>
                                                    PulseBanner Membership Gifts
                                                    {breakpoint !== 'base' && (
                                                        <Tooltip label="Click me!">
                                                            <Button zIndex={20} p="0" fontSize={28} variant="ghost" ml="2" onClick={fire}>
                                                                🎁
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </Heading>

                                                <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} />
                                            </HStack>
                                            <Text my="4">A PulseBanner Membership makes the perfect gift for streamers!</Text>
                                            <Text my="4">Once purchased, gifts are easily shared using a unique link.</Text>
                                            <Text my="4">Perfect for giveaways, no shipping needed!</Text>

                                            {breakpoint !== 'base' && (
                                                <HStack>
                                                    <Text fontWeight={'bold'} fontSize={'xl'}>
                                                        Select a gift
                                                    </Text>
                                                    <ArrowRightIcon />
                                                </HStack>
                                            )}
                                            {breakpoint === 'base' && GiftProductSwitch}
                                            {breakpoint === 'base' && (
                                                <HStack>
                                                    <Text fontWeight={'bold'} fontSize={'xl'}>
                                                        Select a gift
                                                    </Text>
                                                    <ArrowRightIcon transform={'rotate(90deg)'} />
                                                </HStack>
                                            )}
                                        </Box>
                                        {breakpoint !== 'base' && GiftProductSwitch}
                                    </Flex>
                                </Card>
                            </GridItem>
                            <GridItem colSpan={[1, 2]}>
                                <GiftCard
                                    onClickBuy={async (q) => handlePricingClick(gift('oneMonth').id, false, q)}
                                    variant="large"
                                    duration="1-month"
                                    price={gift('oneMonth').unitAmount}
                                    product={giftProduct}
                                />
                            </GridItem>
                            <GridItem colSpan={[1]}>
                                <GiftCard
                                    onClickBuy={async (q) => handlePricingClick(gift('threeMonths').id, false, q)}
                                    duration="3-months"
                                    price={gift('threeMonths').unitAmount}
                                    product={giftProduct}
                                />
                            </GridItem>
                            <GridItem colSpan={[1]}>
                                <GiftCard
                                    onClickBuy={async (q) => handlePricingClick(gift('sixMonths').id, false, q)}
                                    duration="6-months"
                                    price={gift('sixMonths').unitAmount}
                                    product={giftProduct}
                                />
                            </GridItem>
                            <GridItem colSpan={[1, 2]}>
                                <GiftCard
                                    onClickBuy={async (q) => handlePricingClick(gift('oneYear').id, false, q)}
                                    variant="large"
                                    duration="1-year"
                                    price={gift('oneYear').unitAmount}
                                    discount={gift('oneMonth').unitAmount * 12}
                                    product={giftProduct}
                                />
                            </GridItem>
                        </Grid>
                    </Container>
                </Container>
            </VStack>
        </>
    );
};
