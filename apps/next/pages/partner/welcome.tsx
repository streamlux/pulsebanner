import { Container, Center, Box, Heading, Text, OrderedList, ListItem, Tag, HStack, Link, Button, useColorMode, Wrap, WrapItem } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export default function Page() {
    const { colorMode } = useColorMode();
    const router = useRouter();
    return (
        <>
            <Center mb="8">
                <Box maxW={['95vw']} background={colorMode === 'dark' ? 'gray.700' : 'blackAlpha.200'} mx="2" py="2" rounded="md">
                    <Center id="nav-links" fontSize={['sm', 'md']} px="5vw">
                        <Wrap spacing={['4', '8', '8', '8']}>
                            <WrapItem>
                                <NextLink href="/partner/welcome" passHref>
                                    <Link fontWeight={'bold'} textDecoration='underline'>Welcome</Link>
                                </NextLink>
                            </WrapItem>
                            <WrapItem>
                                <NextLink href="/partner/dashboard" passHref>
                                    <Link>Dashboard</Link>
                                </NextLink>
                            </WrapItem>
                        </Wrap>
                    </Center>
                </Box>
            </Center>
            <Container maxW="container.md" fontSize={'lg'} experimental_spaceY={6}>
                <HStack>
                    <Heading size="lg">
                        Welcome to the PulseBanner Partner Program
                        <Tag colorScheme={'blue'} h="full" mt={['1', '2']} ml="1">
                            Beta
                        </Tag>
                    </Heading>
                </HStack>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Introduction from Alex</Heading>
                    <Text>
                        Thank you all for supporting PulseBanner, you have no idea how much all of your support has motivated and inspired Andrew and I (Alex) to keep improving and
                        building PulseBanner. Being such a small company, any amount of support goes a long way.
                    </Text>
                </Box>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Our goals at PulseBanner</Heading>
                    <OrderedList>
                        <ListItem>Be honest and transparent with our users and customers.</ListItem>
                        <ListItem>Create an inclusive and supportive community.</ListItem>
                        <ListItem>Empower creators by building innovative and unique tools.</ListItem>
                    </OrderedList>
                    <Text>These goals go into each and every decision we make, and we select Partners based on these goals.</Text>
                </Box>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Program Overview</Heading>
                    <OrderedList>
                        <ListItem>
                            This program is as hands-off as it gets. There will be no obligations or expectations from us. No rules like “must make 1 tweet mentioning PulseBanner
                            per day”. You can do as much or as little promotion of PulseBanner as you want, it&#39;s all up to you.
                        </ListItem>
                        <ListItem>
                            If you do decide to promote PulseBanner in any fashion, please make it clear that you do in fact get something in return for getting people to subscribe
                            using your discount code. We are an honest and transparent company and we want our partners to uphold this.
                        </ListItem>
                        <ListItem>
                            Do not use the Partner Program as a selling point for PulseBanner Memberships. We don&#39;t want to mislead anyone into thinking PulseBanner Members
                            automatically get to be PulseBanner Partners.
                        </ListItem>
                        <ListItem>
                            Each partner will get their own discount code that they can share with their community. When your code is used to purchase a subscription, after two
                            weeks (refund period) we will add a credit of the corresponding amount to your account. More details about how credits work are in the following
                            section.
                        </ListItem>
                    </OrderedList>
                </Box>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Partner Program Rewards</Heading>
                    <Text>
                        Credits you earn from referrals will go towards your subscription payments (monthly or yearly). <strong>Currently, credits cannot be withdrawn.</strong> If
                        you have earned more credits than your next subscription payments price, the extra credits will carry over to the next payment period. With the limited
                        resources we had to deliver a partner program and provide it to our users, this was the best option. If you want more explanation or have questions please
                        feel free to ask us (complicated taxes is a big one 😅).
                    </Text>
                    <Text>
                        We want to play this by ear and see how it goes, (hence why we&#39;re doing a beta). If ya&#39;ll absolutely kill it and earn more credits than you could
                        ever use paying for your Membership costs, then we will most likely add the ability to withdraw the cash value.
                    </Text>
                    <Text>
                        For now, we are thinking that instead of withdrawing extra credits, you can purchase PulseBanner subscriptions to give away to your community. We realize
                        this might not be as good as cash in hand, but we hope you appreciate our compromise. We haven&#39;t built this yet, but plan to.
                    </Text>
                </Box>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Beta</Heading>
                    <Text>
                        For those that might not know, Andrew and I are the only ones behind PulseBanner. The marketing, engineering, design, etc. We also both work full-time jobs
                        during the day.
                    </Text>
                    <Text>
                        Unfortunately this means we may not be as responsive as a larger company, and that new feature additions may take longer to release (we try our best!).
                        Despite that, we believe that with your help, we can make the PulseBanner Partner Program special. Being our beta users, we would love to hear any and all
                        feedback before moving to a full release (including ideas!). This is why the Partner Program is starting it&#39;s life as a beta. Being a beta means that
                        things might change a lot, and there could be some hiccups along the way. But the whole time we will be as transparent and communicative as possible to our
                        Partners.
                    </Text>
                </Box>
                <Box experimental_spaceY={4}>
                    <Heading size="md">Questions</Heading>
                    <Text>
                        Please do not hesitate to reach out to us with any questions or concerns you might have. The absolute best place to reach us is on Discord, second best is
                        to DM{' '}
                        <NextLink href="https://twitter.com/pulsebanner" passHref>
                            <Button as="a" variant="link" colorScheme={'twitter'}>
                                @PulseBanner
                            </Button>
                        </NextLink>{' '}
                        on Twitter. We will be setting up a Partner channel in our Discord, or you can DM Andrew (A1Day1#3993) or Alex (mac#4164) on Discord. You can also email us
                        at{' '}
                        <NextLink href="mailto:contact@pulsebanner.com" passHref>
                            <Button as="a" variant="link" colorScheme={'twitter'}>
                                contact@pulsebanner.com
                            </Button>
                        </NextLink>
                        .
                    </Text>
                </Box>
            </Container>
        </>
    );
}
