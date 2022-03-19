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
                        Successfully redeemed a gift!
                    </Heading>

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
