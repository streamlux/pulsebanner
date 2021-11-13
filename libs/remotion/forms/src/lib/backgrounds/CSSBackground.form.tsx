import { Box, chakra, Code, FormControl, FormHelperText, FormLabel } from '@chakra-ui/react';
import { BackgroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const CSSBackground: LayerForm<typeof BackgroundComponents.CSSBackground> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <FormControl id="url">
                <FormLabel>CSS Background</FormLabel>
                <Code as={chakra.pre}>{JSON.stringify(props.style, null, 4)}</Code>
                <FormHelperText>Enter a URL to an image to use.</FormHelperText>
            </FormControl>
        </Box>
    );
};
