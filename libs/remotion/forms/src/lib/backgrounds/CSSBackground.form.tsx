import { Box, chakra, Code, FormControl, FormHelperText, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';

export const CSSBackground: LayerForm<typeof BackgroundComponents.CSSBackground> = ({ props, setProps }) => {
    const [color, setColor] = useState('#aabbcc');
    const [color2, setColor2] = useState('#aabbcc');
    return (
        <Box>
            <SimpleGrid columns={[1, 2]} spacing={9}>
                <FormControl>
                    <FormLabel>Left color</FormLabel>
                    <HexColorPicker
                        color={color2}
                        onChange={(newColor) => {
                            setColor2(newColor);
                            setProps({
                                ...props,
                                style: {
                                    ...props.style,
                                    background: `linear-gradient(to right, ${color2} 0%, ${color} 100%)`,
                                },
                            });
                        }}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Right color</FormLabel>
                    <HexColorPicker
                        color={color}
                        onChange={(newColor) => {
                            setColor(newColor);
                            setProps({
                                ...props,
                                style: {
                                    ...props.style,
                                    background: `linear-gradient(to right, ${color2} 0%, ${color} 100%)`,
                                },
                            });
                        }}
                    />
                </FormControl>
            </SimpleGrid>
        </Box>
    );
};
