import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import React from 'react';

export default function Page() {
    return (
        <>
            <div className="bg-white">
                <VStack>
                    <Container centerContent maxW="container.lg" experimental_spaceY="4">
                        <Heading size="2xl" textAlign="center">
                            Twitter banner that updates automatically when you stream
                        </Heading>
                        <Text fontSize="xl">Start building for free, then add a site plan to go live. Account plans unlock additional features.</Text>
                    </Container>
                </VStack>
            </div>
        </>
    );
}
