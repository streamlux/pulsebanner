import { Box, FormControl, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

export const GradientBackground: LayerForm<typeof BackgroundComponents.GradientBackground> = ({ props, setProps }) => {
    return (
        <Box>
            <SimpleGrid columns={[1, 2]} spacing={9}>
                <FormControl>
                    <FormLabel>Left color</FormLabel>
                    <HexColorPicker
                        color={props.leftColor}
                        onChange={(newColor) => {
                            setProps({
                                ...props,
                                leftColor: newColor,
                            });
                        }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Right color</FormLabel>
                    <HexColorPicker
                        color={props.rightColor}
                        onChange={(newColor) => {
                            setProps({
                                ...props,
                                rightColor: newColor,
                            });
                        }}
                    />
                </FormControl>
            </SimpleGrid>
        </Box>
    );
};
