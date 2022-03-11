import { Price, PriceInterval, Product } from '.prisma/client';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { holidayDecor, promoCode } from '@app/util/constants';
import { PaymentPlan, APIPaymentObject } from '@app/util/database/paymentHelpers';
import getStripe from '@app/util/getStripe';
import { trackEvent } from '@app/util/umami/trackEvent';
import { HStack, SimpleGrid, Stack, VStack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Box, Center, chakra, Switch, Tag, Text, useColorMode, useDisclosure, WrapItem } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { FreeProductCard } from './FreeProductCard';
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

    const { isOpen: connectTwitchIsOpen, onOpen: onOpenConnectToTwitch, onClose: onCloseConnectToTwitch } = useDisclosure();

    const handlePricingClick = useCallback(
        async (priceId: string) => {
            router.push({
                query: {
                    priceId,
                },
            });
            if (session) {
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
            } else {
                onOpenConnectToTwitch();
            }
        },
        [router, paymentPlan, session, onOpenConnectToTwitch]
    );

    if (data === undefined) {
        return null;
    }

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

    return (
        <>
            <ConnectTwitchModal isOpen={connectTwitchIsOpen} onClose={onCloseConnectToTwitch} session={session} callbackUrl={'/pricing'} />
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
                                        <FreeProductCard />
                                    </WrapItem>
                                    {sortProductsByPrice(data).map((product) => (
                                        <Box key={product.id} w="full">
                                            <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={handlePricingClick} paymentPlan={paymentPlan} />
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            </Center>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
