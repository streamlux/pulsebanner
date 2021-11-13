import { Box, Heading } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const TwitchStream: LayerForm<typeof ForegroundComponents.TwitchStream> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <Heading>Twitch stream form</Heading>
        </Box>
    );
};
