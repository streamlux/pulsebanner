import { ArrowRightIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, HStack, Spacer, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import { CgGift } from 'react-icons/cg';
import { FaArrowRight, FaGift, FaGifts, FaPlus } from 'react-icons/fa';
import { FiGift } from 'react-icons/fi';
import { Card } from '../Card';
import { ProductCardPriceAmount } from './ProductCardParts';

type GiftCardProps = {
    duration: string;
    price: string;
    product: string;
};

export const GiftCard: FC<GiftCardProps> = ({ product, price, duration }): ReactElement => {
    return (
        <Card props={{ w: 'full', h: 'auto' }}>
            <HStack>
                <HStack w="full">
                    <FiGift fontSize={'32px'} />
                    <Heading size="md">{duration}</Heading>
                </HStack>
                <Box>
                    <ProductCardPriceAmount fontSize="2xl">{price}</ProductCardPriceAmount>
                </Box>
            </HStack>
            <Heading size="md" whiteSpace={'nowrap'}>
                {product} Membership
            </Heading>
            <Flex w="full">
                <Spacer />
                <Button w="fit-content" colorScheme={'green'} fontWeight={'bold'} rightIcon={<FaPlus />}>
                    Add to cart
                </Button>
            </Flex>
        </Card>
    );
};
