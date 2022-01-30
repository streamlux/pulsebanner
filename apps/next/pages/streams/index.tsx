import { Card } from '@app/components/Card';
import prisma from '@app/util/ssr/prisma';
import { Box, Button, ButtonGroup, Center, Container, DarkMode, Heading, HStack, IconButton, Image, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LiveStreams, Price, Subscription, User } from '@prisma/client';
import { GetServerSideProps, GetStaticPaths, GetStaticPathsContext, GetStaticProps, GetStaticPropsContext, PreviewData } from 'next';
import { NextSeo } from 'next-seo';
import { ParsedUrlQuery } from 'querystring';
import { FaTwitch, FaTwitter } from 'react-icons/fa';
import NextLink from 'next/link';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';

interface Props {
    streams: (LiveStreams & {
        user: User & {
            subscription: Subscription & {
                price: Price & {
                    product: {
                        name: string;
                    };
                };
            };
        };
    })[];
    page: number;
    numPages: number;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const resultsPerPage = 29;
    const pageStr = context.query.page ?? '1';
    let page = typeof pageStr === 'string' ? parseInt(pageStr) : 1;
    if (page < 1) {
        page = 1;
    }

    const total = await prisma.liveStreams.count();

    const numPages = Math.ceil(total / resultsPerPage);

    const liveStreams = await prisma.liveStreams.findMany({
        take: resultsPerPage + 1,
        skip: (page - 1) * resultsPerPage,
        include: {
            user: {
                include: {
                    subscription: {
                        include: {
                            price: {
                                include: {
                                    product: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            user: {
                subscription: {
                    id: 'asc',
                },
            },
        },
    });

    return {
        props: {
            streams: liveStreams,
            page,
            numPages,
        },
    };
};

// NOTE: We should potentially allow them to change what it is reverted back to. Would make it easier to handle in the UI and passing it around

export default function Page({ streams, page, numPages }: Props) {
    return (
        <>
            <NextSeo
                title="Twitter Name Changer"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/name',
                    title: 'PulseBanner - Twitter Name Changer',
                    description: 'Easily attract more viewers to your stream from Twitter',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'PulseBanner automates your Twitter Name for free.',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <Container centerContent maxW="container.xl" experimental_spaceY="4">
                <Text>Page: {page}</Text>
                <Text>Num pages: {numPages}</Text>
                <SimpleGrid columns={[1, 2, 3]} spacing={8}>
                    {streams
                        .filter((stream) => stream.streamLink)
                        ?.sort((a, b) => (a.user.subscription === b.user.subscription ? 0 : a.user.subscription ? -1 : 1))
                        .map((stream) => (
                            <Box key={stream.userId}>
                                <VStack>
                                    <Image
                                        alt="Stream thumbnail"
                                        src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${stream.streamLink.substring(8).split('/')[1]}-440x248.jpg`}
                                    />
                                    {/* <Text as="pre">{JSON.stringify(stream, null, 2)}</Text> */}

                                    <HStack w="full" px="2">
                                        <Heading w="full" fontSize="md">
                                            {stream.streamLink.substring(8).split('/')[1]}
                                        </Heading>
                                        <ButtonGroup size="sm">
                                            <NextLink passHref href={stream.streamLink}>
                                                <Button as="a" target="_blank" bg={'#9147ff'} colorScheme="purple" leftIcon={<FaTwitch />}>
                                                    Twitch
                                                </Button>
                                            </NextLink>
                                            <NextLink passHref href={stream.twitterLink}>
                                                <Button as="a" colorScheme={'twitter'} target="_blank" leftIcon={<FaTwitter />}>
                                                    Twitter
                                                </Button>
                                            </NextLink>
                                        </ButtonGroup>
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}
                </SimpleGrid>
                <HStack>
                    <ButtonGroup>
                        <IconButton aria-label="Previous page" icon={<ArrowBackIcon />} />
                        <IconButton aria-label="Next page" icon={<ArrowForwardIcon />} />
                    </ButtonGroup>
                </HStack>
            </Container>
        </>
    );
}
