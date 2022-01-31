import {
    Box,
    Button,
    Center,
    Container,
    Heading,
    VStack,
    Text,
    Image,
    useColorMode,
    Stack,
    Switch,
    FormControl,
    FormLabel,
    Tag,
    HStack,
    SimpleGrid,
    Icon,
    useBreakpoint,
    Link,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Flex,
    WrapItem,
    Wrap,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaTwitter, FaCheck, FaArrowRight } from 'react-icons/fa';
import NextLink from 'next/link';
import { Testimonial } from '@app/components/landing/Testimonial';

interface StaticAsset {
    src: string;
    preload?: boolean;
}

const staticAssets: Record<string, StaticAsset> = {
    showcase: {
        preload: true,
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase.webp',
    },
    showcaseOffline: {
        preload: true,
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_offline.webp',
    },
    showcaseLight: {
        preload: true,
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_light.webp',
    },
    showcaseLightOffline: {
        preload: true,
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_offline_light.webp',
    },
    mayjaAvatar: {
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/avatars/mayja.webp',
    },
    toxikAvatar: {
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/avatars/toxik.webp',
    },
    rheddGhostAvatar: {
        src: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/avatars/rheddghost.webp',
    },
};

const landingPageAsset = (name: string) => `https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/${name}.webp`;

import Head from 'next/head';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { NextSeo } from 'next-seo';
import { trackEvent } from '@app/util/umami/trackEvent';

export default function Page() {
    const { colorMode } = useColorMode();
    const breakpoint = useBreakpoint('ssr');

    const [offline, setOffline] = useState(false);

    const tweetText = 'Stand out on Twitter with @PulseBanner!\n\nMagically ✨ sync your Twitter profile to #Twitch! Get it for free today at pulsebanner.com!\n\n#PulseBanner';

    const SignUpButton = (
        <Box experimental_spaceY={2} pt={['6']} minW="12" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
            <Heading textAlign="left">1 minute setup.</Heading>
            <Text as="span" fontSize="sm" textAlign="left">
                Use for <strong>free forever</strong>, or upgrade anytime for{' '}
            </Text>
            <Popover trigger="hover" placement="top">
                <PopoverTrigger>
                    <Text fontSize="sm" as="span" textDecoration="underline" textDecorationStyle="dashed" textUnderlineOffset="2px">
                        $5.99*/mo
                    </Text>
                </PopoverTrigger>
                <PopoverContent w="fit-content">
                    <PopoverArrow />
                    <PopoverBody w="fit-content">
                        <Text>Personal plan, annual billing</Text>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
            <Text as="span">.</Text>

            <Flex experimental_spaceX={4}>
                <Button
                    size="lg"
                    colorScheme="twitter"
                    leftIcon={<FaTwitter />}
                    className={trackEvent('click', 'hero-signup')}
                    onClick={() => {
                        signIn('twitter', {
                            callbackUrl: '/banner',
                        });
                    }}
                >
                    Sign in with Twitter
                </Button>
                <Center>
                    <Box w="128px">
                        {colorMode === 'dark' ? (
                            <Image src={landingPageAsset('twitterxtwitch')} alt="Banner" />
                        ) : (
                            <Image src={landingPageAsset('twitterxtwitch_light')} alt="Banner" />
                        )}
                    </Box>
                </Center>
            </Flex>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                {'By signing up, you agree to our'}{' '}
                <Box as={NextLink} href="/terms" passHref>
                    <Link textDecoration="underline">Terms</Link>
                </Box>{' '}
                and{' '}
                <Link as={NextLink} href="/privacy" passHref>
                    <Link textDecoration="underline">Privacy Policy</Link>
                </Link>
                .
            </Text>
        </Box>
    );

    return (
        <>
            <Head>
                {Object.values(staticAssets)
                    .filter((asset) => asset.preload)
                    .map((asset) => (
                        <link key={asset.src} rel="preload" href={asset.src} as="image" />
                    ))}
            </Head>
            <NextSeo
                title="Stand out on Twitter"
                openGraph={{
                    site_name: 'PulseBanner',
                    type: 'website',
                    url: 'https://pulsebanner.com/',
                    title: 'PulseBanner - Stand out on Twitter',
                    description: 'Stand out on Twitter and attract more viewers to your stream',
                    images: [
                        {
                            url: 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/seo/pulsebanner_og.webp',
                            width: 1200,
                            height: 627,
                            alt: 'Stand out on Twitter with PulseBanner!',
                        },
                    ],
                }}
                twitter={{
                    site: '@PulseBanner',
                    cardType: 'summary_large_image',
                }}
            />
            <VStack spacing="16">
                <Box>
                    <VStack>
                        <Box w={['90vw', '80vw', '80vw', '80vw', '90vw', '90vw', '60vw']} maxW={1300} experimental_spaceY="16">
                            <Stack direction={['column', 'column', 'column', 'column', 'row']} spacing={[8, 16]}>
                                <Center maxW={['100%', '100%', '100%', '100%', '47%']}>
                                    <Box experimental_spaceY={[4, 8]}>
                                        <Heading size="3xl" textAlign="left">
                                            Stand out on{' '}
                                            <Box as="span" color="twitter.400">
                                                Twitter
                                            </Box>
                                        </Heading>
                                        <Text fontSize="2xl" textAlign="left" color={colorMode === 'dark' ? 'gray.200' : 'gray.600'}>
                                            Sync your Twitter profile with your Twitch stream. Promote your stream like never before.
                                        </Text>

                                        <SimpleGrid w="fit-content" columns={[1, 1, 2, 2, 2]} spacingY={2} spacingX={6}>
                                            <HStack>
                                                <Text>
                                                    <Icon as={FaCheck} fontSize="sm" color="green.300" mr="1" />
                                                    Automatic Twitter banner
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text>
                                                    <Icon as={FaCheck} fontSize="sm" color="green.300" mr="1" />
                                                    Preview stream with thumbnail
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text>
                                                    <Icon as={FaCheck} fontSize="sm" color="green.300" mr="1" />
                                                    Twitter name changer
                                                </Text>
                                            </HStack>
                                            <HStack>
                                                <Text>
                                                    <Icon as={FaCheck} fontSize="sm" color="green.300" mr="1" />
                                                    <Text as="span">Automatic Twitter profile picture</Text>
                                                </Text>
                                            </HStack>
                                        </SimpleGrid>
                                        {breakpoint !== 'base' && SignUpButton}
                                    </Box>
                                </Center>

                                <Stack direction={['column-reverse', 'column-reverse', 'column-reverse', 'column-reverse', 'column']}>
                                    <Center>
                                        <Box maxW="700px" p="2" rounded="lg" bg={offline ? 'gray.200' : undefined} className={!offline ? 'animated-gradient' : undefined}>
                                            {!offline ? (
                                                colorMode === 'dark' ? (
                                                    <Image rounded="lg" alt="showcase" src={staticAssets.showcase.src} load />
                                                ) : (
                                                    <Image rounded="lg" alt="showcase" src={staticAssets.showcaseLight.src} />
                                                )
                                            ) : colorMode === 'dark' ? (
                                                <Image rounded="lg" alt="showcase" src={staticAssets.showcaseOffline.src} />
                                            ) : (
                                                <Image rounded="lg" alt="showcase" src={staticAssets.showcaseLightOffline.src} />
                                            )}
                                        </Box>
                                    </Center>
                                    <Center w="full" py="2">
                                        <Box>
                                            <FormControl display="flex" alignItems="center">
                                                <Switch
                                                    id="preview"
                                                    colorScheme="red"
                                                    size="lg"
                                                    defaultChecked={!offline}
                                                    onChange={() => {
                                                        setOffline(!offline);
                                                    }}
                                                />
                                                <FormLabel htmlFor="preview" mb="0" ml="2">
                                                    Preview Live Profile
                                                </FormLabel>
                                            </FormControl>
                                        </Box>
                                    </Center>
                                </Stack>
                            </Stack>

                            {breakpoint === 'base' && SignUpButton}

                            <Center>
                                <Box experimental_spaceY={4}>
                                    <Wrap align="center" justify="center" spacing={8}>
                                        <WrapItem h="full">
                                            <Testimonial
                                                name="RheddGhost"
                                                avatarSrc={staticAssets.rheddGhostAvatar.src}
                                                text="Thank YOU for giving us such a simple and effective service! You help make promotion so much easier!"
                                                link="https://twitch.tv/RheddGhost"
                                                linkText="twitch.tv/rheddghost"
                                            />
                                        </WrapItem>
                                        <WrapItem h="full">
                                            <Testimonial
                                                name="ToxikHeat"
                                                avatarSrc={staticAssets.toxikAvatar.src}
                                                text="I was gonna post a go live tweet but i dont need to because i use @PulseBanner ;) Why arent you using it??"
                                                link="https://twitch.tv/toxikheat"
                                                linkText="twitch.tv/toxikheat"
                                            />
                                        </WrapItem>
                                        <WrapItem h="full">
                                            <Testimonial
                                                name="EMGG Mayja"
                                                avatarSrc={staticAssets.mayjaAvatar.src}
                                                text="The question isn't should I use PulseBanner, but why wouldn't I? No one else provides such an invaluable service!"
                                                link="https://twitch.tv/worldofmayja"
                                                linkText="twitch.tv/worldofmayja"
                                            />
                                        </WrapItem>
                                    </Wrap>

                                    <Center>
                                        <HStack>
                                            <Text>❤️ PulseBanner?</Text>
                                            <NextLink passHref href="https://twitter.com/PulseBanner?ref_src=twsrc%5Etfw">
                                                <Button as="a" target="_blank" size="sm" leftIcon={<FaTwitter />} colorScheme="twitter" className={trackEvent('click', 'tweet-us')}>
                                                    Tweet us!
                                                </Button>
                                            </NextLink>
                                        </HStack>
                                    </Center>
                                </Box>
                            </Center>

                            <Center>
                                <Container maxW="container.lg" w="90vw" experimental_spaceY={[16, 32]}>
                                    <Box>
                                        <Box experimental_spaceY={4}>
                                            <HStack>
                                                <Heading size="2xl" textAlign="left">
                                                    Live Banner
                                                </Heading>

                                                <Tag colorScheme="green" size="lg">
                                                    FREE
                                                </Tag>
                                            </HStack>
                                            <Text fontSize="lg">
                                                Sync your Twitter banner with your Twitch stream. Updates when you go live on Twitch, and changes back when your stream ends.
                                            </Text>
                                        </Box>

                                        <Center py="8">
                                            <Box maxW="1000" minW={['95vw', 'unset']}>
                                                {colorMode === 'dark' ? (
                                                    <Image src={landingPageAsset('banner')} alt="Banner" />
                                                ) : (
                                                    <Image src={landingPageAsset('banner_light')} alt="Banner" />
                                                )}
                                            </Box>
                                        </Center>
                                        <NextLink passHref href="/banner">
                                            <Button as="a" size="lg" rightIcon={<FaArrowRight />} colorScheme="green" className={trackEvent('click', 'customize-banner')}>
                                                Customize your Live Banner
                                            </Button>
                                        </NextLink>
                                    </Box>
                                    <Box>
                                        <Box experimental_spaceY={4}>
                                            <HStack>
                                                <Heading size="2xl" textAlign="left">
                                                    Live Profile
                                                </Heading>
                                                <Tag colorScheme="blue" size="lg">
                                                    Premium
                                                </Tag>
                                            </HStack>
                                            <Text fontSize="lg">
                                                Sync your Twitter profile picture with your Twitch stream. Updates when you go live on Twitch, and changes back when your stream
                                                ends.
                                            </Text>
                                        </Box>
                                        <Center py="8">
                                            <Image src={landingPageAsset('profileimage')} alt="Banner" w="80vw" maxW="800px" py="10" />
                                        </Center>
                                        <NextLink passHref href="/profile">
                                            <Button as="a" size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                                Setup your Live Profile
                                            </Button>
                                        </NextLink>
                                    </Box>
                                    <Box>
                                        <Box experimental_spaceY={4}>
                                            <HStack>
                                                <Heading size="2xl" textAlign="left">
                                                    Name Changer
                                                </Heading>

                                                <Tag colorScheme="green" size="lg">
                                                    FREE
                                                </Tag>
                                            </HStack>
                                            <Text fontSize="lg">
                                                Automatically change your Twitter name when you start streaming, and automatically change it back when your stream ends. Completely
                                                free, and no hassle!
                                            </Text>
                                        </Box>
                                        <Center py="16">
                                            {colorMode === 'dark' ? (
                                                <Image src={landingPageAsset('namechanger')} alt="Banner" w="full" />
                                            ) : (
                                                <Image src={landingPageAsset('namechanger_light')} alt="Banner" w="full" />
                                            )}
                                        </Center>
                                        <NextLink passHref href="/name">
                                            <Button as="a" size="lg" rightIcon={<FaArrowRight />} colorScheme="green" className={trackEvent('click', 'setup-name-changer')}>
                                                Setup Name Changer
                                            </Button>
                                        </NextLink>
                                    </Box>
                                    <Box>
                                        <Box experimental_spaceY={4}>
                                            <HStack>
                                                <Heading size="2xl" textAlign="left">
                                                    Affiliate Program
                                                </Heading>

                                                <Tag colorScheme="blue" size="lg">
                                                    Premium
                                                </Tag>
                                            </HStack>
                                            <Text fontSize="lg">
                                                All PulseBanner members are qualified to apply for our affiliate program. Earn money for every new PulseBanner member that uses your
                                                discount code!
                                            </Text>
                                        </Box>
                                        <NextLink passHref href="/name">
                                            <Button as="a" size="lg" rightIcon={<FaArrowRight />} colorScheme="green" className={trackEvent('click', 'setup-affiliate-program')}>
                                                Setup Affiliate Account
                                            </Button>
                                        </NextLink>
                                    </Box>
                                </Container>
                            </Center>

                            <Box>
                                <Center>
                                    <Box experimental_spaceY={4}>
                                        <Heading textAlign={'center'}>Ready to bring your Twitter profile to life?</Heading>
                                        <Center>
                                            <Text fontSize="xl" textAlign={'center'} maxW="3xl">
                                                {
                                                    'PulseBanner is the best way to get your stream noticed on Twitter. Created for creators by creators. We are loved by hundreds Twitch streamers. Get started now 👇'
                                                }
                                            </Text>
                                        </Center>
                                    </Box>
                                </Center>
                                <Center mt="8">
                                    <Button
                                        size="lg"
                                        leftIcon={<FaTwitter />}
                                        colorScheme="twitter"
                                        className={trackEvent('click', 'bottom-signup')}
                                        onClick={() => {
                                            signIn('twitter', {
                                                callbackUrl: '/banner',
                                            });
                                        }}
                                    >
                                        Sign in with Twitter
                                    </Button>
                                </Center>
                            </Box>

                            <Center py="4">
                                <Box maxW="400px" w="60vw">
                                    {colorMode === 'dark' ? (
                                        <Image src={landingPageAsset('twitterxtwitch')} alt="Banner" />
                                    ) : (
                                        <Image src={landingPageAsset('twitterxtwitch_light')} alt="Banner" />
                                    )}
                                </Box>
                            </Center>

                            <Center>
                                <ShareToTwitter
                                    tweetPreview={
                                        <Text>
                                            Stand out on Twitter with <Link color="twitter.400">@PulseBanner</Link>! <br />
                                            Magically ✨ sync your Twitter profile with <Link color="twitter.400">#Twitch</Link>. Get it for free today at{' '}
                                            <Link color="twitter.500">pulsebanner.com</Link>!
                                            <br />
                                            <Link color="twitter.500">#PulseBanner</Link>
                                        </Text>
                                    }
                                    tweetText={tweetText}
                                />
                            </Center>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </>
    );
}
