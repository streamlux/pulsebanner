import { giftSummaryPath } from '@app/util/constants';
import { Center, VStack, Box, Heading, Flex, Divider, Button, Text } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';
import { Card } from '../Card';
import NextLink from 'next/link';
import { GiftInfo } from './types';

type GiftSummaryProps = {
    allGiftPurchases: {
        checkoutSessionId: string;
        createdAt: Date;
    }[];
    gifts?: GiftInfo[];
};

export const GiftSummary: FC<GiftSummaryProps> = ({ allGiftPurchases, gifts }): ReactElement => {
    return (
        <Center w="full">
            <Card props={{ maxW: 'full' }}>
                <VStack spacing={8} maxW={['auto', '2xl']} p="1">
                    <Box experimental_spaceY={4} w="full">
                        <VStack>
                            <Heading size="lg" textAlign={'left'} w="full">
                                All Gift Purchases
                            </Heading>
                            <Text size={'sm'} maxW="full">
                                List of all your past gift purchases. Click View Summary to view the details of each purchase.
                            </Text>
                        </VStack>
                        <VStack w="full" rounded="md" p="2" px="3">
                            {allGiftPurchases.map((purchase) => (
                                <Flex alignItems={'center'} w="full" py="1" justifyContent={'space-between'} key={purchase.checkoutSessionId}>
                                    <Box>
                                        <Heading size="sm" whiteSpace={'nowrap'}>
                                            {purchase.createdAt.toLocaleDateString()}
                                        </Heading>
                                    </Box>
                                    <Divider w="full" mx="2" variant={'dashed'} />
                                    <Box>
                                        {gifts?.[0].gift.checkoutSessionId !== purchase.checkoutSessionId ? (
                                            <NextLink passHref href={`${giftSummaryPath}?cs=${purchase.checkoutSessionId}`}>
                                                <Button size="sm" as="a">
                                                    View Summary
                                                </Button>
                                            </NextLink>
                                        ) : (
                                            <Button size="sm" disabled>
                                                Viewing
                                            </Button>
                                        )}
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>
                </VStack>
            </Card>
        </Center>
    );
};
