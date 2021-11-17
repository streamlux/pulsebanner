import { Box, Button, ButtonGroup, Center, Checkbox, Container, Flex, Heading, HStack, Spacer, VStack } from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaPlay, FaStop } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';

export default function Page() {
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

    const upsertBanner = async () => {
        const response = await axios.post('/api/banner', {
            foregroundId: fgId,
            backgroundId: bgId,
            backgroundProps: bgProps,
            foregroundProps: fgProps,
        });
        mutate();
    };

    const toggle = async () => {
        await axios.put('/api/banner');
        mutate({
            ...data,
            enabled: !data.enabled,
        });
    };

    const Form = BackgroundTemplates[bgId].form;
    const FgForm = ForegroundTemplates[fgId].form;

    return (
        <Container centerContent maxW="container.lg" experimental_spaceY="4">
            <Flex w="full" flexDirection="row" justifyContent="space-between">
                <Heading fontSize="3xl" alignSelf="end">
                    Setup Twitch live banner
                </Heading>

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
                        <Button onClick={upsertBanner}>Save settings</Button>
                    </Flex>
                    <VStack spacing="8">
                        <FgForm setProps={setFgProps} props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }} />
                        <Form setProps={setBgProps} props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }} />
                    </VStack>
                    <Flex justifyContent="space-between" p="2">
                        <Checkbox colorScheme="purple" defaultIsChecked size="lg">
                            Show watermark
                        </Checkbox>
                        <Button onClick={upsertBanner}>Save settings</Button>
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
    );
}
