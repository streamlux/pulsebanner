import { Price, PriceInterval, Product } from '.prisma/client';
import { holidayDecor, promoCode } from '@app/util/constants';
import { trackEvent } from '@app/util/umami/trackEvent';
import { CheckIcon } from '@chakra-ui/icons';
import { HStack, SimpleGrid, Stack, VStack } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal';
import { Box, Center, chakra, Flex, Heading, List, ListIcon, ListItem, Switch, Tag, Text, useColorMode, WrapItem } from '@chakra-ui/react';
import router from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '../Card';
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
                                    <Card props={{ w: 'full', h: 'full' }}>
                                        <Box w="full" experimental_spaceY={4}>
                                            <Flex direction="row" justify="space-between" alignItems="center">
                                                <VStack alignItems="start" spacing={0}>
                                                    <Heading size="lg">Free</Heading>
                                                    <Text>Features with limited customization</Text>
                                                </VStack>
                                            </Flex>
                                        </Box>
                                        <Flex direction="row" justify="space-between" alignItems="center" justifyContent="center">
                                            <VStack spacing={0} cursor="pointer">
                                                <Stack direction={['column', 'row']} alignItems={['center', 'center']} w="full" spacing={[0, 2]}>
                                                    <Text
                                                        fontSize="2xl"
                                                        fontWeight="extrabold"
                                                        lineHeight="tight"
                                                        as={chakra.span}
                                                        bg="green.200"
                                                        px="1"
                                                        py="0.5"
                                                        mb="4"
                                                        rounded="md"
                                                        color="black"
                                                    >
                                                        Free
                                                    </Text>
                                                </Stack>
                                            </VStack>
                                        </Flex>

                                        <Box flexGrow={2}>
                                            <Heading size="md">{"What's included"}</Heading>
                                            <List>
                                                {['Live Banner', 'Name Changer'].map((feature) => (
                                                    <ListItem key={feature}>
                                                        <ListIcon color="green.200" as={CheckIcon} />
                                                        {feature}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>

                                        {/* <Box justifySelf="flex-end">
                                    <Flex w="full" justifyContent="space-between">
                                        <Spacer />
                                        <Button fontWeight="bold" colorScheme="green" rightIcon={<FaArrowRight />}>
                                            Sign up
                                        </Button>
                                    </Flex>
                                </Box> */}
                                    </Card>
                                </WrapItem>
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
