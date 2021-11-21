import {
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Select,
    Spacer,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useBreakpoint,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import type { Banner, Subscription } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaPlay, FaStop } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { StarIcon } from '@chakra-ui/icons';

const bannerEndpoint = '/api/features/banner';

export default function Page() {
    const { data, mutate, isValidating } = useSWR<Banner>('banner', async () => (await fetch(bannerEndpoint)).json());
    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'GradientBackground');
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>((data?.foregroundId as keyof typeof ForegroundTemplates) ?? 'ImLive');
    const [bgProps, setBgProps] = useState(data?.backgroundProps ?? ({} as any));
    const [fgProps, setFgProps] = useState(data?.foregroundProps ?? ({} as any));
    const [watermark, setWatermark] = useState(true);

    const breakpoint = useBreakpoint();

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
        setBgId((data?.backgroundId as keyof typeof BackgroundTemplates) ?? 'GradientBackground');
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
            await saveSettings();
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

    const showPricing = () => {
        pricingToggle();
    };

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

                <Flex w="full" rounded="md" direction="column">
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

                    <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full" direction="column" minH="lg">
                        <Tabs colorScheme="purple" flexGrow={1}>
                            <TabList>
                                <Tab>Banner</Tab>
                                <Tab>Background</Tab>
                            </TabList>

                            <TabPanels flexGrow={1}>
                                <TabPanel>
                                    <FgForm setProps={setFgProps} props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }} showPricing={showPricing} />
                                </TabPanel>
                                <TabPanel>
                                    <FormControl id="country">
                                        <FormLabel>Background type</FormLabel>
                                        <Select
                                            value={bgId}
                                            w="xs"
                                            onChange={(e) => {
                                                setBgId(e.target.value as keyof typeof BackgroundTemplates);
                                            }}
                                        >
                                            {Object.entries(BackgroundTemplates).map(([key, value]) => (
                                                <option key={key} value={key}>
                                                    {value.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Form setProps={setBgProps} props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }} showPricing={showPricing} />
                                </TabPanel>
                                <TabPanel>
                                    <p>three!</p>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                        <HStack p="2">
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
                            {breakpoint === 'base' && <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" />}
                            {breakpoint !== 'base' && (
                                <Button leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => pricingToggle()}>
                                    Premium
                                </Button>
                            )}
                        </HStack>
                        <Flex justifyContent="space-between" direction={['column', 'row']}>
                            <Spacer />
                            <Button onClick={saveSettings}>Save settings</Button>
                        </Flex>
                    </Flex>
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
                </Flex>
            </Container>

            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}
