import NextLink from 'next/link';
import { Button, Center, Divider, Heading, Link, Spacer, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import styles from './footer.module.css';
import React from 'react';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
import { discordLink, instagramLink, twitterLink } from '@app/util/constants';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <VStack pb="2" spacing="6">
                <Spacer />

                <VStack spacing="2">
                    <Heading fontSize="lg">Connect with us! 🤠</Heading>
                    <Wrap justify="center">
                        <WrapItem>
                            <Link isExternal href="https://twitter.com/PulseBanner?ref_src=twsrc%5Etfw">
                                <Button colorScheme="twitter" leftIcon={<FaTwitter />} as="a">
                                    Follow us on Twitter
                                </Button>
                            </Link>
                        </WrapItem>
                        <WrapItem>
                            <Link isExternal href={discordLink}>
                                <Button as="a" leftIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </WrapItem>
                    </Wrap>
                </VStack>

                <Spacer />
                <Divider maxW={['56', 'xl']} />

                <Center>
                    <Wrap justify="center" spacing={['2', '6']}>
                        <WrapItem className={styles.navItem}>
                            <Link isExternal href={discordLink}>
                                Discord
                            </Link>
                        </WrapItem>
                        <WrapItem className={styles.navItem}>
                            <Link isExternal href={twitterLink}>
                                Twitter
                            </Link>
                        </WrapItem>
                        <WrapItem className={styles.navItem}>
                            <Link isExternal href={instagramLink}>
                                Instagram
                            </Link>
                        </WrapItem>
                        <WrapItem className={styles.navItem}>
                            <NextLink href="/privacy" passHref>
                                <Link>Privacy</Link>
                            </NextLink>
                        </WrapItem>
                        <WrapItem className={styles.navItem}>
                            <NextLink href="/terms" passHref>
                                <Link>Terms of Use</Link>
                            </NextLink>
                        </WrapItem>
                    </Wrap>
                </Center>
                <Center>
                    <Text>© {new Date().getFullYear()} PulseBanner. All rights reserved.</Text>
                </Center>
            </VStack>
        </footer>
    );
}
