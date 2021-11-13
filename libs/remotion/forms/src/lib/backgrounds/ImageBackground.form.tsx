import React from 'react';
import { Box, FormControl, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const ImageBackground: LayerForm<typeof BackgroundComponents.ImageBackground> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <FormControl id="url">
                <FormLabel>Background image URL</FormLabel>
                <Input
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
