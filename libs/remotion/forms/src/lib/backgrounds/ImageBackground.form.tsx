import React from 'react';
import { Box, Button, FormControl, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { StarIcon } from '@chakra-ui/icons';

export const ImageBackground: LayerForm<typeof BackgroundComponents.ImageBackground> = ({ props, setProps, showPricing, availableFeature }) => {
    console.log('show pricing: ', availableFeature);

    const onClickPremium = () => {
        showPricing(true);
    };

    return (
        <Box w="full">
            <FormControl id="url">
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
                    onChange={(e) => setProps({ ...(props ?? {}), src: e.target.value && e.target.value !== '' ? e.target.value : undefined })}
                />
                <FormHelperText>Enter a URL to an image to use.</FormHelperText>
            </FormControl>
        </Box>
    );
};
