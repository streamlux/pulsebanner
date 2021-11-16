import { Box, Button, Center, Container, Heading, Spacer, VStack, Text } from '@chakra-ui/react';
import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { FaTwitch, FaTwitter, FaCheck } from 'react-icons/fa';

export default function Page() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = useSession({ required: false }) as any;

    return (
        <VStack spacing="16">
            <Box>
                <VStack>
                    <Container centerContent maxW="container.lg" experimental_spaceY="4">
                        <Heading size="2xl" textAlign="center">
                            Twitter banner that updates automatically when you stream
                        </Heading>
                        <Text fontSize="xl">Start building for free, then add a site plan to go live. Account plans unlock additional features.</Text>
                    </Container>
                </VStack>
            </Box>
            <Center>
                <Box>
                    <VStack>
                        <Button onClick={() => signIn('twitter')} colorScheme="twitter" leftIcon={<FaTwitter />} rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}>
                            Connect to Twitter
                        </Button>
                        <Button onClick={() => signIn('twitch')} colorScheme="twitch" leftIcon={<FaTwitch />} rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}>
                            Connect to Twitch
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </VStack>
    );
}
