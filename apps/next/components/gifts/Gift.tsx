import React from 'react';
import { useClipboard, Flex, Button, Box, Tooltip, Tag, Text } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { GiftInfo } from './types';

export const Gift: React.FC<GiftInfo> = ({ redemptionUrl, redeemed }) => {
    const { onCopy, hasCopied } = useClipboard(redemptionUrl);
    return (
        <Flex
            maxW="full"
            w="full"
            justifyContent={'space-between'}
            direction={['row', 'row']}
            experimental_spaceX={2}
            rounded="md"
            bg="whiteAlpha.200"
            p="2"
            px="3"
            alignItems="center"
        >
            {redeemed ? (
                <Text fontWeight={'semibold'} colorScheme={redeemed ? undefined : 'blue'} variant={'link'} size="md" wordBreak={'break-all'} whiteSpace={'pre-wrap'}>
                    {redemptionUrl}
                </Text>
            ) : (
                <NextLink href={redemptionUrl} passHref>
                    <Button colorScheme={redeemed ? undefined : 'blue'} as="a" variant={'link'} size="md" wordBreak={'break-all'} whiteSpace={'pre-wrap'}>
                        {redemptionUrl}
                    </Button>
                </NextLink>
            )}
            <Box flexGrow={0} flexShrink={0}>
                {redeemed ? (
                    <Tooltip label="Gift has been redeemed." placement="top">
                        <Tag size="lg">Redeemed</Tag>
                    </Tooltip>
                ) : (
                    <Button colorScheme={'blue'} leftIcon={<CopyIcon />} aria-label="Copy redemption URL" onClick={() => onCopy()} size="sm">
                        {hasCopied ? 'Copied!' : 'Copy'}
                    </Button>
                )}
            </Box>
        </Flex>
    );
};
