import { Box, Heading } from '@chakra-ui/react';
import { ForegroundComponents } from '@pulsebanner/remotion/components';
import { LayerForm } from '../LayerForm';

export const PartnerCodeWithMembershipImage: LayerForm<typeof ForegroundComponents.PartnerCodeWithMembershipImage> = ({ props, setProps }) => {
    return (
        <Box w="full">
            <Heading>New Partner Form</Heading>
        </Box>
    );
};
