import React from 'react';
import { Box, Center, Text, Container, Heading, Image, Link, VStack, Wrap, WrapItem, Button } from '@chakra-ui/react';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import { discordLink } from '@app/util/constants';
import { FaDiscord } from 'react-icons/fa';

const imgSrc = 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/404.webp';

const Page: NextPage = () => {
    return (
        <Container maxW="container.lg">
            <Center>
                <Box experimental_spaceY={4}>
                    <Heading as="p">
                        <Text as="span" color="red.300">
                            404
                        </Text>{' '}
                        Page not FUCKING found
                    </Heading>
                    <Image src={imgSrc} alt="" />

                    <Center>
                        <VStack spacing={4}>
                            <Box experimental_spaceY={2}>
                                <Heading fontSize="lg">Try one of these pages 👇</Heading>
                                <Center id="nav-links" fontSize="lg">
                                    <Wrap spacing={['2', '4', '8', '10']}>
                                        <WrapItem>
                                            <NextLink href="/banner" passHref>
                                                <Link>Banner</Link>
                                            </NextLink>
                                        </WrapItem>
                                        <WrapItem>
                                            <NextLink href="/pricing" passHref>
                                                <Link>Pricing</Link>
                                            </NextLink>
                                        </WrapItem>
                                    </Wrap>
                                </Center>
                            </Box>
                            <Heading fontSize="lg">Or complain to the developers 🤭</Heading>
                            <Link isExternal href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </VStack>
                    </Center>
                </Box>
            </Center>
        </Container>
    );
};

export default Page;
