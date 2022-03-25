import NextLink from 'next/link';
import {
    Box,
    Button,
    Center,
    Divider,
    Heading,
    HStack,
    Link,
    LinkBox,
    LinkOverlay,
    Image,
    List,
    ListItem,
    Spacer,
    Text,
    VStack,
    Wrap,
    WrapItem,
    Container,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import styles from './footer.module.css';
import React from 'react';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { discordLink, instagramLink, tiktokLink, twitterLink } from '@app/util/constants';
import { useRouter } from 'next/router';
import favicon from '@app/public/logo.webp';

export default function Footer() {
    const router = useRouter();
    return (
        <footer className={styles.footer}>
            <Container maxW="container.lg">
                <VStack pb="2" spacing="6">
                    <Spacer />
                    {!router.asPath.startsWith('/admin') && (
                        <VStack spacing="2">
                            <Heading fontSize="lg">Connect with us! 🤠</Heading>
                            <Wrap justify="center">
                                <WrapItem>
                                    <NextLink passHref href="https://twitter.com/PulseBanner?ref_src=twsrc%5Etfw">
                                        <Button as="a" target="_blank" colorScheme="twitter" leftIcon={<FaTwitter />}>
                                            Follow us on Twitter
                                        </Button>
                                    </NextLink>
                                </WrapItem>
                                <WrapItem>
                                    <NextLink passHref href={discordLink}>
                                        <Button as="a" target="_blank" leftIcon={<FaDiscord />}>
                                            Join our Discord
                                        </Button>
                                    </NextLink>
                                </WrapItem>
                            </Wrap>
                        </VStack>
                    )}

                    <Spacer />
                    {/* <Divider maxW={'full'} /> */}
                    <Grid templateColumns="repeat(5, 1fr)" templateRows='repeat(2, 0.2fr)' gap={6} pt='12' pb='4'>
                        <GridItem colSpan={[5, 2]} rowSpan={1}>
                            <VStack align={'left'} mr='4'>
                                <HStack maxH="10" w="200px">
                                    <LinkBox h="full" w="min">
                                        <HStack height="100%">
                                            <Image alt="PulseBanner logo" src={favicon.src} height="40px" width="40px" />
                                            <NextLink href="/" passHref>
                                                <LinkOverlay>
                                                    <Heading size="md" as="h1">
                                                        PulseBanner
                                                    </Heading>
                                                </LinkOverlay>
                                            </NextLink>
                                        </HStack>
                                    </LinkBox>
                                </HStack>
                                <Text color="gray.300" fontSize={'sm'}>
                                    Make your stream stand out on Twitter
                                </Text>
                            </VStack>
                        </GridItem>

                        <GridItem colSpan={[2, 1]} >
                            <Box>
                                <Text size="sm" fontWeight={'semibold'}>
                                    PulseBanner
                                </Text>
                                <List color="gray.300">
                                    <ListItem>
                                        <NextLink href="/faq" passHref>
                                            <Link>FAQ</Link>
                                        </NextLink>
                                    </ListItem>
                                    <ListItem>
                                        <NextLink href="/gifts" passHref>
                                            <Link>Gifts</Link>
                                        </NextLink>
                                    </ListItem>
                                    <ListItem>
                                        <NextLink href="/pricing" passHref>
                                            <Link>Pricing</Link>
                                        </NextLink>
                                    </ListItem>
                                    <ListItem>
                                        <NextLink href="/partner" passHref>
                                            <Link>Partner</Link>
                                        </NextLink>
                                    </ListItem>
                                </List>
                            </Box>
                        </GridItem>
                        <GridItem colSpan={[2, 1]} >
                            <Box>
                                <Text size="sm" fontWeight={'semibold'}>
                                    Company
                                </Text>
                                <List color="gray.300">
                                    <ListItem>
                                        <NextLink href="/privacy" passHref>
                                            <Link>Privacy</Link>
                                        </NextLink>
                                    </ListItem>
                                    <ListItem>
                                        <NextLink href="/terms" passHref>
                                            <Link>Terms</Link>
                                        </NextLink>
                                    </ListItem>
                                    <ListItem>
                                        <NextLink href="/conduct" passHref>
                                            <Link>Conduct</Link>
                                        </NextLink>
                                    </ListItem>
                                </List>
                            </Box>
                        </GridItem>
                        <GridItem colSpan={[1, 1]} >
                            <Box>
                                <Text size="sm" fontWeight={'semibold'}>
                                    Socials
                                </Text>
                                <List color="gray.300">
                                    <ListItem>
                                        <Link isExternal href={discordLink}>
                                            Discord
                                        </Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link isExternal href={twitterLink}>
                                            Twitter
                                        </Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link isExternal href={instagramLink}>
                                            Instagram
                                        </Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link isExternal href={tiktokLink}>
                                            TikTok
                                        </Link>
                                    </ListItem>
                                </List>
                            </Box>
                        </GridItem>
                    </Grid>

                    {/* <Center>
                        <Text>© {new Date().getFullYear()} PulseBanner. All rights reserved.</Text>
                    </Center> */}
                </VStack>
            </Container>
        </footer>
    );
}
