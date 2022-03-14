import React from 'react';
import { Box, Center, Text, Container, Heading, Button, ButtonGroup } from '@chakra-ui/react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { discordLink, twitterLink } from '@app/util/constants';
import { FaDiscord, FaTwitter } from 'react-icons/fa';

/**
 * We redirect users to this page if they try to redeem a gift that's already been redeemed.
 */
const Page: NextPage = () => {
    return (
        <Container maxW="container.lg">
            <Center>
                <Box experimental_spaceY={4}>
                    <Heading as="p" textAlign={'center'}>
                        Uh oh! This gift has already been redeemed
                    </Heading>

                    <Text fontSize="lg" textAlign={'center'}>
                        If you think this is a mistake, please join message us in our Discord or DM us on Twitter.
                    </Text>

                    <Center>
                        <ButtonGroup>
                            <NextLink passHref href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </NextLink>
                            <NextLink passHref href={twitterLink}>
                                <Button as="a" size="sm" colorScheme="twitter" rightIcon={<FaTwitter />}>
                                    Twitter
                                </Button>
                            </NextLink>
                        </ButtonGroup>
                    </Center>
                </Box>
            </Center>
        </Container>
    );
};

export default Page;
