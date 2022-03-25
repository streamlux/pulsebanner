import React from 'react';
import { Box, Center, Text, Container, Heading, Button } from '@chakra-ui/react';
import type { NextPage } from 'next';
import {  FaTwitter } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

/**
 * We redirect users to this page after they successfuelly redeem a gift
 */
const Page: NextPage = () => {
    const router = useRouter();
    const redirect = router.query.redirect as string;
    return (
        <Container maxW="container.lg">
            <Center>
                <Box experimental_spaceY={4}>
                    <Heading as="p" textAlign={'center'}>
                        Sign in to redeem your gift!
                    </Heading>

                    <Center>
                        <Button
                            leftIcon={<FaTwitter />}
                            size="lg"
                            onClick={() => {
                                signIn('twitter', {
                                    callbackUrl: redirect,
                                });
                            }}
                        >
                            Sign in with Twitter
                        </Button>
                    </Center>
                </Box>
            </Center>
        </Container>
    );
};

export default Page;
