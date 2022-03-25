import { Price, PriceInterval, Product } from '@prisma/client';
import type { GetStaticProps, NextPage } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import React, { useCallback, useState } from 'react';
import {
    Button,
    Heading,
    Text,
    Center,
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
    Tag,
    Flex,
    Link,
    Box,
    WrapItem,
    useBreakpoint,
    LightMode,
    keyframes,
    ModalFooter,
} from '@chakra-ui/react';
import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaArrowDown } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { NextSeo } from 'next-seo';
import { generalFaqItems, giftFaqItems, pricingFaqItems } from '@app/modules/faq/faqData';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { FreeProductCard } from '@app/components/pricing/FreeProductCard';
import { Card } from '@app/components/Card';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { ButtonSwitch } from '@app/components/buttonSwitch/ButtonSwitch';
import { GiftPricing } from '@app/modules/pricing/GiftPricing';
import { useSession } from '@app/util/hooks/useSession';

type ProductType = Product & { prices: Price[] };
type Products = ProductType[];
type Props = {
    products: Products;
    prices: (Price & { unitAmount: number } & { product: Product })[];
    priceMap: Record<string, Price & { unitAmount: number } & { product: Product }>;
};

const arrowAnimation = keyframes`
  from {
    transform: scale(1);
  }
  to {
      transform: scale(1.3);
  }`;

const sortProductsByPrice = (products: Products, billingInterval: PriceInterval) =>
    products
        .filter((a: ProductType) => !a.name.includes('Gift'))
        .sort(
            (a, b) => (a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount ?? 0) - (b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount ?? 0)
        );

const Page: NextPage<Props> = ({ products, priceMap }) => {
    const [paymentPlan, paymentPlanResponse] = usePaymentPlan();
    const { data: session } = useSession({ required: false });

    const router = useRouter();
    const breakpoint = useBreakpoint('sm');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');

    /**
     * Checks if they are signed in with twitter, if not then show the modal
     */
    const ensureSignUp: () => boolean = useCallback(() => {
        if (session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    }, [session, onOpen]);

    const onClickSubscription = useCallback(
        async (priceId: string) => {
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
                if (paymentPlan === 'Professional' || paymentPlan === 'Personal') {
                    const res = await fetch('/api/stripe/create-portal', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            return_url: '/pricing'
                        })
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
                        isSubscription: true,
                        quantity: 1, // quantity is always 1 for subscriptions
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp]
    );

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

    return (
        <>
            {PricingSEO}
            {breakpoint !== 'base' && (
                <div style={{ position: 'absolute', left: '220px', top: '700px' }}>
                    <VStack>
                        <Heading>🎁</Heading>
                        <Box animation={`${arrowAnimation} alternate infinite 1.4s linear`}>
                            <FaArrowDown fontSize={28} />
                        </Box>
                    </VStack>
                </div>
            )}
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <Center>Almost there!</Center>
                        <Center>Connect to Twitter to continue.</Center>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Center h='full'>
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
                        </Center>
                    </ModalBody>
                    <ModalFooter w="full">
                        <Center w="full">
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
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Container maxW="container.lg" experimental_spaceY="6" pb="8" mt="-8">
                <Heading size="xl" textAlign="center" h="full" bgGradient="linear(to-r, #2AA9ff, #f246FF)" bgClip="text" fontSize={['5xl', '7xl']} fontWeight="bold">
                    PulseBanner Memberships
                </Heading>
            </Container>

            <VStack spacing={[6, 12]} w="full">
                <Container maxW="container.xl" position={'relative'} experimental_spaceY={24}>
                    <Container maxW="container.lg">
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
                                        </Flex>
                                    </Card>
                                </WrapItem>
                                {sortProductsByPrice(products, billingInterval).map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        billingInterval={billingInterval}
                                        handlePricingClick={(priceId) => onClickSubscription(priceId)}
                                        paymentPlan={paymentPlan}
                                        paymentPlanResponse={paymentPlanResponse}
                                    />
                                ))}
                                {breakpoint === 'base' && (
                                    <Box>
                                        <FreeProductCard modal />
                                    </Box>
                                )}
                            </SimpleGrid>
                        </Center>
                        <Container centerContent maxW="container.lg" experimental_spaceY="4" pt="4">
                            <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
                        </Container>
                    </Container>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '80%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '-500px', left: '-600px', height: '38%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '100%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '-300px', left: '0px', height: '78%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-3 pink top"></div>
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ zIndex: -1, position: 'absolute', height: '50%', maxHeight: '700px', width: '70%', display: 'block' }}>
                        <div className="contact-hero" style={{ position: 'relative', top: '480px', left: '-300px', height: '58%' }}>
                            <div className="bg-gradient-blur-wrapper contact-hero">
                                <div className="bg-gradient-blur-circle-3 pink top"></div>
                                <div className="bg-gradient-blur-circle-2 blue"></div>
                                <div className="bg-gradient-blur-circle-4 purple"></div>
                            </div>
                        </div>
                    </div>

                    <Box>
                        <Center>
                            <Text textAlign="center" fontSize="3xl" maxW="container.md">
                                Unlock even more awesome features and kindly support us by becoming a PulseBanner Member ♥️
                            </Text>
                        </Center>
                    </Box>

                    <Container w="full" maxW={['unset', 'container.xl']} px="0">
                        <GiftPricing priceMap={priceMap} />
                    </Container>
                </Container>

                <Container centerContent maxW="container.lg" experimental_spaceY="4">
                    <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                        Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
                    </Text>

                    <Text textAlign="center" maxW="4xl" px="4" fontSize="2xl">
                        Help empower creators by supporting us ♥️
                    </Text>
                    <Box pt="32">
                        <FaqSection items={pricingFaqItems.concat(generalFaqItems).concat(giftFaqItems)} />
                    </Box>
                </Container>
            </VStack>
        </>
    );
};

// Since we export getServerSideProps method in this file, it means this page will be rendered on the server
// aka this page is server-side rendered
// This method is run on the server, then the return value is passed in as props to the component above
export const getStaticProps: GetStaticProps<Props> = async (context) => {
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

    const prices = (await prisma.price.findMany({
        where: {
            active: true,
            AND: {
                product: {
                    active: true,
                },
            },
        },
        include: {
            product: true,
        },
    })) as (Price & { unitAmount: number } & { product: Product })[];

    const priceMap: Record<string, typeof prices[0]> = prices.reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {} as any);

    return {
        props: {
            products,
            prices,
            priceMap,
        },
    };
};

const PricingSEO = (
    <NextSeo
        title="Pricing"
        openGraph={{
            site_name: 'Pricing',
            type: 'website',
            url: 'https://pulsebanner.com/pricing',
            title: 'PulseBanner - Memberships',
            description: 'Stand out on Twitter and attract more viewers to your stream',
            images: [
                {
                    url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pricing_og.webp',
                    width: 1200,
                    height: 627,
                    alt: 'Stand out on Twitter with PulseBanner!',
                },
            ],
        }}
        twitter={{
            site: '@PulseBanner',
            cardType: 'summary_large_image',
        }}
    />
);

export default Page;
