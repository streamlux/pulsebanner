import { Box, FormControl, FormLabel, SimpleGrid } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';
import { HexColorPicker } from 'react-colorful';

export const SolidBackground: LayerForm<typeof BackgroundComponents.SolidBackground> = ({ props, setProps }) => {
    return (
        <Box>
            <SimpleGrid columns={[1, 2]} spacing={9}>
                <FormControl>
                    <FormLabel>Color</FormLabel>
                    <HexColorPicker
                        color={props.color}
                        onChange={(newColor) => {
                            setProps({
                                ...props,
                                color: newColor,
                            });
                        }}
                    />
                </FormControl>
            </SimpleGrid>
        </Box>
    );
};
