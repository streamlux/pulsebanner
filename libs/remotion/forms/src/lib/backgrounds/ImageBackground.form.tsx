import React, { useState } from 'react';
import { Box, Button, ButtonGroup, FormControl, FormHelperText, FormLabel, HStack, IconButton, Input, Text, useBreakpoint, VStack } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { StarIcon } from '@chakra-ui/icons';

export const ImageBackground: LayerForm<typeof BackgroundComponents.ImageBackground> = ({ props, setProps, showPricing, accountLevel }) => {
    const [currentString, setCurrentString] = useState(props.src ?? '');

    const onClickPremium = () => {
        showPricing(true);
    };

    const breakpoint = useBreakpoint();

    const sampleImageMap: Record<string, string> = {
        Sky: 'http://2.bp.blogspot.com/-QkeZcIm3X_g/VJRzwWkYfXI/AAAAAAAAJWg/HhIgNTT6PtM/s1600/clouds-1500x500-twitter-header-04.jpg',
        Rainbow: 'https://www.designbolts.com/wp-content/uploads/2014/06/Colorful-twitter-header-banner.jpg',
        Night: 'http://1.bp.blogspot.com/-K4otZmbNpuE/U5cZmaTVi8I/AAAAAAAAHZk/PSq3iuY9zdA/s1600/twitter-header-1500x500-nature+(1).jpg',
        EMGG: 'https://cdn.discordapp.com/attachments/922692527625220126/932410278132477972/emgg.png',
    };

    return (
        <Box w="full">
            <FormControl id="url">
                <FormLabel>
                    <VStack align="start">
                        <Text>Sample images</Text>
                        <ButtonGroup>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Sky'] })}>Sky</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Rainbow'] })}>Rainbow</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['Night'] })}>Night</Button>
                            <Button onClick={() => setProps({ ...(props ?? {}), src: sampleImageMap['EMGG'] })}>Night</Button>
                        </ButtonGroup>
                    </VStack>
                </FormLabel>
                <FormLabel>
                    <HStack>
                        <Text>Background image URL</Text>
                        <Box>
                            {breakpoint === 'base' && (
                                <IconButton w="min" aria-label="Premium" icon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)} />
                            )}
                            {breakpoint !== 'base' && (
                                <Button leftIcon={<StarIcon />} colorScheme="teal" variant="ghost" onClick={() => showPricing(true)}>
                                    Premium
                                </Button>
                            )}
                        </Box>
                    </HStack>
                </FormLabel>
                <Input
                    disabled={accountLevel === 'Free' ? true : false}
                    title={accountLevel === 'Free' ? 'Unlock with premium' : ''}
                    w="full"
                    type="url"
                    defaultValue={props.src ?? ''}
                    onChange={(e) => {
                        setCurrentString(e.target.value);
                        setProps({ ...(props ?? {}), src: e.target.value && e.target.value !== '' ? e.target.value : undefined });
                    }}
                />
                <Button disabled={accountLevel === 'Free' ? true : false} onClick={() => setProps({ ...(props ?? {}), src: currentString !== '' ? currentString : undefined })}>
                    Set Image URL
                </Button>
                <FormHelperText>Enter a URL to an image to use. Image size should be exactly 1500x500 for best appearance.</FormHelperText>
            </FormControl>
        </Box>
    );
};
