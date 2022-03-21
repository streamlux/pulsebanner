import { Box, Button, Center, Flex, Heading, SimpleGrid, Tag, Text, VStack, useColorMode, HStack, useBreakpointValue, Image, Tooltip } from '@chakra-ui/react';
import router from 'next/dist/client/router';
import React, { ReactElement, FC } from 'react';
import { Composer } from '../../../../libs/remotion/components/src';
import { RemotionPreview } from '../../../../libs/remotion/preview/src';
import { bannerPresets } from '@app/modules/banner/bannerPresets';
import { BackgroundTemplates, ForegroundTemplates } from '@pulsebanner/remotion/templates';
import { PaymentPlan } from '@app/services/payment/paymentHelpers';
import { MdLock } from 'react-icons/md';
import { landingPageAsset } from '@app/pages';
import { FaArrowRight } from 'react-icons/fa';

type BannerPresetListProps = {
    paymentPlan: PaymentPlan;
    showPricingIfFree: () => boolean;
    modal?: boolean;
    onSelect?: () => void;
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

export const BannerPresetList: FC<BannerPresetListProps> = ({ paymentPlan, showPricingIfFree, modal, onSelect }): ReactElement => {
    const { colorMode } = useColorMode();
    const responsiveValues = useBreakpointValue(
        {
            base: 'sm',
            sm: 'sm',
            md: 'md',
            lg: 'md',
            xl: 'md',
        },
        'sm'
    );
    return (
        <>
            {!modal && (
                <Center>
                    <VStack>
                        <Heading fontSize={['3xl', '4xl']}>Twitch Live Banner</Heading>
                        <Heading fontSize={['xl', '2xl']} fontWeight="normal" as="h2" maxW="4xl" textAlign={'center'} color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                            Automatically changes your Twitter banner when you go live, and then automatically changes back when you stop streaming!
                        </Heading>
                        <Center py="4">
                            <Box w={['128px', '172px']}>
                                {colorMode === 'dark' ? (
                                    <Image src={landingPageAsset('twitterxtwitch')} alt="Banner" />
                                ) : (
                                    <Image src={landingPageAsset('twitterxtwitch_light')} alt="Banner" />
                                )}
                            </Box>
                        </Center>

                        <Heading fontSize={['xl', '3xl']} textAlign="center">
                            Select a template to get started
                        </Heading>
                        <Text fontSize={['lg', 'xl']} color={colorMode === 'dark' ? 'gray.300' : 'gray.700'} textAlign="center">
                            Then customize text, colors, background, and more! ✨
                        </Text>
                    </VStack>
                </Center>
            )}
            <SimpleGrid columns={[1, 2]} spacing={[4, 4, 10]} w="full" py="4">
                {Object.entries(bannerPresets).map(([key, preset]) => (
                    <Box bg={colorMode === 'light' ? 'blackAlpha.100' : undefined} rounded="md" p="2" key={key} experimental_spaceY={2} w="full">
                        <Center w="full" maxH="320px">
                            <RemotionPreview compositionHeight={500} compositionWidth={1500}>
                                <Composer {...convertToProps(preset)} />
                            </RemotionPreview>
                        </Center>
                        <Flex w="full" px="2" alignItems={'stretch'} justifyContent={'space-between'}>
                            <Center>
                                <HStack>
                                    <Text fontSize={['md', 'md', 'lg']} fontWeight={'bold'} verticalAlign="center">
                                        {preset.displayName}{' '}
                                    </Text>
                                    {!preset.free && (
                                        <Tooltip label="Template uses premium features">
                                            <Tag colorScheme={'green'} size={responsiveValues}>
                                                Premium
                                            </Tag>
                                        </Tooltip>
                                    )}
                                </HStack>
                            </Center>

                            <Box>
                                <Button
                                    size={'sm'}
                                    leftIcon={preset.free || paymentPlan !== 'Free' ? undefined : <MdLock />}
                                    rightIcon={preset.free || paymentPlan !== 'Free' ? <FaArrowRight /> : undefined}
                                    colorScheme={'green'}
                                    onClick={() => {
                                        umami(`click-preset-${preset.name}`);
                                        if (!preset.free) {
                                            if (showPricingIfFree()) {
                                                router.push(`/banner?preset=${key}`, undefined, {
                                                    scroll: true,
                                                });
                                                onSelect?.();
                                            }
                                        } else {
                                            router.push(`/banner?preset=${key}`, undefined, {
                                                scroll: true,
                                            });
                                            onSelect?.();
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
