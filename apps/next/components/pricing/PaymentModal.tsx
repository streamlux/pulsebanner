import { Price, PriceInterval, Product } from '.prisma/client';
import { holidayDecor } from '@app/util/constants';
import { trackEvent } from '@app/util/umami/trackEvent';
import { HStack, SimpleGrid, Stack, VStack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Box, Center, chakra, Switch, Tag, Text, useColorMode } from '@chakra-ui/react';
import router from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import { ProductCard } from './ProductCard';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { data } = useSWR<any>('pricing', async () => (await fetch('/api/pricing/plans')).json());
    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');
    const { colorMode } = useColorMode();

    if (data === undefined) {
        return <></>;
    }

    const sortProductsByPrice = (
        products: (Product & {
            prices: Price[];
        })[]
    ) => products.sort((a, b) => a?.prices?.find((one) => one.interval === billingInterval)?.unitAmount - b?.prices?.find((one) => one.interval === billingInterval)?.unitAmount);

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
                <ModalHeader>
                    <Text>PulseBanner Membership</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={8} w="full">
                        {holidayDecor && (
                            <Center pt={['4', '2']}>
                                <Box px="4" py="2" mx="4" color={colorMode === 'dark' ? 'black' : 'black'} w={['fit-content']} bg="green.200" rounded="lg">
                                    <Center h="full">
                                        <Stack direction={['column', 'row']}>
                                            <Text textAlign="center" fontSize={['sm', 'md']}>
                                                {'Holiday sale! Use code'}{' '}
                                                <Tag color="black" colorScheme="green" bg={colorMode === 'dark' ? 'green.100' : undefined}>
                                                    HAPPY25
                                                </Tag>{' '}
                                                {'at checkout to save 25% on your first 3 months!'}
                                            </Text>
                                        </Stack>
                                    </Center>
                                </Box>
                            </Center>
                        )}
                        <Center>
                            <VStack>
                                <HStack fontSize="xl">
                                    <Text fontSize="2xl">PulseBanner is</Text>
                                    <Tag size="lg" p="2" py="1" fontSize="2xl" variant="solid" background="green.200" color="black" fontWeight="bold">
                                        FREE
                                    </Tag>
                                </HStack>
                                <Text textAlign="center" maxW="2xl">
                                    You can use PulseBanner for free forever. However, you can unlock even more awesome features and kindly support the creators with a PulseBanner
                                    Membership.
                                </Text>
                            </VStack>
                        </Center>
                        <Center>{AnnualBillingControl}</Center>
                        <Center w="full">
                            <SimpleGrid columns={[1, 2]} spacing="4" w="full">
                                {sortProductsByPrice(data).map((product) => (
                                    <Box key={product.id} w="full">
                                        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
                                        <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={() => router.push('/pricing')} />
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
