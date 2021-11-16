import { Box, Button, FormControl, FormHelperText, FormLabel, Heading, Input } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { useState } from 'react';
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
        </Box>
    );
};
