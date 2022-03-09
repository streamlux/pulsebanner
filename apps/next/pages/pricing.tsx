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
    Stack,
    List,
    ListIcon,
    ListItem,
    Spacer,
    WrapItem,
} from '@chakra-ui/react';

import getStripe from '../util/getStripe';
import prisma from '../util/ssr/prisma';
import { FaTwitter, FaCheck, FaArrowRight } from 'react-icons/fa';
import { ProductCard } from '@app/components/pricing/ProductCard';
import { trackEvent } from '@app/util/umami/trackEvent';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { NextSeo } from 'next-seo';
import { Card } from '@app/components/Card';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { generalFaqItems, pricingFaqItems } from '@app/modules/faq/data';
import { FaqSection } from '@app/modules/faq/FaqSection';

type Props = {
    products: (Product & { prices: Price[] })[];
};

const Page: NextPage<Props> = ({ products }) => {
    console.log('products: ', products);
    const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        async (priceId: string, isSubscription: boolean) => {
            router.push({
                query: {
                    priceId,
                },
            });
            if (ensureSignUp()) {
                // TODO - this needs to change
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
            console.log('product: ', product);
            product.prices.forEach((price) => {
                console.log('product: ', product.name);
                if (product.name.includes('Gift')) {
                    console.log('product name has gift');
                    list.push(<Button onClick={() => handlePricingClick(price.id, false)} key="gift">{`GIFT ${price.unitAmount * 0.01}`}</Button>);
                } else {
                    console.log('product name does not have gift');
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
        </>
    );

    // return (
    //     <>
    //         <NextSeo title="Pricing" />
    //         <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
    //             <ModalOverlay />
    //             <ModalContent>
    //                 <ModalHeader>
    //                     <Center>Almost there!</Center>
    //                     <Center>Connect to Twitter to continue.</Center>
    //                 </ModalHeader>
    //                 <ModalCloseButton />
    //                 <ModalBody minH="32" h="32" pb="4">
    //                     <Flex h="full" direction="column" justifyContent="space-between">
    //                         <VStack grow={1}>
    //                             <Button
    //                                 onClick={() => {
    //                                     if (session?.accounts?.twitter) {
    //                                         return;
    //                                     }
    //                                     const url = new window.URL(window.location.href);
    //                                     url.searchParams.append('modal', 'true');

    //                                     signIn('twitter', {
    //                                         callbackUrl: url.pathname + url.search,
    //                                     });
    //                                 }}
    //                                 colorScheme="twitter"
    //                                 leftIcon={<FaTwitter />}
    //                                 rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
    //                             >
    //                                 Connect to Twitter
    //                             </Button>
    //                         </VStack>
    //                         <Center>
    //                             <Text fontSize="sm">
    //                                 {'By signing up, you agree to our'}{' '}
    //                                 <Link as={NextLink} href="/terms" passHref>
    //                                     Terms
    //                                 </Link>{' '}
    //                                 and{' '}
    //                                 <Link as={NextLink} href="/privacy" passHref>
    //                                     Privacy Policy
    //                                 </Link>
    //                             </Text>
    //                         </Center>
    //                     </Flex>
    //                 </ModalBody>
    //             </ModalContent>
    //         </Modal>

    //         <Container maxW="container.lg" experimental_spaceY="6" pb="6">
    //             <Heading size="xl" textAlign="center" h="full">
    //                 PulseBanner Memberships
    //             </Heading>
    //             <Center>
    //                 <Text textAlign="center" fontSize="xl" maxW="container.sm">
    //                     You can use PulseBanner for free forever 🎉 OR you can unlock even more awesome features and kindly support the creators with a PulseBanner Membership.
    //                 </Text>
    //             </Center>
    //         </Container>
    //         <VStack spacing={[6, 12]} w="full">
    //             {AnnualBillingControl}
    //             <HStack>
    //                 {giftingProducts(products).forEach((product) => {
    //                     product.prices.map((price) => {
    //                         console.log('product info: ', price.id);
    //                         return (
    //                             <Button onClick={() => handlePricingClick(price.id)} key={price.id}>
    //                                 {product.name}
    //                             </Button>
    //                         );
    //                     });
    //                 })}
    //                 ;
    //             </HStack>
    //             <Center w={['auto', 'auto', 'auto', '5xl']}>
    //                 <SimpleGrid columns={[1, 1, 1, 3]} spacing="4" w="full">
    //                     <WrapItem key="free" w="full" h="full">
    //                         <Card props={{ w: 'full', h: 'full' }}>
    //                             <Box w="full" experimental_spaceY={4}>
    //                                 <Flex direction="row" justify="space-between" alignItems="center">
    //                                     <VStack alignItems="start" spacing={0}>
    //                                         <Heading size="lg">Free</Heading>
    //                                         <Text>Features with limited customization</Text>
    //                                     </VStack>
    //                                 </Flex>
    //                             </Box>
    //                             <Flex direction="row" justify="space-between" alignItems="center" justifyContent="center">
    //                                 <VStack spacing={0} cursor="pointer">
    //                                     <Stack direction={['column', 'row']} alignItems={['center', 'center']} w="full" spacing={[0, 2]}>
    //                                         <Text
    //                                             fontSize="2xl"
    //                                             fontWeight="extrabold"
    //                                             lineHeight="tight"
    //                                             as={chakra.span}
    //                                             bg="green.200"
    //                                             px="1"
    //                                             py="0.5"
    //                                             mb="4"
    //                                             rounded="md"
    //                                             color="black"
    //                                         >
    //                                             Free
    //                                         </Text>
    //                                     </Stack>
    //                                 </VStack>
    //                             </Flex>

    //                             <Box flexGrow={2} experimental_spaceY={2}>
    //                                 <Heading size="md">{"What's included"}</Heading>
    //                                 <List>
    //                                     {['Twitter Live Banner', 'Twitter Name Changer'].map((feature) => (
    //                                         <ListItem key={feature}>
    //                                             <ListIcon color="green.300" as={CheckIcon} />
    //                                             {feature}
    //                                         </ListItem>
    //                                     ))}
    //                                 </List>
    //                                 <Heading size="md">{'What am I missing?'}</Heading>
    //                                 <List>
    //                                     <ListItem key="profile image">
    //                                         <ListIcon color="red.400" as={CloseIcon} />
    //                                         Live Twitter Profile Picture
    //                                     </ListItem>
    //                                     <ListItem key="profile image">
    //                                         <ListIcon color="red.400" as={CloseIcon} />
    //                                         Banner refreshing
    //                                     </ListItem>
    //                                     <ListItem key="profile image">
    //                                         <ListIcon color="red.400" as={CloseIcon} />
    //                                         Custom banner background image
    //                                     </ListItem>
    //                                 </List>
    //                             </Box>

    //                             <Box justifySelf="flex-end">
    //                                 <Flex w="full" justifyContent="space-between">
    //                                     <Spacer />
    //                                     {session && (
    //                                         <Button
    //                                             fontWeight="bold"
    //                                             colorScheme="green"
    //                                             rightIcon={<FaArrowRight />}
    //                                             onClick={() => {
    //                                                 const url = new window.URL(window.location.href);
    //                                                 url.searchParams.append('modal', 'true');
    //                                                 signIn('twitter', {
    //                                                     callbackUrl: url.pathname + url.search,
    //                                                 });
    //                                             }}
    //                                         >
    //                                             Sign up
    //                                         </Button>
    //                                     )}
    //                                 </Flex>
    //                             </Box>
    //                         </Card>
    //                     </WrapItem>
    //                     {sortProductsByPrice(products).map((product) => (
    //                         <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={handlePricingClick} />
    //                     ))}
    //                 </SimpleGrid>
    //             </Center>
    //             <Container centerContent maxW="container.lg" experimental_spaceY="4">
    //                 <Text fontSize="md">Prices in USD. VAT may apply. Membership is tied to one Twitter account.</Text>
    //                 <Text textAlign="center" maxW="2xl" px="4" fontSize="xl">
    //                     Just like you, the people behind PulseBanner are creators. And like you, we rely on PulseBanner Memberships to keep improving and maintaining PulseBanner.
    //                     Supporting PulseBanner enables us to do what we love and empower creators ❤️
    //                 </Text>
    //                 <Box pt="8">
    //                     <FaqSection items={pricingFaqItems.concat(generalFaqItems)} />
    //                 </Box>
    //             </Container>
    //         </VStack>
    //     </>
    // );
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
