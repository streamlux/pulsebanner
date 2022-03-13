import { Price, PriceInterval, Product } from '@prisma/client';
import type { GetServerSideProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
    Tag,
    Flex,
    Link,
    Box,
    WrapItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Image,
    useBreakpoint,
    LightMode,
    DarkMode,
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaArrowRight } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import { NextSeo } from 'next-seo';
import { generalFaqItems, pricingFaqItems } from '@app/modules/faq/data';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { FreeProductCard } from '@app/components/pricing/FreeProductCard';
import { useColorTheme } from '@app/util/hooks/useColorMode';
import { Card } from '@app/components/Card';
import { landingPageAsset } from '.';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpDownIcon, ArrowUpIcon } from '@chakra-ui/icons';

type Props = {
    products: (Product & { prices: Price[] })[];
};

const Page: NextPage<Props> = ({ products }) => {
    const [paymentPlan, paymentPlanResponse] = usePaymentPlan();
    const { status, data: session } = useSession({ required: false }) as any;

    const [theme, themeValue] = useColorTheme();

    const router = useRouter();

    const { modal, priceId } = router.query;

    const { isOpen, onOpen, onClose } = useDisclosure();

    const breakpoint = useBreakpoint('sm');

    const ensureSignUp = useCallback(() => {
        if (session?.accounts?.twitter) {
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

    const handlePricingClick = useCallback(
        async (priceId: string) => {
            router.push({
                query: {
                    priceId,
                },
            });
            if (ensureSignUp()) {
                if (paymentPlan === 'Professional' || paymentPlan === 'Personal') {
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
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp]
    );

    useEffect(() => {
        if (modal === 'true') {
            if (session && !session?.accounts?.twitter) {
                onOpen();
            }
            router.replace(router.pathname);
            if (priceId) {
                handlePricingClick(priceId as string);
            }
        }
    }, [modal, router, onOpen, session, onClose, handlePricingClick, priceId]);

    const AnnualBillingControl = (
        <VStack spacing={1}>
            <Tabs
                variant="enclosed"
                colorScheme={'gray'}
                rounded="xl"
                border="none"
                borderWidth={0}
                bg="transparent"
                defaultIndex={1}
                onChange={(index) => {
                    if (index === 0) {
                        setBillingInterval('month');
                    } else {
                        setBillingInterval('year');
                    }
                }}
            >
                <TabList h="16" borderWidth={0} w={['auto', 'full']} bg={themeValue('whiteAlpha.600', 'whiteAlpha.400')} rounded="xl">
                    <Tab
                        rounded="xl"
                        w="50%"
                        fontWeight={'bold'}
                        m="0"
                        textColor={themeValue('gray.700', 'whiteAlpha.800')}
                        _selected={{ bg: themeValue('white', 'whiteAlpha.800'), color: themeValue('gray.800', 'gray.800') }}
                    >
                        Monthly billing
                    </Tab>
                    <Tab
                        m="0"
                        fontWeight={'bold'}
                        rounded="xl"
                        w="50%"
                        textColor={themeValue('gray.700', 'whiteAlpha.800')}
                        _selected={{ bg: themeValue('white', 'whiteAlpha.800'), color: themeValue('gray.800', 'gray.800') }}
                    >
                        <VStack spacing={0}>
                            <Text>Yearly billing</Text>
                            <LightMode>
                                <Tag size="sm" colorScheme={'green'} fontSize={'xs'}>
                                    Save 15%
                                </Tag>
                            </LightMode>
                        </VStack>
                    </Tab>
                </TabList>
            </Tabs>
            <Center>
                <Text fontSize="xs">Choose between monthly or annual pricing</Text>
            </Center>
        </VStack>
    );

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

            <Container maxW="container.lg" experimental_spaceY="6" pb="8">
                <Heading size="xl" textAlign="center" h="full" bgGradient="linear(to-r, #2AA9ff, #f246FF)" bgClip="text" fontSize={['5xl', '7xl']} fontWeight="bold">
                    PulseBanner Memberships
                </Heading>
                {/* <Heading size="xl" textAlign="center" h="full" color='white' fontSize="6xl" fontWeight="extrabold">
                    PulseBanner Memberships
                </Heading> */}
            </Container>

            <VStack spacing={[6, 12]} w="full">
                <Container maxW="container.lg" position={'relative'}>
                    {breakpoint !== 'base' && (
                        <Box my="4">
                            <FreeProductCard />
                        </Box>
                    )}
                    <Center w={['auto', 'auto', 'auto', 'auto']}>
                        <SimpleGrid columns={[1, 1, 1, 3]} spacing="4" w="full">
                            <WrapItem key={'free2'} w="full" h="full">
                                <Card props={{ color: 'white', p: '0', border: 'none', w: 'full', h: 'full', bgGradient: 'linear(to-tr, #9246FF, #2AA9E0)' }}>
                                    <Flex direction={'column'} justifyItems="stretch" h="full" rounded="md">
                                        <Box p="4" px="6" flexGrow={1} w="full">
                                            <Text fontSize={'2xl'}>Level up with a</Text>
                                            <Heading>PulseBanner Membership.</Heading>
                                            <Text my="4">Choose a plan and begin customizing in seconds. Then experience how PulseBanner can help you grow.</Text>

                                            {breakpoint !== 'base' && (
                                                <HStack>
                                                    <Text fontWeight={'bold'} fontSize={'xl'}>
                                                        Select a plan
                                                    </Text>
                                                    <ArrowRightIcon />
                                                </HStack>
                                            )}
                                            {breakpoint === 'base' && <Center mb="6">{AnnualBillingControl}</Center>}
                                            {breakpoint === 'base' && (
                                                <HStack>
                                                    <Text fontWeight={'bold'} fontSize={'xl'}>
                                                        Select a plan
                                                    </Text>
                                                    <ArrowRightIcon transform={'rotate(90deg)'} />
                                                </HStack>
                                            )}
                                        </Box>
                                        {breakpoint !== 'base' && <Center mb="2">{AnnualBillingControl}</Center>}

                                        {/* <Box mb='5'>
                                        <Center>
                                            <Box w="50%">
                                                {theme === 'dark' ? (
                                                    <Image src={landingPageAsset('twitterxtwitch')} alt="Banner" />
                                                ) : (
                                                    <Image src={landingPageAsset('twitterxtwitch_light')} alt="Banner" />
                                                )}
                                            </Box>
                                        </Center>
                                    </Box> */}

                                        {/* <Image rounded="md" alignSelf={'self-end'} justifySelf={'flex-end'} src={landingPageAsset('showcase')} alt="showcase" /> */}
                                    </Flex>
                                </Card>
                            </WrapItem>
                            {sortProductsByPrice(products).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    billingInterval={billingInterval}
                                    handlePricingClick={handlePricingClick}
                                    paymentPlan={paymentPlan}
                                    paymentPlanResponse={paymentPlanResponse}
                                />
                            ))}
                        </SimpleGrid>
                    </Center>
                    {/* <Box w="100vw" position={'relative'} h='50vh'> */}
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '-300px', left: '0px', height: '78%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-3 pink top"></div>
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>
                    {/* </Box> */}

                    <Container my="16">
                        <Heading size="2xl">Premium Features</Heading>
                        <VStack my="8">
                            <Box>
                                <Box experimental_spaceY={4}>
                                    <HStack>
                                        <Heading size="xl" textAlign="left">
                                            Live Profile
                                        </Heading>
                                    </HStack>
                                    <Text fontSize="lg">
                                        Sync your Twitter profile picture with your Twitch stream. Updates when you go live on Twitch, and changes back when your stream ends.
                                    </Text>
                                </Box>
                                <Center py="8">
                                    <Image src={landingPageAsset('profileimage')} alt="Banner" py="10" />
                                </Center>
                            </Box>
                        </VStack>
                    </Container>
                </Container>

                <Container centerContent maxW="container.lg" experimental_spaceY="4">
                    <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
                    <Center>
                        <Text textAlign="center" fontSize="xl" maxW="container.sm">
                            You can use PulseBanner for free forever 🎉 OR you can unlock even more awesome features and kindly support the creators with a PulseBanner Membership.
                        </Text>
                    </Center>
                    <Text textAlign="center" maxW="2xl" px="4" fontSize="xl">
                        Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
                        Supporting PulseBanner enables us to do what we love and empower creators ❤️
                    </Text>
                    <Box pt="8">
                        <FaqSection items={pricingFaqItems.concat(generalFaqItems)} />
                    </Box>
                </Container>
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
