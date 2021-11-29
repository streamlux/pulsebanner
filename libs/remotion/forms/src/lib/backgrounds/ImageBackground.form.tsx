import React, { useState } from 'react';
import { Box, Button, ButtonGroup, FormControl, FormHelperText, FormLabel, Input, InputGroup, InputRightElement, Text, VStack } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { StarIcon } from '@chakra-ui/icons';

export const ImageBackground: LayerForm<typeof BackgroundComponents.ImageBackground> = ({ props, setProps, showPricing, availableFeature }) => {
    const [currentString, setCurrentString] = useState(props.src ?? '');

    const onClickPremium = () => {
        showPricing(true);
    };

    const sampleImageMap: Record<string, string> = {
        Sky: 'http://2.bp.blogspot.com/-QkeZcIm3X_g/VJRzwWkYfXI/AAAAAAAAJWg/HhIgNTT6PtM/s1600/clouds-1500x500-twitter-header-04.jpg',
        Rainbow: 'https://www.designbolts.com/wp-content/uploads/2014/06/Colorful-twitter-header-banner.jpg',
        Night: 'http://1.bp.blogspot.com/-K4otZmbNpuE/U5cZmaTVi8I/AAAAAAAAHZk/PSq3iuY9zdA/s1600/twitter-header-1500x500-nature+(1).jpg',
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
                        </ButtonGroup>
                    </VStack>
                </FormLabel>
                <FormLabel>
                    Background image URL{' '}
                    <Button variant="ghost" colorScheme="teal" onClick={onClickPremium} leftIcon={<StarIcon />}>
                        Premium
                    </Button>
                </FormLabel>
                <Input
                    disabled={availableFeature === false ? true : false}
                    title={!availableFeature ? 'Unlock with premium' : ''}
                    w="full"
                    type="url"
                    defaultValue={props.src ?? ''}
                    onChange={(e) => {
                        setCurrentString(e.target.value);
                        setProps({ ...(props ?? {}), src: e.target.value && e.target.value !== '' ? e.target.value : undefined });
                    }}
                />
                <Button disabled={availableFeature === false ? true : false} onClick={() => setProps({ ...(props ?? {}), src: currentString !== '' ? currentString : undefined })}>
                    Set Image URL
                </Button>
                <FormHelperText>Enter a URL to an image to use.</FormHelperText>
            </FormControl>
        </Box>
    );
};
