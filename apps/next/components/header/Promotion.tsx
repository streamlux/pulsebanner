import { promo, promoCode } from '@app/util/constants';
import { Box, Button, Center, Stack, Tag, Text } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import NextLink from 'next/link';

export const Promotion: FC = (): ReactElement | null => {
    if (!promo) {
        return null;
    }
    return (
        <Center pt={['4', '2']}>
            <Box px="4" py="2" mx="4" color={'black'} w={['fit-content']} bg="green.200" rounded="lg">
                <Center h="full">
                    <Stack direction={['column', 'column', 'row']}>
                        <Text textAlign="center" pt="1" fontSize={['sm', 'md']}>
                            {'Sale! Use code'}{' '}
                            <Tag color="black" fontWeight="bold" colorScheme="green" bg={'green.100'}>
                                {promoCode}
                            </Tag>{' '}
                            {'at checkout to save 10% on your first month!'}
                        </Text>
                        <NextLink href="/pricing" passHref>
                            <Button rightIcon={<FaArrowRight />} colorScheme="whiteAlpha" bg="green.100" size="sm" color="black">
                                View pricing
                            </Button>
                        </NextLink>
                    </Stack>
                </Center>
            </Box>
        </Center>
    );
};
