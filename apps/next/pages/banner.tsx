import { Badge, Box, Button, Checkbox, Container, Flex, Heading, HStack, Spacer, useBoolean, useDisclosure, VStack } from '@chakra-ui/react';
import type { Banner, Subscription } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaCheck, FaPlay, FaStop, FaTwitch, FaTwitter } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { signIn } from 'next-auth/react';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { StarIcon } from '@chakra-ui/icons';

const bannerEndpoint = '/api/features/banner';

export default function Page() {
    const { data, mutate, isValidating } = useSWR<Banner>('banner', async () => (await fetch(bannerEndpoint)).json());
    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'CSSBackground');
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>((data?.foregroundId as keyof typeof ForegroundTemplates) ?? 'ImLive');
    const [bgProps, setBgProps] = useState(data?.backgroundProps ?? ({} as any));
    const [fgProps, setFgProps] = useState(data?.foregroundProps ?? ({} as any));
    const [watermark, setWatermark] = useState(true);

    // call subscription endpoint here to get back their status. 3 statuses: free (obj is null), personal, professional
    const { data: subscriptionStatus } = useSWR<any>('subscription', async () => await (await fetch('/api/user/subscription')).json());

    const availableForAccount = (subscriptionStatus: Subscription): boolean => {
        if (subscriptionStatus === undefined || subscriptionStatus[0] === undefined) {
            return false;
        }
        // add additional checks when we are actually offering stuff for professional
        return true;
    };

    useEffect(() => {
        setBgId((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'CSSBackground');
        setFgId((data?.foregroundId as keyof typeof ForegroundTemplates) ?? 'ImLive');
        setBgProps(data?.backgroundProps ?? {});
        setFgProps(data?.foregroundProps ?? {});
    }, [data]);

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const [isToggling, { on, off }] = useBoolean(false);

    const saveSettings = async () => {
        // ensure user is signed up before saving settings
        if (ensureSignUp()) {
            const response = await axios.post(bannerEndpoint, {
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
            on();
            await axios.put(bannerEndpoint);
            off();
            mutate({
                ...data,
                enabled: !data.enabled,
            });
        }
    };

    const Form = BackgroundTemplates[bgId].form;
    const FgForm = ForegroundTemplates[fgId].form;

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();

    return (
        <>
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection="row" justifyContent="space-between">
                    <Heading fontSize="3xl" alignSelf="end">
                        Setup Twitch live banner
                    </Heading>

                    <VStack>
                        <Button
                            colorScheme={data && data.enabled ? 'red' : 'green'}
                            justifySelf="flex-end"
                            isLoading={isToggling}
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
                                watermark: availableForAccount(subscriptionStatus) ? watermark : true,
                            }}
                        />
                    </RemotionPreview>

                    <Box p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full">
                        <Heading fontSize="3xl">Banner settings</Heading>
                        <Flex justifyContent="space-between" p="2">
                            <HStack>
                                <Checkbox
                                    colorScheme="purple"
                                    defaultChecked={watermark}
                                    isChecked={availableForAccount(subscriptionStatus) ? watermark : true}
                                    size="lg"
                                    onChange={(e) => {
                                        e.preventDefault();
                                        if (availableForAccount(subscriptionStatus) === false) {
                                            pricingToggle();
                                        } else {
                                            setWatermark(!watermark);
                                        }
                                    }}
                                >
                                    Show watermark
                                </Checkbox>
                                <Button colorScheme="teal" variant="ghost" onClick={() => pricingToggle()}>
                                    <StarIcon />
                                    Premium
                                </Button>
                            </HStack>
                            <Button onClick={saveSettings}>Save settings</Button>
                        </Flex>
                        <VStack spacing="8">
                            <FgForm setProps={setFgProps} props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }} />
                            <Form setProps={setBgProps} props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }} />
                        </VStack>
                        <Flex justifyContent="space-between" p="2">
                            <Checkbox
                                colorScheme="purple"
                                isChecked={true}
                                size="lg"
                                onChange={(e) => {
                                    e.preventDefault();
                                    pricingToggle();
                                }}
                            >
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
                                leftIcon={data && data.enabled ? <FaStop /> : <FaPlay />}
                                px="8"
                                isLoading={isToggling}
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
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}
