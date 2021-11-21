import { Box, Button, ButtonGroup, Center, Container, Heading, HStack, SimpleGrid, VStack } from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { Composer } from '@pulsebanner/remotion/components';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { FaPlay, FaStop } from 'react-icons/fa';
import { Player } from '@remotion/player';
import { AnyComponent } from 'remotion';
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
            <Box w="full" p="4" bg="gray.700" rounded="md">
                <Heading fontSize="xl">Backgrounds</Heading>

                <SimpleGrid columns={2} spacing="4" py="2">
                    {Object.entries(BackgroundTemplates).map(([key, background]) => (
                        <Box key={key}>
                            <Button onClick={() => setBgId(key as keyof typeof BackgroundTemplates)}>Use {background.name}</Button>
                            <Box w="sm">
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
                        </Box>
                    ))}
                </SimpleGrid>
                <Heading fontSize="xl">Styles</Heading>
                <SimpleGrid columns={2} spacing="4" py="2">
                    {Object.entries(ForegroundTemplates).map(([key, foreground]) => (
                        <Box key={key}>
                            <Button onClick={() => setFgId(key as keyof typeof ForegroundTemplates)}>Use {foreground.name}</Button>
                            <Box w="sm">
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
                        </Box>
                    ))}
                </SimpleGrid>

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
                <Center>
                    {BackgroundTemplates[bgId].form({
                        setProps: setBgProps,
                        props: bgProps,
                        showPricing: () => {
                            console.error('Not implemented yet!');
                        },
                    })}
                </Center>
            </Box>
        </Container>
    );
}
