import { Price, PriceInterval, Product } from '.prisma/client';
import { HStack, SimpleGrid, VStack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Button, Center, chakra, Switch, Tag, Text } from '@chakra-ui/react';
import router from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import { ProductCard } from './ProductCard';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    // type PricingProps = {
    //     products: (Product & { prices: Price[] })[];
    // };
    // useSWR call to local endpoint
    const { data } = useSWR<any>('pricing', async () => (await fetch('/api/pricing/plans')).json());
    const [billingInterval, setBillingInterval] = useState<PriceInterval>('year');

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
            <ModalContent alignContent="center" pb="6">
                <ModalHeader>
                    <Center>Looking for something more? Purchase now!</Center>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={8}>
                        <Center>{AnnualBillingControl}</Center>
                        <Center>
                            <SimpleGrid columns={[1, 2]} spacing="4">
                                {sortProductsByPrice(data).map((product) => (
                                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                                    <ProductCard key={product.id} product={product} billingInterval={billingInterval} handlePricingClick={() => router.push('/pricing')} />
                                ))}
                            </SimpleGrid>
                        </Center>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
