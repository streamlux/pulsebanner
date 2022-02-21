import { Box, Button, Center, Flex, Heading, SimpleGrid, Tag, Text, VStack, useColorMode } from '@chakra-ui/react';
import router from 'next/dist/client/router';
import React, { ReactElement, FC } from 'react';
import { Composer } from '../../../../libs/remotion/components/src';
import { RemotionPreview } from '../../../../libs/remotion/preview/src';
import { bannerPresets } from '@app/modules/banner/bannerPresets';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { PaymentPlan } from '@app/util/database/paymentHelpers';
import { MdLock } from 'react-icons/md';
import { trackEvent } from '@app/util/umami/trackEvent';

type BannerPresetListProps = {
    paymentPlan: PaymentPlan;
    showPricingIfFree: () => boolean;
};

type Foreground = keyof typeof ForegroundTemplates;
type Background = keyof typeof BackgroundTemplates;
interface BannerPresetProps {
    foreground: {
        id: Foreground;
        props: typeof ForegroundTemplates[Foreground]['defaultProps'];
    };
    background: {
        id: Background;
        props: typeof BackgroundTemplates[Background]['defaultProps'];
    };
}
interface BannerProps {
    foregroundId: Foreground;
    backgroundId: Background;
    foregroundProps: typeof ForegroundTemplates[Foreground]['defaultProps'];
    backgroundProps: typeof BackgroundTemplates[Background]['defaultProps'];
}

function convertToProps(preset: BannerPresetProps): BannerProps {
    return {
        foregroundId: preset.foreground.id,
        foregroundProps: preset.foreground.props,
        backgroundId: preset.background.id,
        backgroundProps: preset.background.props,
    };
}

export const BannerPresetListProps: FC<BannerPresetListProps> = ({ paymentPlan, showPricingIfFree }): ReactElement => {
    const { colorMode } = useColorMode();
    return (
        <>
            <Center>
                <VStack>
                    <Heading fontSize={'4xl'}>Twitch Live Banner</Heading>
                    <Heading fontSize={['lg', 'xl']} fontWeight="normal" as="h2" maxW="xl" textAlign={'center'}>
                        Banner automatically changes when you go live, and then automatically changes back!
                    </Heading>
                    <br />
                    <Heading fontSize={['xl', '3xl']}>Select a template to get started</Heading>
                    <Text fontSize={['lg', 'xl']} color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                        Then customize text, colors, background, and more!
                    </Text>
                </VStack>
            </Center>
            <SimpleGrid columns={[1, 2]} spacing={[4, 4, 10]} w="full" py="4">
                {Object.entries(bannerPresets).map(([key, preset]) => (
                    <Box key={key} experimental_spaceY={2} w="full">
                        <Center w="full" maxH="320px">
                            <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                                <Composer {...convertToProps(preset)} />
                            </RemotionPreview>
                        </Center>
                        <Flex w="full" px="4">
                            <Box w="full">
                                <Text fontSize={'lg'} fontWeight={'bold'}>
                                    {preset.displayName}
                                </Text>
                                {!preset.free && <Tag colorScheme={'green'}>Premium</Tag>}
                            </Box>
                            <Box>
                                <Button
                                    leftIcon={preset.free || paymentPlan !== 'Free' ? undefined : <MdLock />}
                                    // rightIcon={preset.free || paymentPlan !== 'Free' ? <FaArrowRight /> : undefined}
                                    colorScheme={'green'}
                                    onClick={() => {
                                        umami(`click-preset-${preset.name}`);
                                        if (!preset.free) {
                                            if (showPricingIfFree()) {
                                                router.push(`/banner?preset=${key}`, undefined, {
                                                    scroll: true,
                                                });
                                            }
                                        } else {
                                            router.push(`/banner?preset=${key}`, undefined, {
                                                scroll: true,
                                            });
                                        }
                                    }}
                                >
                                    {!preset.free && paymentPlan === 'Free' ? 'Unlock' : 'Select'}
                                </Button>
                            </Box>
                        </Flex>
                    </Box>
                ))}
            </SimpleGrid>
        </>
    );
};
