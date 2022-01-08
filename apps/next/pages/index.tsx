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
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaTwitter, FaCheck, FaArrowRight } from 'react-icons/fa';
import banner from '@app/public/banner.png';
import bannerLightPng from '@app/public/landing/banner_light.png';
import profileImage from '@app/public/landing/profileimage.png';
import nameChanger from '@app/public/landing/namechanger.png';
import nameChangerLight from '@app/public/landing/namechanger_light.png';
import twitterxtwitch from '@app/public/landing/twitterxtwitch.png';
import twitterxtwitchLight from '@app/public/landing/twitterxtwitch_light.png';
import NextLink from 'next/link';

const showcase = 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase.webp';
const showcaseOffline = 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_offline.webp';
const showcaseLight = 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_light.webp';
const showcaseLightOffline = 'https://pb-static.sfo3.cdn.digitaloceanspaces.com/landing-page/showcase_offline_light.webp';

export default function Page() {
    const { colorMode } = useColorMode();
    const breakpoint = useBreakpoint();

    const [offline, setOffline] = useState(false);

    const SignUpSection = (
        <Box experimental_spaceY={2} pt={['6']}>
            <Heading textAlign="left">5 minute setup.</Heading>
            <Text fontSize="sm" textAlign="left" color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                Use for free forever, upgrade anytime for{' '}
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
                .
            </Text>

            <HStack spacing={12}>
                <Button size="lg" colorScheme="twitter" leftIcon={<FaTwitter />} onClick={() => signIn('twitter')}>
                    Sign in with Twitter
                </Button>
                <Box w="128px">
                    {colorMode === 'dark' ? (
                        <Image src={typeof twitterxtwitch === 'string' ? twitterxtwitch : twitterxtwitch.src} alt="Banner" />
                    ) : (
                        <Image src={typeof twitterxtwitchLight === 'string' ? twitterxtwitchLight : twitterxtwitchLight.src} alt="Banner" />
                    )}
                </Box>
            </HStack>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                {'By signing up, you agree to our'}{' '}
                <Link as={NextLink} href="/terms" passHref>
                    <Link textDecoration="underline">Terms</Link>
                </Link>{' '}
                and{' '}
                <Link as={NextLink} href="/privacy" passHref>
                    <Link textDecoration="underline">Privacy Policy</Link>
                </Link>
                .
            </Text>
        </Box>
    );

    return (
        <VStack spacing="16">
            <Box>
                <VStack>
                    <Box centerContent w={['90vw', '80vw', '80vw', '80vw', '90vw', '90vw', '60vw']} maxW={1300} experimental_spaceY="16">
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
                                                Twitter name change
                                            </Text>
                                        </HStack>
                                        <HStack>
                                            <Text>
                                                <Icon as={FaCheck} fontSize="sm" color="green.300" mr="1" />
                                                Automatic Twitter profile picture
                                            </Text>
                                        </HStack>
                                    </SimpleGrid>
                                    {breakpoint !== 'base' && SignUpSection}
                                </Box>
                            </Center>

                            <Stack direction={['column-reverse', 'column-reverse', 'column-reverse', 'column-reverse', 'column']}>
                                <Center>
                                    <Box maxW="700px" p="2" rounded="lg" bg={offline ? 'gray.200' : undefined} className={!offline ? 'animated-gradient' : ''}>
                                        {!offline ? (
                                            colorMode === 'dark' ? (
                                                <Image rounded="lg" alt="showcase" src={showcase} />
                                            ) : (
                                                <Image rounded="lg" alt="showcase" src={showcaseLight} />
                                            )
                                        ) : colorMode === 'dark' ? (
                                            <Image rounded="lg" alt="showcase" src={showcaseOffline} />
                                        ) : (
                                            <Image rounded="lg" alt="showcase" src={showcaseLightOffline} />
                                        )}
                                    </Box>
                                </Center>
                                <Center w="full" py="2">
                                    <Box>
                                        <FormControl display="flex" alignItems="center">
                                            <Switch id="live-profile" colorScheme="red" size="lg" defaultChecked={!offline} onChange={() => setOffline(!offline)} />
                                            <FormLabel htmlFor="live-profile" mb="0" ml="2">
                                                Preview Live Profile
                                            </FormLabel>
                                        </FormControl>
                                    </Box>
                                </Center>
                            </Stack>
                        </Stack>

                        {breakpoint === 'base' && SignUpSection}

                        <Center>
                            <Container maxW="container.lg" w="90vw" experimental_spaceY={[16, 48]}>
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
                                                <Image src={typeof banner === 'string' ? banner : banner.src} alt="Banner" />
                                            ) : (
                                                <Image src={typeof bannerLightPng === 'string' ? bannerLightPng : bannerLightPng.src} alt="Banner" />
                                            )}
                                        </Box>
                                    </Center>
                                    <Button size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                        Customize your Live Banner
                                    </Button>
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
                                            Sync your Twitter profile picture with your Twitch stream. Updates when you go live on Twitch, and changes back when your stream ends.
                                        </Text>
                                    </Box>
                                    <Center py="8">
                                        <Image src={typeof profileImage === 'string' ? profileImage : profileImage.src} alt="Banner" w="80vw" maxW="800px" py="10" />
                                    </Center>
                                    <Button size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                        Setup your Live Profile
                                    </Button>
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
                                            <Image src={typeof nameChanger === 'string' ? nameChanger : nameChanger.src} alt="Banner" w="full" />
                                        ) : (
                                            <Image src={typeof nameChangerLight === 'string' ? nameChangerLight : nameChangerLight.src} alt="Banner" w="full" />
                                        )}
                                    </Center>

                                    <Button size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                        Setup Name Changer
                                    </Button>
                                </Box>
                            </Container>
                        </Center>
                        <Center>
                            <Box maxW="400px" w="60vw">
                                {colorMode === 'dark' ? (
                                    <Image src={typeof twitterxtwitch === 'string' ? twitterxtwitch : twitterxtwitch.src} alt="Banner" />
                                ) : (
                                    <Image src={typeof twitterxtwitchLight === 'string' ? twitterxtwitchLight : twitterxtwitchLight.src} alt="Banner" />
                                )}
                            </Box>
                        </Center>
                        <Box>
                            <Center mt="8">
                                <Box rounded="md" p="1" className="animated-gradient">
                                    <Button size="lg" leftIcon={<FaTwitter />} colorScheme="twitter">
                                        Sign in with Twitter
                                    </Button>
                                </Box>
                            </Center>
                        </Box>
                    </Box>
                </VStack>
            </Box>
        </VStack>
    );
}
