import {
    Box,
    Button,
    Center,
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
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useBoolean,
    useBreakpoint,
    Text,
    useDisclosure,
    VStack,
    Link,
    useToast,
    Wrap,
    WrapItem,
    SimpleGrid,
} from '@chakra-ui/react';
import type { Banner } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { Composer } from '@pulsebanner/remotion/components';
import { FaDiscord, FaPlay, FaStop } from 'react-icons/fa';
import { RemotionPreview } from '@pulsebanner/remotion/preview';
import { useConnectToTwitch } from '@app/util/hooks/useConnectToTwitch';
import { ConnectTwitchModal } from '@app/modules/onboard/ConnectTwitchModal';
import { PaymentModal } from '@app/components/pricing/PaymentModal';
import { StarIcon } from '@chakra-ui/icons';
import { trackEvent } from '@app/util/umami/trackEvent';
import { ShareToTwitter } from '@app/modules/social/ShareToTwitter';
import { discordLink } from '@app/util/constants';
import { APIPaymentObject, PaymentPlan } from '@app/util/database/paymentHelpers';
import { DisableBannerModal } from '@app/components/banner/DisableBannerModal';
import { useSession } from 'next-auth/react';

const bannerEndpoint = '/api/features/banner';
const defaultForeground: keyof typeof ForegroundTemplates = 'Schedule';
const defaultBackground: keyof typeof BackgroundTemplates = 'GradientBackground';

export default function Page() {
    const [bgId, setBgId] = useState<keyof typeof BackgroundTemplates>(defaultBackground);
    const [fgId, setFgId] = useState<keyof typeof ForegroundTemplates>(defaultForeground);
    const [bgProps, setBgProps] = useState(BackgroundTemplates[defaultBackground].defaultProps as any);
    const [fgProps, setFgProps] = useState(ForegroundTemplates[defaultForeground].defaultProps as any);
    const [watermark, setWatermark] = useState(true);

    const BackgroundTemplate = BackgroundTemplates[bgId];
    const ForegroundTemplate = ForegroundTemplates[fgId];
    const Form = BackgroundTemplate.form;
    const FgForm = ForegroundTemplate.form;

    const sessionInfo = useSession();
    const userId = sessionInfo.data?.userId;

    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());

    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;

    const availableForAccount = (): boolean => {
        if (paymentPlan === 'Free' || !paymentPlanResponse.partner) {
            return false;
        }
        return true;
    };

    const { ensureSignUp, isOpen, onClose, session } = useConnectToTwitch();

    const [isToggling, { on, off }] = useBoolean(false);

    const breakpoint = useBreakpoint();

    const { isOpen: pricingIsOpen, onOpen: pricingOnOpen, onClose: pricingClose, onToggle: pricingToggle } = useDisclosure();
    const { isOpen: disableBannerIsOpen, onClose: disableBannerOnClose, onToggle: bannerDisabledToggle } = useDisclosure();

    const showPricing: (force?: boolean) => boolean = (force?: boolean) => {
        if (!availableForAccount() || force) {
            umami('show-pricing-modal');
            pricingToggle();
            return false;
        }
        return true;
    };

    return (
        <>
            <DisableBannerModal isOpen={disableBannerIsOpen} onClose={disableBannerOnClose} />
            <ConnectTwitchModal session={session} isOpen={isOpen} onClose={onClose} />
            <Container centerContent maxW="container.lg" experimental_spaceY="4">
                <Flex w="full" flexDirection={['column', 'row']} experimental_spaceY={['2', '0']} justifyContent="space-between" alignItems="center">
                    <Box maxW="xl">
                        <Heading as="h1" fontSize={['2xl', '3xl']} alignSelf={['center', 'end']}>
                            Twitch schedule post
                        </Heading>
                        <Heading fontSize="md" fontWeight="normal" as="h2">
                            Create an eye grabbing stream schedule in seconds!
                        </Heading>

                        <HStack pt={['2', '2']} pb={['2', '0']}>
                            <Text textAlign={['center', 'left']} h="full">
                                Need help? Have a suggestion? 👉{' '}
                            </Text>
                            <Link isExternal href={discordLink}>
                                <Button as="a" size="sm" colorScheme="gray" rightIcon={<FaDiscord />}>
                                    Join our Discord
                                </Button>
                            </Link>
                        </HStack>
                    </Box>
                </Flex>
                <Flex w="full" rounded="md" direction="column">
                    <SimpleGrid w="full" columns={[1, 2]}>
                        <Center>
                            <RemotionPreview compositionHeight={1080} compositionWidth={1080} previewStyle={{ maxWidth: '400px' }}>
                                <Composer
                                    {...{
                                        backgroundId: bgId,
                                        foregroundId: fgId,
                                        backgroundProps: { ...BackgroundTemplates[bgId].defaultProps, ...bgProps },
                                        foregroundProps: { ...ForegroundTemplates[fgId].defaultProps, ...fgProps, watermark: availableForAccount() ? watermark : true },
                                    }}
                                />
                            </RemotionPreview>
                        </Center>
                        <Flex grow={1} p="4" my="4" rounded="md" bg="whiteAlpha.100" w="full" direction="column" minH="lg">
                            <Tabs colorScheme="purple" flexGrow={1}>
                                <TabList>
                                    <Tab className={trackEvent('click', 'banner-tab')}>Schedule</Tab>
                                    <Tab className={trackEvent('click', 'background-tab')}>Background</Tab>
                                </TabList>

                                <TabPanels flexGrow={1}>
                                    <TabPanel>
                                        <FgForm
                                            setProps={setFgProps}
                                            props={{ ...ForegroundTemplates[fgId].defaultProps, ...fgProps }}
                                            availableFeature={availableForAccount()}
                                            showPricing={showPricing}
                                        />
                                    </TabPanel>
                                    <TabPanel>
                                        <FormControl id="country">
                                            <FormLabel>Background type</FormLabel>
                                            <Select
                                                value={bgId}
                                                w="fit-content"
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
                                        <Box py="4">
                                            <Form
                                                setProps={(p) => {
                                                    setBgProps({ ...BackgroundTemplates[bgId].defaultProps, ...p });
                                                }}
                                                props={{ ...BackgroundTemplates[bgId].defaultProps, ...bgProps }}
                                                showPricing={showPricing}
                                                availableFeature={availableForAccount()}
                                            />
                                        </Box>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                            <HStack px="6">
                                <Checkbox
                                    colorScheme="purple"
                                    defaultChecked={watermark}
                                    isChecked={availableForAccount() ? watermark : true}
                                    size="lg"
                                    className={trackEvent('click', 'watermark-checkbox')}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        if (availableForAccount() === false) {
                                            pricingToggle();
                                        } else {
                                            setWatermark(!watermark);
                                        }
                                    }}
                                >
                                    Show watermark
                                </Checkbox>
                                <Box>
                                    {breakpoint === 'base' && (
                                        <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => pricingToggle()} />
                                    )}
                                    {breakpoint !== 'base' && (
                                        <Button
                                            leftIcon={<StarIcon />}
                                            colorScheme="teal"
                                            variant="ghost"
                                            onClick={() => pricingToggle()}
                                            className={trackEvent('click', 'premium-watermark-button')}
                                        >
                                            Premium
                                        </Button>
                                    )}
                                </Box>
                            </HStack>
                            <Flex justifyContent="space-between" direction={['column', 'row']}>
                                <Spacer />
                                <Button my="2">Get image</Button>
                            </Flex>
                        </Flex>
                    </SimpleGrid>
                </Flex>
                <Box pt="8">
                    <ShareToTwitter />
                </Box>
            </Container>
            <PaymentModal isOpen={pricingIsOpen} onClose={pricingClose} />
        </>
    );
}
