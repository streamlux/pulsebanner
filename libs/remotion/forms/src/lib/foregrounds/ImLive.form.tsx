import { Box, FormControl, FormLabel, Input, Select } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const ImLive: LayerForm<typeof ForegroundComponents.ImLive> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <FormControl id="email" w="full">
                <FormLabel>Text</FormLabel>
                <Input
                    type="text"
                    onChange={(e) => {
                        setProps({ ...props, text: e.target.value });
                    }}
                    defaultValue={props.text}
                />
            </FormControl>
            <FormControl id="fontColor" w="fit-content">
                <FormLabel>Text color</FormLabel>
                <Select placeholder="Select option" value={props.fontColor} onChange={(e) => setProps({ ...props, fontColor: e.target.value })}>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                </Select>
            </FormControl>
        </Box>
    );
};
