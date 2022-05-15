import { formatUsd } from '@app/util/stringUtils';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, HStack, IconButton, Spacer, Tag, useBreakpoint, VStack, Center } from '@chakra-ui/react';
import React, { ReactElement, FC, useState, Suspense } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { FiGift } from 'react-icons/fi';
import { Card } from '../Card';
import { GiftCardPrice, ProductCardPriceAmount, ProductCardPriceDiscount } from './ProductCardParts';

type GiftCardProps = {
    duration: string;
    price: number;
    product: string;
    discount?: number;
    variant?: 'large' | 'small';
    onClickBuy: (quantity: number) => Promise<void> | void;
};

export const GiftCard: FC<GiftCardProps> = ({ onClickBuy, product, price, duration, discount, variant = 'small' }): ReactElement => {
    const small = variant === 'small';
    const mobile = useBreakpoint() === 'base';
    const [quantity, setQuantity] = useState(1);
    const incrementQuantity = () => setQuantity(quantity + 1);
    const decrememntQuantity = () => setQuantity(quantity - 1 > 0 ? quantity - 1 : 1);
    return (
        <Center>
            <Card props={{ w: 'full', h: 'auto', maxW: 'xl' }}>
                <Flex w="full">
                    <HStack align={'center'} w="full">
                        <FiGift fontSize={'32px'} />
                        <Heading fontSize={['2xl', '3xl']} whiteSpace={'nowrap'}>
                            {duration}
                        </Heading>
                        <Box display={!mobile && discount ? undefined : 'none'}>
                            <Box flexShrink={0}>
                                <Tag colorScheme={'green'} size="lg" fontWeight={'bold'}>
                                    15% off
                                </Tag>
                            </Box>
                        </Box>
                    </HStack>
                    <Box flexShrink={0}>
                        <GiftCardPrice>
                            <ProductCardPriceAmount fontSize="2xl">{formatUsd(price)}</ProductCardPriceAmount>
                            {discount && <ProductCardPriceDiscount>{formatUsd(discount)}</ProductCardPriceDiscount>}
                        </GiftCardPrice>
                    </Box>
                </Flex>
                <Heading size={'md'} whiteSpace={'nowrap'} w="full">
                    {product} Membership
                </Heading>
                <HStack spacing={0} w="full">
                    {!small && <Spacer />}
                    <Button
                        onClick={async () => onClickBuy(quantity)}
                        roundedRight="none"
                        rightIcon={<FaArrowRight />}
                        maxW={small || mobile ? undefined : 64}
                        size="md"
                        h="12"
                        w={small || mobile ? 'full' : 64}
                        colorScheme={'green'}
                        fontWeight={'bold'}
                        leftIcon={<FiGift />}
                    >
                        Buy Now (x{quantity})
                    </Button>

                    <VStack spacing={0}>
                        <IconButton
                            roundedLeft="none"
                            roundedBottom={'none'}
                            colorScheme={'gray'}
                            fontSize="xs"
                            size="xs"
                            aria-label="Add to friends"
                            icon={<AddIcon />}
                            onClick={incrementQuantity}
                        />
                        <IconButton
                            roundedLeft="none"
                            roundedTop={'none'}
                            colorScheme={'gray'}
                            fontSize="xs"
                            size="xs"
                            aria-label="Add to friends"
                            icon={<MinusIcon />}
                            disabled={quantity <= 1}
                            onClick={decrememntQuantity}
                        />
                    </VStack>
                </HStack>
            </Card>
        </Center>
    );
};
