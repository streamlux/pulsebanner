import { CheckIcon } from '@chakra-ui/icons';
import { WrapItem, Box, Flex, VStack, Heading, HStack, chakra, ScaleFade, Button, List, ListItem, ListIcon, Text, Tag, Stack, Spacer } from '@chakra-ui/react';
import type { Price, PriceInterval, Product } from '@prisma/client';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Card } from '../Card';

interface ProductProps {
    product: Product & { prices: Price[] };
    billingInterval: PriceInterval;
    handlePricingClick: (priceId: string) => void;
}

export const ProductCard: React.FC<ProductProps> = ({ product, billingInterval, handlePricingClick }) => {
    const price: Price = product?.prices?.find((one: Price) => one.interval === billingInterval);
    const monthlyPrice: Price = product?.prices.find((one: Price) => one.interval === 'month');
    if (!price || !monthlyPrice) {
        return null;
    }

    const sharedFeatureList = ['Remove watermark', 'High quality image rendering', 'Customize colors', 'Unlock all features'];
    const personalFeatureList = sharedFeatureList.concat(['Thumbnail refreshing (coming soon)']);
    const professionalFeatureList = sharedFeatureList.concat(['Fastest thumbnail refreshing (coming soon)']);

    const featureDescriptionMapping: Record<string, string[]> = {
        Personal: personalFeatureList,
        Professional: professionalFeatureList,
    };

    return (
        <WrapItem key={product.name} w="full">
            <Card props={{ w: 'full' }}>
                <Box w="full">
                    <Flex direction="row" justify="space-between" alignItems="center">
                        <VStack alignItems="start" spacing={0}>
                            <Heading size="lg">{product.name}</Heading>
                            <Text>{product.description ?? 'Missing description'}</Text>
                        </VStack>

                        <VStack spacing={0} onClick={() => handlePricingClick(price.id)} cursor="pointer">
                            <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" w="full">
                                <Stack direction={['column', 'row']} alignItems={['center', 'center']} w="full" spacing={[0, 2]}>
                                    {billingInterval === 'month' && (
                                        <Text as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                            {`$${(price.unitAmount / 100).toFixed(2)}`}
                                        </Text>
                                    )}
                                    {billingInterval === 'year' && (
                                        <>
                                            <Text as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black">
                                                {`$${(price.unitAmount / 100 / (billingInterval === 'year' ? 12 : 1)).toFixed(2)}`}
                                            </Text>
                                            <Text as="s">{`$${monthlyPrice.unitAmount / 100}`}</Text>
                                        </>
                                    )}
                                </Stack>
                            </Text>
                            <Box w="full">
                                {billingInterval === 'year' && (
                                    <ScaleFade initialScale={0.9} in={billingInterval === 'year'} style={{ width: '100%' }}>
                                        <Text fontSize="xs" w={['90px', 'full']} textAlign="right" pr={['2', 0]}>
                                            per month{billingInterval === 'year' ? ', billed annually' : ''}
                                        </Text>
                                    </ScaleFade>
                                )}
                                {billingInterval === 'month' && (
                                    <ScaleFade initialScale={0.9} in={billingInterval === 'month'} style={{ width: '100%' }}>
                                        <Text fontSize="xs" textAlign="right" w={['90px', 'full']} pr={['2', 0]}>
                                            per month
                                        </Text>
                                    </ScaleFade>
                                )}
                            </Box>
                        </VStack>
                    </Flex>
                </Box>

                <Box>
                    <Heading size="md">{"What's included"}</Heading>
                    <List>
                        {featureDescriptionMapping[product.name].map((feature) => (
                            <ListItem key={feature}>
                                <ListIcon color="green.200" as={CheckIcon} />
                                {feature}
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Flex w="full" justifyContent="space-between">
                    <Spacer />
                    <Button fontWeight="bold" onClick={() => handlePricingClick(price.id)} colorScheme="green" rightIcon={<FaArrowRight />}>
                        Buy {product.name}
                    </Button>
                </Flex>
            </Card>
        </WrapItem>
    );
};
