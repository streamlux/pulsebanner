import {
    Box,
    Button,
    ButtonGroup,
    Center,
    Container,
    Heading,
    HStack,
    SimpleGrid,
    VStack,
    Wrap,
    WrapItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useColorModeValue,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Composer } from '@pulsebanner/remotion/components';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { FaPlay, FaStop } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';

export default function Page() {
    const { data, mutate } = useSWR<Banner>('banner', async () => (await fetch('/api/banner')).json());

    const upsertBanner = async () => {
        const response = await axios.post('/api/banner?templateId=123');
        mutate();
    };

    const toggle = async () => {
        await axios.put('/api/banner');
        mutate({
            ...data,
            enabled: !data.enabled,
        });
    };

    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>('GradientBackground');
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>('TwitchStream');
    const [bgProps, setBgProps] = useState({} as any);
    const [fgProps, setFgProps] = useState({} as any);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isFgOpen, onOpen: onFgOpen, onClose: onFgClose } = useDisclosure();
    const { isOpen: isDOpen, onOpen: onDOpen, onClose: onDClose } = useDisclosure();
    const alpha = useColorModeValue('blackAlpha', 'whiteAlpha');

    const BgSelection = (
        <Wrap py="2">
            {Object.entries(BackgroundTemplates).map(([key, background]) => (
                <WrapItem
                    key={key}
                    onClick={() => setBgId(key as keyof typeof BackgroundTemplates)}
                    cursor="pointer"
                    bg={bgId === key ? `${alpha}.200` : undefined}
                    rounded="md"
                    w="full"
                    p="2"
                    transition="all"
                    transitionDuration="0.2s"
                    _hover={{ bg: `${alpha}.200` }}
                >
                    <VStack w="full">
                        <Heading fontSize="md" w="full">
                            {background.name}
                        </Heading>
                        <Box w="full">
                            <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                                <Composer
                                    {...{
                                        backgroundId: key as keyof typeof BackgroundTemplates,
                                        foregroundId: fgId,
                                        backgroundProps: { ...BackgroundTemplates[key as keyof typeof BackgroundTemplates].defaultProps, ...bgProps },
                                        foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps },
                                        watermark: true,
                                    }}
                                />
                            </RemotionPreview>
                        </Box>
                    </VStack>
                </WrapItem>
            ))}
        </Wrap>
    );

    return (
        <Container centerContent maxW="container.lg" experimental_spaceY="4">
            <HStack w="full">
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
            </HStack>
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
            <Button onClick={onOpen}>Open Modal</Button>
            <Button colorScheme="teal" onClick={onDOpen}>
                Open drawer
            </Button>
            <Drawer isOpen={isDOpen} placement="right" onClose={onDClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Create your account</DrawerHeader>

                    <DrawerBody>{BgSelection}</DrawerBody>

                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onDClose}>
                            Cancel
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Choose background</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{BgSelection}</ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Button onClick={onFgOpen}>Open Modal</Button>
            <Modal isOpen={isFgOpen} onClose={onFgClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Heading fontSize="xl">Backgrounds</Heading>

                        <Wrap py="2">
                            {Object.entries(ForegroundTemplates).map(([key, background]) => (
                                <WrapItem
                                    key={key}
                                    onClick={() => setFgId(key as keyof typeof ForegroundTemplates)}
                                    cursor="pointer"
                                    bg="whiteAlpha.100"
                                    rounded="md"
                                    p="2"
                                    transition="ease-in"
                                    transitionDuration="100"
                                    _hover={{ bg: 'whiteAlpha.300', transition: 'ease-in', transitionDuration: '200' }}
                                >
                                    <VStack>
                                        <Heading fontSize="md" w="full">
                                            {background.name}
                                        </Heading>
                                        <Box w="xs">
                                            <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                                                <Composer
                                                    {...{
                                                        backgroundId: bgId,
                                                        foregroundId: key as keyof typeof ForegroundTemplates,
                                                        backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                                        foregroundProps: { ...ForegroundTemplates[key as keyof typeof ForegroundTemplates].defaultProps, ...fgProps },
                                                        watermark: true,
                                                    }}
                                                />
                                            </RemotionPreview>
                                        </Box>
                                    </VStack>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Center>
                {BackgroundTemplates[bgId].form({
                    setProps: setBgProps,
                    props: bgProps,
                    showPricing: () => {
                        console.error('Not implemented yet!');
                    },
                })}
            </Center>
        </Container>
    );
}
