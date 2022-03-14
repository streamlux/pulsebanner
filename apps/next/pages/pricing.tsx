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
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { NextSeo } from 'next-seo';
import { generalFaqItems, pricingFaqItems } from '@app/modules/faq/data';
import { FaqSection } from '@app/modules/faq/FaqSection';
import { usePaymentPlan } from '@app/util/hooks/usePaymentPlan';
import { FreeProductCard } from '@app/components/pricing/FreeProductCard';

type Props = {
    products: (Product & { prices: Price[] })[];
};

const Page: NextPage<Props> = ({ products }) => {
    const [paymentPlan, paymentPlanResponse] = usePaymentPlan();
    const { status, data: session } = useSession({ required: false }) as any;

    const router = useRouter();

    const { modal, priceId } = router.query;

    const { isOpen, onOpen, onClose } = useDisclosure();

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
    ) =>
        products
            .filter((a) => !a.name.includes('Gift'))
            .sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

    const giftingProducts = (
        products: (Product & {
            prices: Price[];
        })[]
    ) => products.filter((a) => a.name.includes('Gift'));

    const handlePricingClick = useCallback(
        async (priceId: string, isSubscription: boolean) => {
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
                        isSubscription: isSubscription,
                    }),
                });

                const data = await res.json();

                const stripe = await getStripe();
                stripe?.redirectToCheckout({ sessionId: data.sessionId });
            }
        },
        [router, paymentPlan, ensureSignUp]
    );

    // useEffect(() => {
    //     if (modal === 'true') {
    //         if (session && !session?.accounts?.twitter) {
    //             onOpen();
    //         }
    //         router.replace(router.pathname);
    //         if (priceId) {
    //             handlePricingClick(priceId as string, true);
    //         }
    //     }
    // }, [modal, router, onOpen, session, onClose, handlePricingClick, priceId]);

    const AnnualBillingControl = (
        <HStack display="flex" alignItems="center" spacing={4} fontSize="lg">
            <Switch
                id="billingInterval"
                className={trackEvent('click', 'billing-interval-switch')}
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
            <Tag size="md" variant="solid" background={billingInterval === 'year' ? 'green.200' : 'gray.200'} color="black">
                Save 15%
            </Tag>
        </HStack>
    );

    const test = () => {
        const list = [];
        products.forEach((product) => {
            product.prices.forEach((price) => {
                console.log('product: ', product.name);
                if (product.name.includes('Gift')) {
                    list.push(<Button onClick={() => handlePricingClick(price.id, false)} key="gift">{`GIFT ${price.unitAmount * 0.01}`}</Button>);
                } else {
                    list.push(
                        <Button onClick={() => handlePricingClick(price.id, true)} key={price.id}>
                            {price.unitAmount * 0.01}
                        </Button>
                    );
                }
            });
        });
        return list;
    };

    return (
        <>
            {test()}
            <Button>test</Button>

            <VStack spacing={[6, 12]} w="full">
                {AnnualBillingControl}
                <Center w={['auto', 'auto', 'auto', '5xl']}>
                    <SimpleGrid columns={[1, 1, 1, 3]} spacing="4" w="full">
                        <WrapItem key={'free2'} w="full" h="full">
                            <FreeProductCard />
                        </WrapItem>
                        {sortProductsByPrice(products).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                billingInterval={billingInterval}
                                handlePricingClick={(priceId) => handlePricingClick(priceId, true)}
                                paymentPlan={paymentPlan}
                                paymentPlanResponse={paymentPlanResponse}
                            />
                        ))}
                    </SimpleGrid>
                </Center>
                <Container centerContent maxW="container.lg" experimental_spaceY="4">
                    <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
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
