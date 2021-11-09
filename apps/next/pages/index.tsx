import { Box, Button, Center, Code, Container, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { FaTwitch, FaTwitter, FaCheck } from 'react-icons/fa';

export default function Page() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = useSession({ required: false }) as any;

    return (
        <Center>
            <Box>
                <Heading>Connect accounts</Heading>
                <VStack>
                    <Button onClick={() => signIn('twitter')} colorScheme="twitter" leftIcon={<FaTwitter />} rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}>
                        Connect to Twitter
                    </Button>
                    <Button onClick={() => signIn('twitch')} colorScheme="twitch" leftIcon={<FaTwitch />} rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}>
                        Connect to Twitch
                    </Button>
                </VStack>
            </Box>

            <Box>
                <Code variant="subtle" p="2" rounded="md">
                    <pre>{JSON.stringify(session ?? {}, null, 2)}</pre>
                </Code>
            </Box>
        </Center>
    );
}
