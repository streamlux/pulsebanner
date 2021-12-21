import { shareOnTwitterLink } from '@app/util/constants';
import { Box, Button, HStack, Link, VStack, Text, Heading, Center } from '@chakra-ui/react';
import React, { ReactElement, FC, ReactNode } from 'react';

function createIntent(tweetText: string): string {
    const encodedText = encodeURIComponent(tweetText);
    const shareOnTwitterLink = `https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fpulsebanner.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&text=${encodedText}`;
    return shareOnTwitterLink;
}

interface ShareToTwitterProps {
    tweetText: string;
    tweetPreview: ReactNode;
}

export const ShareToTwitter: FC<ShareToTwitterProps> = ({ tweetText, tweetPreview }): ReactElement => {
    return (
        <VStack spacing="2">
            <Heading fontSize="lg" px="4" textAlign="center">
                Share PulseBanner with your friends ❤️
            </Heading>
            <Box border="1px" borderColor="gray.200" p="3" rounded="md" w="min-content" minW={['xs', 'md']} textAlign="center">
                {tweetPreview}
            </Box>
            <HStack>
                <Text fontSize="md" textAlign="right">
                    Share it! 👉
                    <br />
                    (you can change the text)
                </Text>
                <Link color="blue.400" fontWeight="bold" isExternal href={createIntent(tweetText)}>
                    <Button as="a" colorScheme="twitter">
                        Tweet ❤️
                    </Button>
                </Link>
            </HStack>
        </VStack>
    );
};
