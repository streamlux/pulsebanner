import { CheckIcon } from '@chakra-ui/icons';
import { Box, Flex, VStack, Heading, Text, Center, List, ListIcon, ListItem, Stack, chakra, ScaleFade, HStack, TextProps } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';

interface Children {
    children?: React.ReactNode;
}

export const ProductCardHeading: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Box experimental_spaceY={4}>
            <Flex direction="row" justify="space-between" alignItems="center">
                <VStack alignItems="start" spacing={0}>
                    {children}
                </VStack>
            </Flex>
        </Box>
    );
};

export const ProductCardTitle: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return <Heading size="lg">{children}</Heading>;
};

export const ProductCardDescription: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return <Text>{children}</Text>;
};

export const ProductCardFooter: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Box justifySelf="flex-end">
            <Center w="full">{children}</Center>
        </Box>
    );
};

export const ProductCardBody: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <VStack flexGrow={2} alignItems="start" spacing={2}>
            {children}
        </VStack>
    );
};

export const ProductCardFeaturesListHeading: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return <Heading size="md">{children}</Heading>;
};

export const ProductCardFeatureList: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return <List>{children}</List>;
};

export const ProductCardFeatureListItem: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <ListItem>
            <ListIcon color="green.300" as={CheckIcon} />
            {children}
        </ListItem>
    );
};

interface ProductCardPriceProps {
    handlePriceClick: () => void;
    children?: React.ReactNode;
}

export const ProductCardPricing: React.FC<ProductCardPriceProps> = ({ children, handlePriceClick }) => {
    return (
        <Flex direction="row" justify="space-between" alignItems="center" justifyContent="center">
            <VStack spacing={0} onClick={handlePriceClick} cursor="pointer">
                {children}
            </VStack>
        </Flex>
    );
};

export const ProductCardPrice: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Stack direction={['row', 'row']} alignItems={['center', 'center']} w="full" spacing={2}>
            {children}
        </Stack>
    );
};

export const GiftCardPrice: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Stack direction={['column', 'row']} alignItems={['center', 'center']} w="full" spacing={2}>
            {children}
        </Stack>
    );
};

export const ProductCardPriceAmount: React.FC<TextProps> = ({ children, ...props }) => {
    return (
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" as={chakra.span} bg="green.200" px="1" py="0.5" rounded="md" color="black" {...props}>
            {children}
        </Text>
    );
};

export const ProductCardPriceDiscount: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Text fontSize="2xl" fontWeight="extrabold" lineHeight="tight" as="s">
            {children}
        </Text>
    );
};

export const ProductCardPriceDescription: React.FC<PropsWithChildren<Children>> = ({ children }) => {
    return (
        <Box w="full">
            <ScaleFade initialScale={0.9} in style={{ width: '100%' }}>
                <Text fontSize="xs" w={['full', 'full']} textAlign="right" pr={['2', 0]}>
                    {children}
                </Text>
            </ScaleFade>
        </Box>
    );
};
