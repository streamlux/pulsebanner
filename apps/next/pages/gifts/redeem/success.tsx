import React from 'react';
import { Box, Center, Text, Container, Heading, Button, ButtonGroup } from '@chakra-ui/react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { discordLink, twitterLink } from '@app/util/constants';
import { FaDiscord, FaTwitter } from 'react-icons/fa';

/**
 * We redirect users to this page after they successfuelly redeem a gift
 */
const Page: NextPage = () => {
    return (
        <Container maxW="container.lg">
            <Center>
                <Box experimental_spaceY={4}>
                    <Heading as="p" textAlign={'center'}>
                        You successfully redeemed a gift! 🎉
                    </Heading>
                </Box>
            </Center>
        </Container>
    );
};

export default Page;
