import { Box, Heading } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const BasicPartnerImageWithCode: LayerForm<typeof ForegroundComponents.BasicPartnerImageWithCode> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <Heading>New Partner Form</Heading>
        </Box>
    );
};
