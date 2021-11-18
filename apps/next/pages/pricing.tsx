import { Price, PriceInterval, Product, Subscription } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Heading,
    Text,
    Center,
    chakra,
    Container,
    VStack,
    SimpleGrid,
    HStack,
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
    Img,
    Badge,
    Tag,
    ScaleFade,
    Flex,
    Link,
} from '@chakra-ui/react';

import favicon from '@app/public/favicon.webp';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaTwitch } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';

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
        <HStack display="flex" alignItems="center" spacing={4} fontSize="lg">
            <Switch
                id="billingInterval"
                size="lg"
                colorScheme="green"
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
        <>
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
                            <Center>
                                <Text fontSize="sm">
                                    {'By signing up, you agree to our'} <Link>Terms</Link> and <Link>Privacy Policy</Link>
                                </Text>
                            </Center>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <VStack spacing="16">
                <Container centerContent maxW="container.lg" experimental_spaceY="6">
                    <Heading size="2xl" textAlign="center">
                        Automatically{' '}
                        <Text as={chakra.span} style={{ background: 'linear-gradient(0deg,#a7affa 22%,transparent 0)' }}>
                            attract viewers
                        </Text>{' '}
                        to your stream
                    </Heading>
                </Container>
                <Center>{AnnualBillingControl}</Center>
                <Center>
                    <SimpleGrid columns={[1, 2]} spacing="4">
                        {sortProductsByPrice(products).map((product) => (
                            <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={handlePricingClick} />
                        ))}
                    </SimpleGrid>
                </Center>
                <Center>{AnnualBillingControl}</Center>
                <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
            </VStack>
        </>
    );
};

// Since we export getServerSideProps method in this file, it means this page will be rendered on the server
// aka this page is server-side rendered
// This method is run on the server, then the return value is passed in as props to the component above
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
