import {
    Box,
    Button,
    Center,
    Container,
    Heading,
    Spacer,
    VStack,
    Text,
    Image,
    useColorMode,
    Wrap,
    WrapItem,
    Stack,
    Switch,
    FormControl,
    FormLabel,
    Tag,
    HStack,
} from '@chakra-ui/react';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { FaTwitch, FaTwitter, FaCheck, FaArrowRight } from 'react-icons/fa';
import banner from '@app/public/banner.png';
import bannerHover from '@app/public/banner_hover.png';
import bannerLightPng from '@app/public/banner_light.png';
import profileImage from '@app/public/profileimage.png';
import nameChanger from '@app/public/namechanger.png';
import nameChangerLight from '@app/public/namechanger_light.png';
import twitterxtwitch from '@app/public/twitterxtwitch.png';
import twitterxtwitchLight from '@app/public/twitterxtwitch_light.png';
import showcase from '@app/public/showcase.png';
import showcaseLight from '@app/public/showcase_light.png';
import showcaseOffline from '@app/public/showcase_offline.png';
import showcaseOfflineLight from '@app/public/showcase_offline_light.png';

function useHover<T>(): [MutableRefObject<T>, boolean] {
    const [value, setValue] = useState<boolean>(false);
    const ref: any = useRef<T | null>(null);
    const handleMouseOver = (): void => setValue(true);
    const handleMouseOut = (): void => setValue(false);
    useEffect(
        () => {
            const node: any = ref.current;
            if (node) {
                node.addEventListener('mouseover', handleMouseOver);
                node.addEventListener('mouseout', handleMouseOut);
                return () => {
                    node.removeEventListener('mouseover', handleMouseOver);
                    node.removeEventListener('mouseout', handleMouseOut);
                };
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref.current] // Recall only if ref changes
    );
    return [ref, value];
}

export default function Page() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = useSession({ required: false }) as any;

    const { colorMode } = useColorMode();

    const [offline, setOffline] = useState(false);

    return (
        <VStack spacing="16">
            <Box>
                <VStack>
                    <Container centerContent maxW="container.xl" experimental_spaceY="16">
                        <Stack direction={['column', 'row']} spacing={16}>
                            <Center>
                                <Box experimental_spaceY={8}>
                                    <Heading size="3xl" textAlign="left">
                                        Stand out on Twitter
                                    </Heading>
                                    <Heading size="lg" textAlign="left">
                                        Sync your Twitter profile with Twitch
                                    </Heading>
                                    <Box maxW="200px" w="60vw">
                                        {colorMode === 'dark' ? (
                                            <Image src={typeof twitterxtwitch === 'string' ? twitterxtwitch : twitterxtwitch.src} alt="Banner" />
                                        ) : (
                                            <Image src={typeof twitterxtwitchLight === 'string' ? twitterxtwitchLight : twitterxtwitchLight.src} alt="Banner" />
                                        )}
                                    </Box>
                                    <Box experimental_spaceY={4}>
                                        <Text fontSize="xl" textAlign="left">
                                            Use for free, upgrade anytime for $7.99/mo. No strings attached.
                                        </Text>
                                        <Button size="lg" colorScheme="green" rightIcon={<FaArrowRight />}>
                                            Level up your Twitter game
                                        </Button>
                                    </Box>
                                </Box>
                            </Center>
                            <Box>
                                <Center>
                                    <Box maxW="600px" p="1" bg="green.200" rounded="lg">
                                        {!offline ? (
                                            colorMode === 'dark' ? (
                                                <Image rounded="lg" alt="showcase" src={typeof showcase === 'string' ? showcase : showcase.src} />
                                            ) : (
                                                <Image rounded="lg" alt="showcase" src={typeof showcaseLight === 'string' ? showcaseLight : showcaseLight.src} />
                                            )
                                        ) : colorMode === 'dark' ? (
                                            <Image rounded="lg" alt="showcase" src={typeof showcaseOffline === 'string' ? showcaseOffline : showcaseOffline.src} />
                                        ) : (
                                            <Image rounded="lg" alt="showcase" src={typeof showcaseOfflineLight === 'string' ? showcaseOfflineLight : showcaseOfflineLight.src} />
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
                            </Box>
                        </Stack>

                        <Center py="32">
                            <Container maxW="container.lg" w="90vw" experimental_spaceY={48}>
                                <Box>
                                    <Box experimental_spaceY={4}>
                                        <HStack>
                                            <Heading size="2xl" textAlign="left">
                                                Twitter Live Banner
                                            </Heading>

                                            <Tag colorScheme="green" size="lg">
                                                FREE
                                            </Tag>
                                        </HStack>
                                        <Text size="lg">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam similique iste, nostrum exercitationem qui ex sed repellendus velit
                                            voluptate expedita beatae reprehenderit placeat unde quia rerum explicabo repellat reiciendis harum?
                                        </Text>
                                    </Box>

                                    <Center py="8">
                                        <Box maxW="1000">
                                            {colorMode === 'dark' ? (
                                                <Image src={typeof banner === 'string' ? banner : banner.src} alt="Banner" />
                                            ) : (
                                                <Image src={typeof bannerLightPng === 'string' ? bannerLightPng : bannerLightPng.src} alt="Banner" />
                                            )}
                                        </Box>
                                    </Center>
                                    <Button size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                        Setup Live Banner
                                    </Button>
                                </Box>
                                <Box>
                                    <Box experimental_spaceY={4}>
                                        <HStack>
                                            <Heading size="2xl" textAlign="left">
                                                Twitter Live Profile
                                            </Heading>

                                            <Tag colorScheme="blue" size="lg">
                                                Premium
                                            </Tag>
                                        </HStack>
                                        <Text size="lg">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam similique iste, nostrum exercitationem qui ex sed repellendus velit
                                            voluptate expedita beatae reprehenderit placeat unde quia rerum explicabo repellat reiciendis harum?
                                        </Text>
                                    </Box>
                                    <Center py="8">
                                        <Image src={typeof profileImage === 'string' ? profileImage : profileImage.src} alt="Banner" w="80vw" maxW="800px" py="10" />
                                    </Center>
                                    <Button size="lg" rightIcon={<FaArrowRight />} colorScheme="green">
                                        Setup Live Profile
                                    </Button>
                                </Box>
                                <Box>
                                    <Box experimental_spaceY={4}>
                                        <HStack>
                                            <Heading size="2xl" textAlign="left">
                                                Twitter Name Changer
                                            </Heading>

                                            <Tag colorScheme="green" size="lg">
                                                FREE
                                            </Tag>
                                        </HStack>
                                        <Text size="lg">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam similique iste, nostrum exercitationem qui ex sed repellendus velit
                                            voluptate expedita beatae reprehenderit placeat unde quia rerum explicabo repellat reiciendis harum?
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
                        <Box maxW="400px" w="60vw">
                            {colorMode === 'dark' ? (
                                <Image src={typeof twitterxtwitch === 'string' ? twitterxtwitch : twitterxtwitch.src} alt="Banner" />
                            ) : (
                                <Image src={typeof twitterxtwitchLight === 'string' ? twitterxtwitchLight : twitterxtwitchLight.src} alt="Banner" />
                            )}
                        </Box>
                        <Box>
                            <Heading textAlign="center">5 minute setup.</Heading>
                            <Text textAlign="center">Use it for free! Upgrade anytime for $7.99/mo.</Text>
                            <Center mt="8">
                                <Button size="lg" leftIcon={<FaTwitter />}>
                                    Level up your Twitter game
                                </Button>
                            </Center>
                        </Box>
                    </Container>
                </VStack>
            </Box>
            <Center>
                <Box>
                    <VStack>
                        <Button onClick={() => signIn('twitter')} colorScheme="twitter" leftIcon={<FaTwitter />} rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}>
                            Connect to Twitter
                        </Button>
                        <Button onClick={() => signIn('twitch')} colorScheme="twitch" leftIcon={<FaTwitch />} rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}>
                            Connect to Twitch
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </VStack>
    );
}
