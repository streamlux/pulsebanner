import { FormControl, FormLabel, Input, FormHelperText, Box, Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { Layer, LayerForm } from '../Layer';

type ImageBackgroundProps = {
    src?: string;
};

const defaultProps: ImageBackgroundProps = {
    src: 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500',
};

const ImageBackground: React.FC<ImageBackgroundProps> = ({ src }) => (
    <AbsoluteFill>
        <Img src={src ?? defaultProps.src} />
    </AbsoluteFill>
);

const Form: LayerForm<typeof ImageBackground> = ({ props, setProps }) => {
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

export default {
    component: ImageBackground,
    defaultProps: {
        src: 'https://pbs.twimg.com/profile_banners/114274827/1519942641/1500x500',
    },
    form: Form,
    name: 'Image background',
    description: 'Use any image as a background',
} as Layer<typeof ImageBackground>;
