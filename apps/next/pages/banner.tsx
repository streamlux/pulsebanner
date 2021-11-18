import {
    BackgroundProps,
    Box,
    Button,
    Center,
    Checkbox,
    Container,
    Flex,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spacer,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaCheck, FaPlay, FaStop, FaTwitch, FaTwitter } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Page() {
    const { data: session } = useSession({ required: false }) as any;

    const { data, mutate } = useSWR<Banner>('banner', async () => (await fetch('/api/banner')).json());
    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'CSSBackground');
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>((data?.foregroundId as keyof typeof ForegroundTemplates) ?? 'ImLive');
    const [bgProps, setBgProps] = useState(data?.backgroundProps ?? ({} as any));
    const [fgProps, setFgProps] = useState(data?.foregroundProps ?? ({} as any));

    useEffect(() => {
        setBgId((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'CSSBackground');
        setFgId((data?.foregroundId as keyof typeof ForegroundTemplates) ?? 'ImLive');
        setBgProps(data?.backgroundProps ?? {});
        setFgProps(data?.foregroundProps ?? {});
    }, [data]);

    // Logic to handle the modal that once opened, helps a user sign up with twitter and connect to twitch

    const router = useRouter();
    const { modal } = router.query;

    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (modal === 'true') {
            if (session && (!session?.accounts?.twitch || !session?.accounts?.twitter)) {
                onOpen();
            }
            router.replace('/banner');
        }
    }, [modal, router, onOpen, session, onClose]);

    const ensureSignUp = () => {
        if (session?.accounts?.twitch && session?.accounts?.twitter) {
            return true;
        }
        onOpen();
        return false;
    };

    const saveSettings = async () => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const response = await axios.post('/api/banner', {
                foregroundId: fgId,
                backgroundId: bgId,
                backgroundProps: bgProps,
                foregroundProps: fgProps,
            });
            mutate();
        }
    };

    const toggle = async () => {
        // ensure user is signed up before enabling banner
        if (ensureSignUp()) {
            await axios.put('/api/banner');
            mutate({
                ...data,
                enabled: !data.enabled,
            });
        }
    };

    const Form = BackgroundTemplates[bgId].form;
    const FgForm = ForegroundTemplates[fgId].form;

    return (
        <>
            <Modal onClose={onClose} size={'xl'} isOpen={isOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Sign up</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb="12">
                        <VStack>
                            <Button
                                onClick={
                                    session?.accounts?.twitter
                                        ? undefined
                                        : () =>
                                              signIn('twitter', {
                                                  callbackUrl: '/banner?modal=true',
                                              })
                                }
                                colorScheme="twitter"
                                leftIcon={<FaTwitter />}
                                rightIcon={session?.accounts?.twitter ? <FaCheck /> : undefined}
                            >
                                Connect to Twitter
                            </Button>
                            {session && (
                                <Button
                                    onClick={() =>
                                        signIn('twitch', {
                                            callbackUrl: '/banner',
                                        })
                                    }
                                    colorScheme="twitch"
                                    leftIcon={<FaTwitch />}
                                    rightIcon={session?.accounts?.twitch ? <FaCheck /> : undefined}
                                >
                                    Connect to Twitch
                                </Button>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection="row" justifyContent="space-between">
                    <Heading fontSize="3xl" alignSelf="end">
                        Setup Twitch live banner
                    </Heading>

                    <VStack>
                        <Button
                            colorScheme={data && data.enabled ? 'red' : 'green'}
                            justifySelf="flex-end"
                            leftIcon={data && data.enabled ? <FaStop /> : <FaPlay />}
                            px="8"
                            onClick={toggle}
                        >
                            {data && data.enabled ? 'Turn off live banner' : 'Turn on live banner'}
                        </Button>
                        <Heading fontSize="lg" w="full" textAlign="center">
                            {data && data.enabled ? 'Your banner is enabled.' : 'Live banner not enabled.'}
                        </Heading>
                    </VStack>
                </Flex>

                <Box w="full" rounded="md">
                    <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                        <Composer
                            {...{
                                backgroundId: bgId,
                                foregroundId: fgId,
                                backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps },
                                watermark: true,
                            }}
                        />
                    </RemotionPreview>

                    <Box p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full">
                        <Heading fontSize="3xl">Banner settings</Heading>
                        <Flex justifyContent="space-between" p="2">
                            <Checkbox colorScheme="purple" defaultIsChecked size="lg">
                                Show watermark
                            </Checkbox>
                            <Button onClick={saveSettings}>Save settings</Button>
                        </Flex>
                        <VStack spacing="8">
                            <FgForm setProps={setFgProps} props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }} />
                            <Form setProps={setBgProps} props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }} />
                        </VStack>
                        <Flex justifyContent="space-between" p="2">
                            <Checkbox colorScheme="purple" defaultIsChecked size="lg">
                                Show watermark
                            </Checkbox>
                            <Button onClick={saveSettings}>Save settings</Button>
                        </Flex>
                    </Box>
                    <Flex w="full" flexDirection="row" justifyContent="space-between">
                        <Spacer />

                        <VStack>
                            <Button
                                colorScheme={data && data.enabled ? 'red' : 'green'}
                                justifySelf="flex-end"
                                disabled={!data}
                                leftIcon={data && data.enabled ? <FaStop /> : <FaPlay />}
                                px="8"
                                onClick={toggle}
                            >
                                {data && data.enabled ? 'Turn off live banner' : 'Turn on live banner'}
                            </Button>
                            <Heading fontSize="lg" w="full" textAlign="center">
                                {data && data.enabled ? 'Your banner is enabled.' : 'Live banner not enabled.'}
                            </Heading>
                        </VStack>
                    </Flex>
                </Box>
            </Container>
        </>
    );
}
