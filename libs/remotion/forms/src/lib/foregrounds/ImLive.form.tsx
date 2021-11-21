import { Box, Checkbox, FormControl, FormLabel, Input, Select, VStack } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const ImLive: LayerForm<typeof ForegroundComponents.ImLive> = ({ props, setProps, showPricing }) => {
    return (
        <Box w="full" experimental_spaceY={2}>
            <FormControl id="email" w="full">
                <FormLabel>Text</FormLabel>
                <Input
                    maxLength={36}
                    maxWidth="xs"
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
            <Checkbox
                p="2"
                colorScheme="purple"
                isChecked={props.arrow}
                size="lg"
                onChange={(e) => {
                    setProps({ ...props, arrow: !props.arrow });
                }}
            >
                Show arrow
            </Checkbox>
        </Box>
    );
};
