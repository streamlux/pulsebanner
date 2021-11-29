import { shareOnTwitterLink } from '@app/util/constants';
import { Box, Button, HStack, Link, VStack, Text, Heading } from '@chakra-ui/react';
import React, { ReactElement, FC } from 'react';

export const ShareToTwitter: FC = (): ReactElement => {
    return (
        <VStack spacing="2">
            <Heading fontSize="lg" px="4" textAlign="center">
                Share PulseBanner with your friends ❤️
            </Heading>
            <Box border="1px" borderColor="gray.200" p="3" rounded="md" w="min-content" minW={['xs', 'md']} textAlign="center">
                <Text fontSize="lg" as="i">
                    I just setup my auto updating Twitter banner using <Link color="twitter.500">@PulseBanner</Link>. Make your own at{' '}
                    <Link color="twitter.500">pulsebanner.com</Link>
                </Text>
            </Box>
            <HStack>
                <Text fontSize="md" textAlign="right">
                    Share it! 👉
                    <br />
                    (you can change the text)
                </Text>
                <Link color="blue.400" fontWeight="bold" isExternal href={shareOnTwitterLink}>
                    <Button as="a" colorScheme="twitter">
                        Tweet ❤️
                    </Button>
                </Link>
            </HStack>
        </VStack>
    );
};
